'use client'

import { useState, ChangeEvent } from 'react'
import Sidebar from '@/app/Components/sidebar'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import { DM_Sans } from 'next/font/google'
import toast, { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500','700'] })

const toNumber = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined || v === '') return 0
  if (typeof v === 'number') return v
  return Number(String(v).replace(/,/g, '').trim()) || 0
}

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

interface Product {
  id: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface FormDataModel {
  referenceNo: string
  ferencNo: string
  date: string
  status: string
  client: string
  company: string
  email?: string
  phone?: string
  address?: string
  sendingDate?: string
  receivingDate?: string
  preparedBy?: string
  salesPerson?: string
  projectName?: string
  subject?: string
  revision?: string
  revisionDate?: string
  notes?: string
  termsAndConditions?: string
  subtotal?: number
  gst?: number
  totalPrice?: number
  products?: Product[]
}

export default function UploadQuotationPage() {
  const [rawText, setRawText] = useState('')
  const currentDate = formatDate(new Date());
  const [form, setForm] = useState<FormDataModel>({
    referenceNo: '',
    ferencNo: '',
    date: currentDate,
    status: 'Sent',
    client: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    sendingDate: currentDate,
    receivingDate: currentDate,
    preparedBy: '',
    salesPerson: '',
    projectName: '',
    subject: '',
    revision: '',
    revisionDate: currentDate,
    notes: '',
    termsAndConditions: '',
    subtotal: 0,
    gst: 0,
    totalPrice: 0,
    products: []
  })

  const [sortKey, setSortKey] = useState<'itemName'|'quantity'|'unitPrice'|'totalPrice'>('itemName')
  const [quotationDocs, setQuotationDocs] = useState<File[]>([])
  const [technicalDrawings, setTechnicalDrawings] = useState<File[]>([])
  const [sldFile, setSldFile] = useState<File | null>(null)

const parseText = () => {
  try {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)

    // Extract date from text - look for common date patterns
    let extractedDate = currentDate; // Default to current date if not found
    
    // Look for various date patterns in the text
    const datePatterns = [
      /Date\s*:\s*([\d\/\-]+)/i,
      /Date\s*:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/,
      /([A-Za-z]+\s+\d{1,2},\s+\d{4})/
    ];
    
    for (const pattern of datePatterns) {
      const match = rawText.match(pattern);
      if (match) {
        try {
          const dateStr = match[1];
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            extractedDate = formatDate(parsedDate);
            break;
          }
        } catch {
          console.log('Failed to parse date:', match[1]);
        }
      }
    }

    const clientName = rawText.match(/Customer\s*:\s*(.+?)\s*Ref/i)?.[1] || 
                      rawText.match(/Customer\s*:\s*(.+)/i)?.[1] || 
                      rawText.match(/Company\s*:\s*(.+?)\s*Ref/i)?.[1] ||
                      rawText.match(/Company\s*:\s*(.+)/i)?.[1] || 
                      '-'
    const referenceNo = rawText.match(/Ref\s*No\.\s*:\s*([A-Z0-9-]+)/i)?.[1] || '-'
    const projectName = rawText.match(/Project:\s*(.+?)\s*Revision/i)?.[1] || '-'
    const revision = rawText.match(/Revision:\s*(R\d+)/i)?.[1] || '-'
    const subject = rawText.match(/Subject:\s*(.+?)\s*Rev\./i)?.[1] || '-'
    const revisionDateMatch = rawText.match(/Rev\. Date:\s*([\d\/\-]+)/i)?.[1]
    const revisionDate = revisionDateMatch ? formatDate(new Date(revisionDateMatch)) : extractedDate
    const companyName = rawText.match(/Company\s*:\s*(.+?)\s*Customer/i)?.[1] || 
                      rawText.match(/Company\s*:\s*(.+)/i)?.[1] || 
                      clientName

    const productLines = lines.filter(l => /^\d+\s*[-.]/.test(l) || /^\d{2}-/.test(l) || /^\d+\s+/.test(l))

    const parsed: Product[] = []
    productLines.forEach((line, idx) => {
      const cleaned = line.replace(/^\d+\s*[-.]?\s*/, '').trim()
      const numericMatches = cleaned.match(/(\d{1,3}(?:,\d{3})*|\d+)(?=\s|$)/g) || []
      const quantityMatch = cleaned.match(/\b(\d+)\s*No\b/i)
      const quantity = quantityMatch ? Number(quantityMatch[1]) : (numericMatches.length >= 3 ? toNumber(numericMatches[0]) : (numericMatches.length >= 2 ? toNumber(numericMatches[0]) : 0))
      const unitPrice = numericMatches.length >= 2 ? toNumber(numericMatches[numericMatches.length - 2]) : 0
      const totalPrice = numericMatches.length >= 1 ? toNumber(numericMatches[numericMatches.length - 1]) : 0

      const firstToken = cleaned.split(/\s+/)[0] || `ITEM-${idx+1}`

      parsed.push({
        id: `${Date.now()}-${idx}`,
        itemName: firstToken,
        quantity: quantity || 0,
        unitPrice,
        totalPrice
      })
    })

    const subtotal = parsed.reduce((s,p) => s + (p.totalPrice || 0), 0)
    const gst = Math.round(subtotal * 0.18)
    const totalPrice = subtotal + gst

    setForm(prev => ({
      ...prev,
      client: clientName,
      company: companyName,
      email: prev.email || '-',
      phone: prev.phone || '-',
      address: prev.address || '-',
      referenceNo,
      ferencNo: referenceNo,
      projectName,
      revision,
      subject,
      date: extractedDate, // Use the extracted date instead of currentDate
      revisionDate,
      subtotal,
      gst,
      totalPrice,
      products: parsed
    }))

    toast.success('Parsed successfully — products filled (you can edit them).')
  } catch (err) {
    console.error(err)
    toast.error('Failed to parse text')
  }
}

  const updateProduct = (id: string, patch: Partial<Product>) => {
    setForm(prev => {
      const products = (prev.products || []).map(p => p.id === id ? { ...p, ...patch, totalPrice: toNumber(patch.totalPrice ?? p.totalPrice ?? ((patch.quantity ?? p.quantity) * (patch.unitPrice ?? p.unitPrice))) } : p)
      const subtotal = products.reduce((s,p) => s + (p.totalPrice || 0), 0)
      const gst = Math.round(subtotal * 0.18)
      return { ...prev, products, subtotal, gst, totalPrice: subtotal + gst }
    })
  }

  const addProduct = () => {
    const newP: Product = { id: `${Date.now()}`, itemName: 'NEW-ITEM', quantity: 1, unitPrice: 0, totalPrice: 0 }
    setForm(prev => {
      const products = [...(prev.products || []), newP]
      const subtotal = products.reduce((s,p) => s + (p.totalPrice || 0), 0)
      const gst = Math.round(subtotal * 0.18)
      return { ...prev, products, subtotal, gst, totalPrice: subtotal + gst }
    })
  }

  const removeProduct = (id: string) => {
    setForm(prev => {
      const products = (prev.products || []).filter(p => p.id !== id)
      const subtotal = products.reduce((s,p) => s + (p.totalPrice || 0), 0)
      const gst = Math.round(subtotal * 0.18)
      return { ...prev, products, subtotal, gst, totalPrice: subtotal + gst }
    })
  }

  const setField = (k: keyof FormDataModel, v: string) => {
    // If setting the main date, update all other date fields to match
    if (k === 'date') {
      setForm(prev => ({ 
        ...prev, 
        [k]: v || '-',
        sendingDate: v || '-',
        receivingDate: v || '-',
        revisionDate: v || '-'
      }))
    } else {
      setForm(prev => ({ ...prev, [k]: v || '-' }))
    }
  }

  const setDateField = (k: keyof FormDataModel, v: string) => {
    setForm(prev => ({ ...prev, [k]: v || '-' }))
  }

  const syncAllDates = () => {
    setForm(prev => ({
      ...prev,
      sendingDate: prev.date,
      receivingDate: prev.date,
      revisionDate: prev.date
    }))
    toast.success('All dates synchronized with main date field');
  }

  const sortedProducts = [...(form.products || [])].sort((a,b) => {
    if (sortKey === 'itemName') return String(a.itemName).localeCompare(String(b.itemName))
    return (a[sortKey] as number) - (b[sortKey] as number)
  })

  const onQuotationDocsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setQuotationDocs(files)
  }
  const onDrawingsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setTechnicalDrawings(files)
  }
  const onSldChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSldFile(e.target.files?.[0] || null)
  }

  const submitToServer = async () => {
    try {
      if (!form.client) {
        toast.error('Please fill client name before submitting.')
        return
      }

      const payload = {
        ...form,
        referenceNo: form.referenceNo || '-',
        ferencNo: form.ferencNo || form.referenceNo || '-',
        client: form.client || '-',
        company: form.company || form.client || '-',
        email: form.email || '-',
        phone: form.phone || '-',
        address: form.address || '-',
        sendingDate: form.sendingDate || '-',
        receivingDate: form.receivingDate || '-',
        revisionDate: form.revisionDate || '-',
        products: (form.products || []).map(p => ({
          id: p.id,
          itemName: p.itemName || '-',
          quantity: p.quantity || 0,
          unitPrice: p.unitPrice || 0,
          totalPrice: p.totalPrice || 0
        }))
      }

      const fd = new FormData()
      fd.append('data', JSON.stringify(payload))

      quotationDocs.forEach((f) => fd.append('quotationDocs', f))
      technicalDrawings.forEach((f) => fd.append('technicalDrawings', f))
      if (sldFile) fd.append('sldFile', sldFile)

      const res = await fetch('/api/quotations', {
        method: 'POST',
        body: fd
      })

      const json = await res.json()
      if (!res.ok) {
        console.error('API error:', json)
        toast.error(json?.error || 'Failed to save quotation')
        return
      }

      toast.success('Quotation saved successfully!')
      setRawText('')
      setForm({
        referenceNo: '',
        ferencNo: '',
        date: currentDate,
        status: 'Draft',
        client: '',
        company: '',
        email: '-',
        phone: '-',
        address: '-',
        sendingDate: currentDate,
        receivingDate: currentDate,
        preparedBy: '-',
        salesPerson: '-',
        projectName: '-',
        subject: '-',
        revision: '-',
        revisionDate: currentDate,
        notes: '-',
        termsAndConditions: '-',
        subtotal: 0,
        gst: 0,
        totalPrice: 0,
        products: []
      })
      setQuotationDocs([])
      setTechnicalDrawings([])
      setSldFile(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit quotation')
    }
  }

  return (
    <ProtectedRoute allowedUser="director">
      <div className={`${dmSans.className} flex`}>
        <Sidebar />
        <div className="p-6 flex-1">
          <Toaster />
          <h1 className="text-2xl font-bold mb-6">Upload & Edit Quotation</h1>

          <label className="block mb-2 font-medium">Paste Quotation Text</label>
          <textarea
            className="w-full border p-3 rounded-lg mb-4 h-36"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste raw quotation here, then click Parse"
          />

          <div className="flex gap-3 mb-6">
            <button onClick={parseText} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Parse Quotation</button>
            <button onClick={addProduct} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">Add Product</button>
            <button onClick={syncAllDates} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Sync All Dates</button>
            <button onClick={submitToServer} className="bg-green-600 text-white px-4 py-2 rounded-lg">Submit to Server</button>
          </div>

          <section className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="font-semibold mb-2">Quotation Info</h2>
            <div className="grid grid-cols-2 gap-3">
              <input className="border p-2 rounded" placeholder="Reference No." value={form.referenceNo} onChange={e => setField('referenceNo', e.target.value)} />
              <input className="border p-2 rounded" placeholder="FERENC No." value={form.ferencNo} onChange={e => setField('ferencNo', e.target.value)} />
              <input className="border p-2 rounded" type="date" placeholder="Date" value={form.date} onChange={e => setField('date', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Client Name" value={form.client} onChange={e => setField('client', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Company Name" value={form.company} onChange={e => setField('company', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={e => setField('email', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Phone" value={form.phone} onChange={e => setField('phone', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Address" value={form.address} onChange={e => setField('address', e.target.value)} />
              <input className="border p-2 rounded" type="date" placeholder="Sent Date" value={form.sendingDate} onChange={e => setDateField('sendingDate', e.target.value)} />
              <input className="border p-2 rounded" type="date" placeholder="Receiving Date" value={form.receivingDate} onChange={e => setDateField('receivingDate', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Prepared By" value={form.preparedBy} onChange={e => setField('preparedBy', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Salesperson" value={form.salesPerson} onChange={e => setField('salesPerson', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Project Name" value={form.projectName} onChange={e => setField('projectName', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Subject" value={form.subject} onChange={e => setField('subject', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Revision" value={form.revision} onChange={e => setField('revision', e.target.value)} />
              <input className="border p-2 rounded" type="date" placeholder="Revision Date" value={form.revisionDate} onChange={e => setDateField('revisionDate', e.target.value)} />
            </div>
          </section>

          <section className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Products</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm">Sort:</label>
                <select value={sortKey} onChange={e => setSortKey(e.target.value as 'itemName'|'quantity'|'unitPrice'|'totalPrice')} className="border rounded p-2">
                  <option value="itemName">Name</option>
                  <option value="quantity">Quantity</option>
                  <option value="unitPrice">Unit Price</option>
                  <option value="totalPrice">Total</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Item</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Unit Price</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="border p-2">
                        <input className="w-full border p-1 rounded" value={p.itemName} onChange={e => updateProduct(p.id, { itemName: e.target.value || '-' })} />
                      </td>
                      <td className="border p-2 text-center">
                        <input type="number" className="w-20 border p-1 rounded text-center" value={p.quantity} onChange={e => {
                          const q = toNumber(e.target.value)
                          updateProduct(p.id, { quantity: q, totalPrice: q * p.unitPrice })
                        }} />
                      </td>
                      <td className="border p-2 text-right">
                        <input className="w-32 border p-1 rounded text-right" value={p.unitPrice} onChange={e => {
                          const up = toNumber(e.target.value)
                          updateProduct(p.id, { unitPrice: up, totalPrice: up * p.quantity })
                        }} />
                      </td>
                      <td className="border p-2 text-right">{p.totalPrice}</td>
                      <td className="border p-2 text-center">
                        <button className="text-red-500" onClick={() => removeProduct(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <p>Subtotal: {form.subtotal}</p>
              <p>GST: {form.gst}</p>
              <p className="font-bold">Total: {form.totalPrice}</p>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="font-semibold mb-2">Upload Files</h2>
            <div className="flex flex-col gap-3">
              <input type="file" multiple onChange={onQuotationDocsChange} />
              <input type="file" multiple onChange={onDrawingsChange} />
              <input type="file" onChange={onSldChange} />
            </div>
          </section>

        </div>
      </div>
    </ProtectedRoute>
  )
}