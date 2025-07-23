import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/sanity.client'
import { v4 as uuidv4 } from 'uuid'

// ✅ Enable edge runtime if you want faster API
export const runtime = 'nodejs' 

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    // ✅ Extract main JSON payload
    const dataStr = formData.get('data') as string
    if (!dataStr) {
      return NextResponse.json({ error: 'Missing quotation data' }, { status: 400 })
    }
    const parsedData = JSON.parse(dataStr)

    // ✅ Extract file uploads
    const quotationDocs = formData.getAll('quotationDocs') as File[]
    const technicalDrawings = formData.getAll('technicalDrawings') as File[]
    const sldFile = formData.get('sldFile') as File | null

    // ✅ Helper: Upload a single file to Sanity
    const uploadFile = async (file: File) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      return await writeClient.assets.upload('file', buffer, {
        filename: file.name,
        contentType: file.type || 'application/octet-stream'
      })
    }

    // ✅ Upload all files
    const quotationDocAssets = await Promise.all(
      quotationDocs.map(async (file) => {
        const asset = await uploadFile(file)
        return { _type: 'file', asset: { _type: 'reference', _ref: asset._id } }
      })
    )

    const drawingAssets = await Promise.all(
      technicalDrawings.map(async (file) => {
        const asset = await uploadFile(file)
        return { _type: 'file', asset: { _type: 'reference', _ref: asset._id } }
      })
    )

    let sldAssetRef = null
    if (sldFile) {
      const asset = await uploadFile(sldFile)
      sldAssetRef = { _type: 'file', asset: { _type: 'reference', _ref: asset._id } }
    }

    // ✅ Convert termsAndConditions (string) → portable text array
    const termsBlocks = parsedData.termsAndConditions
      ? [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: parsedData.termsAndConditions,
                marks: []
              }
            ]
          }
        ]
      : []

    // ✅ Create document payload for Sanity
    const quotationDoc = {
      _type: 'quotation',
      quotationId: parsedData.quotationId,
      referenceNo: parsedData.referenceNo,
      ferencNumber: parsedData.ferencNumber || '',
      date: parsedData.date ? new Date(parsedData.date).toISOString() : new Date().toISOString(),
      status: parsedData.status || 'Draft',
      client: parsedData.client,
      company: parsedData.company || '',
      customerEmail: parsedData.customerEmail || '',
      customerPhone: parsedData.customerPhone || '',
      address: parsedData.address || '',
      projectName: parsedData.projectName || '',
      subject: parsedData.subject || '',
      sentDate: parsedData.sentDate ? new Date(parsedData.sentDate).toISOString() : null,
      receivingDate: parsedData.receivingDate ? new Date(parsedData.receivingDate).toISOString() : null,
      revision: parsedData.revision || '',
      revisionDate: parsedData.revisionDate ? new Date(parsedData.revisionDate).toISOString() : null,
      salesPerson: parsedData.salesPerson || '',
      preparedBy: parsedData.preparedBy || '',
      subtotal: parsedData.subtotal || 0,
      gst: parsedData.gst || 0,
      totalPrice: parsedData.totalPrice || 0,
      termsAndConditions: termsBlocks,
      notes: parsedData.notes || '',

      // ✅ Products array
      products: (parsedData.products || []).map((p: any) => ({
        _key: uuidv4(),
        _type: 'object',
        itemName: p.itemName,
        description: p.description || '',
        quantity: p.quantity || 1,
        unitPrice: p.unitPrice || 0,
        totalPrice: p.totalPrice || p.quantity * p.unitPrice
      })),

      // ✅ Attachments
      quotationAttachments: quotationDocAssets,
      drawingAttachments: drawingAssets,
      sldDocument: sldAssetRef
    }

    // ✅ Save quotation in Sanity
    const createdQuotation = await writeClient.create(quotationDoc)

    return NextResponse.json({ success: true, quotation: createdQuotation })
  } catch (err: any) {
    console.error('❌ Quotation API error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to save quotation' },
      { status: 500 }
    )
  }
}
