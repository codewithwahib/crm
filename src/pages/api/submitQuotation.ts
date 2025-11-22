import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'
import formidable from 'formidable'
import fs from 'fs'
import { projectId, dataset, apiVersion } from '@/sanity/env'

export const config = {
  api: {
    bodyParser: false, // use formidable
  },
}

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

const uploadFileToSanity = async (filePath: string, fileName: string) => {
  const data = fs.readFileSync(filePath)
  const res = await sanityClient.assets.upload('file', data, { filename: fileName })
  return res._id
}

interface Product {
  itemName?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
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
  sendingDate?: string;
  receivingDate?: string;
  preparedBy?: string;
  salesPerson?: string;
  projectName?: string;
  subject?: string;
  revision?: string;
  revisionDate?: string;
  notes?: string;
  termsAndConditions?: string;
  subtotal?: number;
  gst?: number;
  totalPrice?: number;
  products?: Product[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const form = new formidable.IncomingForm({ multiples: true, keepExtensions: true })
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: 'Form parsing error' })

      // Fix: Handle the case where fields.data could be string[] or string
      const dataField = fields.data;
      let data: QuotationData = {};
      
      if (Array.isArray(dataField)) {
        // If it's an array, take the first element
        data = JSON.parse(dataField[0] as string);
      } else if (typeof dataField === 'string') {
        // If it's a string, parse it directly
        data = JSON.parse(dataField);
      } else {
        return res.status(400).json({ error: 'Invalid data format' });
      }

      // Files upload
      const quotationDocsIds: string[] = []
      const technicalDrawingsIds: string[] = []
      let sldFileId: string | undefined

      if (files.quotationDocs) {
        const docs = Array.isArray(files.quotationDocs) ? files.quotationDocs : [files.quotationDocs]
        for (const f of docs) {
          const id = await uploadFileToSanity(f.filepath, f.originalFilename || 'quotation')
          quotationDocsIds.push(id)
        }
      }

      if (files.technicalDrawings) {
        const drawings = Array.isArray(files.technicalDrawings) ? files.technicalDrawings : [files.technicalDrawings]
        for (const f of drawings) {
          const id = await uploadFileToSanity(f.filepath, f.originalFilename || 'drawing')
          technicalDrawingsIds.push(id)
        }
      }

      if (files.sldFile) {
        const sldFile = Array.isArray(files.sldFile) ? files.sldFile[0] : files.sldFile
        sldFileId = await uploadFileToSanity(sldFile.filepath, sldFile.originalFilename || 'sld')
      }

      // Prepare document
      const doc = {
        _type: 'quotation',
        referenceNo: data.referenceNo || '-',
        ferencNo: data.referenceNo || '-', // same as referenceNo
        date: data.date || new Date().toISOString(),
        status: data.status || 'Draft',
        client: data.client || '-',
        company: data.client || '-', // same as client
        email: data.email || '-',
        phone: data.phone || '-',
        address: data.address || '-',
        sendingDate: data.sendingDate || '-',
        receivingDate: data.receivingDate || '-',
        preparedBy: data.preparedBy || '-',
        salesPerson: data.salesPerson || '-',
        projectName: data.projectName || '-',
        subject: data.subject || '-',
        revision: data.revision || '-',
        revisionDate: data.revisionDate || '-',
        notes: data.notes || '-',
        termsAndConditions: data.termsAndConditions || '-',
        subtotal: data.subtotal || 0,
        gst: data.gst || 0,
        totalPrice: data.totalPrice || 0,
        products: (data.products || []).map((p: Product) => ({
          itemName: p.itemName || '-',
          description: p.description || '-',
          quantity: p.quantity || 0,
          unitPrice: p.unitPrice || 0,
          totalPrice: p.totalPrice || 0,
        })),
        quotationDocs: quotationDocsIds.map(id => ({ _type: 'reference', _ref: id })),
        technicalDrawings: technicalDrawingsIds.map(id => ({ _type: 'reference', _ref: id })),
        sldFile: sldFileId ? { _type: 'reference', _ref: sldFileId } : undefined,
      }

      const created = await sanityClient.create(doc)
      return res.status(200).json({ message: 'Quotation submitted', id: created._id })
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to submit quotation' })
  }
}