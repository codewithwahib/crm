// File: /app/api/quotations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

// Define types for the quotation data
interface Product {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface QuotationData {
  referenceNo?: string;
  ferencNo?: string;
  date?: string;
  status?: string;
  client?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  projectName?: string;
  subject?: string;
  sendingDate?: string;
  receivingDate?: string;
  revision?: string;
  revisionDate?: string;
  salesPerson?: string;
  preparedBy?: string;
  products?: Product[];
  subtotal?: number;
  gst?: number;
  totalPrice?: number;
  termsAndConditions?: string;
  notes?: string;
}

// Initialize Sanity client
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

// Helper function to safely parse dates
function parseDate(dateString: string | null | undefined): string | undefined {
  if (!dateString || dateString === '-') return undefined
  
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date.toISOString()
  } catch {
    return undefined
  }
}

// Helper function to upload a single file
async function uploadFile(file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const asset = await client.assets.upload('file', buffer, {
      filename: file.name,
      contentType: file.type
    })
    
    return {
      _type: 'file',
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error(`Failed to upload file ${file.name}`)
  }
}

// Helper function to upload multiple files
async function uploadFiles(files: File[]) {
  const uploads = []
  
  for (const file of files) {
    if (file.size > 0) {
      const uploadedFile = await uploadFile(file)
      uploads.push(uploadedFile)
    }
  }
  
  return uploads
}

export async function POST(request: NextRequest) {
  try {
    // Check for Sanity token
    if (!process.env.SANITY_API_TOKEN) {
      console.error('SANITY_API_TOKEN is missing from environment variables')
      return NextResponse.json(
        { error: 'Server configuration error: Missing API token' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const data = formData.get('data') as string
    
    if (!data) {
      console.error('No data found in formData')
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      )
    }

    let quotationData: QuotationData;
    try {
      quotationData = JSON.parse(data)
      console.log('Parsed quotation data successfully')
    } catch (parseError: unknown) {
      console.error('Error parsing JSON data:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      )
    }
    
    // Extract file attachments
    const quotationDocs = formData.getAll('quotationDocs') as File[]
    const technicalDrawings = formData.getAll('technicalDrawings') as File[]
    const sldFile = formData.get('sldFile') as File | null
    
    console.log(`Found ${quotationDocs.length} quotation docs, ${technicalDrawings.length} drawings, and ${sldFile ? 'an' : 'no'} SLD file`)
    
    // Upload files to Sanity and get their references
    let quotationAttachments = []
    let drawingAttachments = []
    let sldDocument = undefined
    
    try {
      quotationAttachments = await uploadFiles(quotationDocs)
      drawingAttachments = await uploadFiles(technicalDrawings)
      if (sldFile) {
        sldDocument = await uploadFile(sldFile)
      }
      console.log('Files uploaded successfully')
    } catch (uploadError: unknown) {
      console.error('Error uploading files:', uploadError)
      // const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
      return NextResponse.json(
        { error: 'Failed to upload files' },
        { status: 500 }
      )
    }
    
    // Prepare the Sanity document with safe date parsing
    const sanityDocument = {
      _type: 'quotation',
      quotationId: quotationData.referenceNo || `Q-${Date.now()}`,
      referenceNo: quotationData.referenceNo || '',
      ferencNumber: quotationData.ferencNo || quotationData.referenceNo || 'Unknown',
      date: parseDate(quotationData.date) || new Date().toISOString(),
      status: quotationData.status || 'Sent',
      client: quotationData.client || '',
      company: quotationData.company || '',
      customerEmail: quotationData.email || '',
      customerPhone: quotationData.phone || '',
      address: quotationData.address || '',
      projectName: quotationData.projectName || '',
      subject: quotationData.subject || '',
      sentDate: parseDate(quotationData.sendingDate),
      receivingDate: parseDate(quotationData.receivingDate),
      revision: quotationData.revision || '',
      revisionDate: parseDate(quotationData.revisionDate),
      salesPerson: quotationData.salesPerson || '',
      preparedBy: quotationData.preparedBy || '',
      products: (quotationData.products || []).map((product: Product) => ({
        _type: 'object',
        _key: product.id || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemName: product.itemName || 'Unnamed Item',
        quantity: product.quantity || 0,
        unitPrice: product.unitPrice || 0,
        totalPrice: product.totalPrice || 0
      })),
      subtotal: quotationData.subtotal || 0,
      gst: quotationData.gst || 0,
      totalPrice: quotationData.totalPrice || 0,
      termsAndConditions: quotationData.termsAndConditions || '',
      quotationAttachments,
      drawingAttachments,
      sldDocument,
      notes: quotationData.notes || ''
    }

    console.log('Prepared Sanity document with safe date handling')

    // Create the document in Sanity
    try {
      const result = await client.create(sanityDocument)
      console.log('Quotation created successfully with ID:', result._id)
      
      return NextResponse.json({
        success: true,
        id: result._id,
        message: 'Quotation created successfully'
      })
    } catch (createError: unknown) {
      console.error('Error creating document in Sanity:', createError)
      const errorMessage = createError instanceof Error ? createError.message : 'Unknown creation error';
      return NextResponse.json(
        { error: 'Failed to create document in Sanity: ' + errorMessage },
        { status: 500 }
      )
    }

  } catch (error: unknown) {
    console.error('Unexpected error in quotation creation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create quotation: ' + errorMessage },
      { status: 500 }
    )
  }
}