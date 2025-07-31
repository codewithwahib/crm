'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/app/Components/sidebar'
import { DM_Sans } from 'next/font/google'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import toast, { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

interface FormData {
  quotationId: string
  referenceNo: string
  ferencNumber: string
  date: string
  status: string
  client: string
  company: string
  customerEmail: string
  customerPhone: string
  address: string
  projectName: string
  subject: string
  sentDate: string
  receivingDate: string
  revision: string
  revisionDate: string
  salesPerson: string
  preparedBy: string
  subtotal: number
  gst: number
  totalPrice: number
  termsAndConditions: string
  notes: string
}

interface Product {
  itemName: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  fontClass: string
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  fontClass: string
}

interface SelectFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: string[]
  fontClass: string
}

interface ProductsSectionProps {
  products: Product[]
  onChange: (index: number, field: string, value: string | number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  subtotal: number
  gst: number
  total: number
  onGSTChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fontClass: string
}

interface AttachmentsSectionProps {
  quotationDocs: File[]
  technicalDrawings: File[]
  sldFile: File | null
  onQuotationUpload: (files: FileList | null) => void
  onDrawingUpload: (files: FileList | null) => void
  onSldUpload: (file: File | null) => void
  fontClass: string
}

interface FileUploadProps {
  label: string
  multiple?: boolean
  files: File[]
  onUpload: (files: FileList | null) => void
  fontClass: string
}

export default function AddQuotation() {
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    quotationId: '',
    referenceNo: '',
    ferencNumber: '',
    date: '',
    status: 'Draft',
    client: '',
    company: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    projectName: '',
    subject: '',
    sentDate: '',
    receivingDate: '',
    revision: '',
    revisionDate: '',
    salesPerson: '',
    preparedBy: '',
    subtotal: 0,
    gst: 0,
    totalPrice: 0,
    termsAndConditions: '',
    notes: ''
  })

  const [products, setProducts] = useState<Product[]>([
    { itemName: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ])

  const [quotationDocs, setQuotationDocs] = useState<File[]>([])
  // const [isLoading] = useState(true)
  const [technicalDrawings, setTechnicalDrawings] = useState<File[]>([])
  const [sldFile, setSldFile] = useState<File | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updated = [...products]
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value
    }
    updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice
    setProducts(updated)
    recalcTotals(updated, formData.gst)
  }

  const addProductRow = () => {
    setProducts([...products, { itemName: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  const removeProductRow = (index: number) => {
    const updated = products.filter((_, i) => i !== index)
    setProducts(updated)
    recalcTotals(updated, formData.gst)
  }

  const recalcTotals = (prodList = products, gstValue = formData.gst) => {
    const subtotal = prodList.reduce((sum, p) => sum + (p.totalPrice || 0), 0)
    const total = subtotal + Number(gstValue || 0)
    setFormData((prev) => ({ ...prev, subtotal, totalPrice: total }))
  }

  const handleGSTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gstValue = Number(e.target.value)
    setFormData((prev) => ({ ...prev, gst: gstValue }))
    recalcTotals(products, gstValue)
  }

  const handleFileUpload = (setter: React.Dispatch<React.SetStateAction<File[]>>, files: FileList | null) => {
    if (!files) return
    setter((prev) => [...prev, ...Array.from(files)])
  }

  const handleSldUpload = (file: File | null) => {
    if (!file) return
    setSldFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.quotationId || !formData.referenceNo || !formData.client || !formData.date) {
      setError('Quotation ID, Reference No, Client, and Date are required!')
      toast.error('Missing required fields')
      return
    }
    if (products.length === 0 || products.some(p => !p.itemName)) {
      setError('At least one valid product is required')
      toast.error('Add at least one product')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('data', JSON.stringify({ ...formData, products }))

      quotationDocs.forEach(file => fd.append('quotationDocs', file))
      technicalDrawings.forEach(file => fd.append('technicalDrawings', file))
      if (sldFile) fd.append('sldFile', sldFile)

      const res = await fetch('/api/quotation', { method: 'POST', body: fd })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save quotation')
      }

      toast.success('Quotation saved successfully!', { duration: 4000, position: 'top-center' })
      router.push('/quotation')
    } catch (err) {
      console.error('Error saving quotation:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save quotation'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

//    if (isLoading) {
//   return (
//     <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.className} font-sans`}>
//       <div className="flex flex-col items-center space-y-4">
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
//       </div>
//     </div>
//   );
// }

  return (
    <ProtectedRoute allowedUser='director'>
    <div className="min-h-screen bg-white text-gray-800">
      <Toaster />
      <Sidebar />
      <main className="max-w-5xl pt-16 mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold text-[#8B5E3C] ${dmSans.className} tracking-wide`}>
          Add New Quotation
        </h1>

        {error && (
          <div className={`mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md text-sm ${dmSans.className} tracking-wide`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Quotation ID *" name="quotationId" value={formData.quotationId} onChange={handleChange} required fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Reference No *" name="referenceNo" value={formData.referenceNo} onChange={handleChange} required fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="FERENC Number" name="ferencNumber" value={formData.ferencNumber} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Date *" type="date" name="date" value={formData.date} onChange={handleChange} required fontClass={`${dmSans.className} tracking-wide`} />
              <SelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']}
                fontClass={`${dmSans.className} tracking-wide`}
              />
              <InputField label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Client *" name="client" value={formData.client} onChange={handleChange} required fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Company" name="company" value={formData.company} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Customer Email" type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Customer Phone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <TextareaField label="Address" name="address" value={formData.address} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
            </div>
          </div>

          {/* Quotation Meta */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Quotation Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Subject" name="subject" value={formData.subject} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Sent Date" type="date" name="sentDate" value={formData.sentDate} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Receiving Date" type="date" name="receivingDate" value={formData.receivingDate} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Revision No." name="revision" value={formData.revision} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Revision Date" type="date" name="revisionDate" value={formData.revisionDate} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Sales Person" name="salesPerson" value={formData.salesPerson} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
              <InputField label="Prepared By" name="preparedBy" value={formData.preparedBy} onChange={handleChange} fontClass={`${dmSans.className} tracking-wide`} />
            </div>
          </div>

          {/* Products */}
          <ProductsSection
            products={products}
            onChange={handleProductChange}
            onAdd={addProductRow}
            onRemove={removeProductRow}
            subtotal={formData.subtotal}
            gst={formData.gst}
            total={formData.totalPrice}
            onGSTChange={handleGSTChange}
            fontClass={`${dmSans.className} tracking-wide`}
          />

          {/* Terms & Notes */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <TextareaField label="Terms & Conditions" name="termsAndConditions" value={formData.termsAndConditions} onChange={handleChange} rows={4} fontClass={`${dmSans.className} tracking-wide`} />
            <TextareaField label="Internal Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} fontClass={`${dmSans.className} tracking-wide`} />
          </div>

          {/* Attachments */}
          <AttachmentsSection
            quotationDocs={quotationDocs}
            technicalDrawings={technicalDrawings}
            sldFile={sldFile}
            onQuotationUpload={(f: FileList | null) => handleFileUpload(setQuotationDocs, f)}
            onDrawingUpload={(f: FileList | null) => handleFileUpload(setTechnicalDrawings, f)}
            onSldUpload={(f: File | null) => handleSldUpload(f)}
            fontClass={`${dmSans.className} tracking-wide`}
          />

          {/* Submit */}
          <div className={`flex justify-end gap-3 pt-4 border-t ${dmSans.className} tracking-wide`}>
            <button
              type="button"
              onClick={() => router.push('/quotation')}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 tracking-wide"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] disabled:opacity-50 tracking-wide"
            >
              {isSubmitting ? 'Saving...' : 'Save Quotation'}
            </button>
          </div>
        </form>
      </main>
    </div>
    </ProtectedRoute>
  )
}

function InputField({ label, fontClass, ...props }: InputFieldProps) {
  return (
    <div className={`${fontClass} tracking-wide`}>
      <label className="block text-sm font-medium mb-1 tracking-wide">{label}</label>
      <input {...props} className={`w-full border border-gray-300 rounded-md p-2 ${fontClass} tracking-wide`} />
    </div>
  )
}

function TextareaField({ label, fontClass, ...props }: TextareaFieldProps) {
  return (
    <div className={`sm:col-span-2 ${fontClass} tracking-wide`}>
      <label className="block text-sm font-medium mb-1 tracking-wide">{label}</label>
      <textarea {...props} className={`w-full border border-gray-300 rounded-md p-2 ${fontClass} tracking-wide`} />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options, fontClass }: SelectFieldProps) {
  return (
    <div className={`${fontClass} tracking-wide`}>
      <label className="block text-sm font-medium mb-1 tracking-wide">{label}</label>
      <select name={name} value={value} onChange={onChange} className={`w-full border rounded-md p-2 ${fontClass} tracking-wide`}>
        {options.map((opt) => (
          <option key={opt} value={opt} className={`${fontClass} tracking-wide`}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function ProductsSection({ products, onChange, onAdd, onRemove, subtotal, gst, total, onGSTChange, fontClass }: ProductsSectionProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${fontClass} tracking-wide`}>Quoted Products</h2>
      {products.map((p, idx) => (
        <div key={idx} className={`grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2 ${fontClass} tracking-wide`}>
          <input placeholder="Item Name" value={p.itemName} onChange={(e) => onChange(idx, 'itemName', e.target.value)} className={`border p-2 rounded ${fontClass} tracking-wide`} required />
          <input placeholder="Description" value={p.description} onChange={(e) => onChange(idx, 'description', e.target.value)} className={`border p-2 rounded ${fontClass} tracking-wide`} />
          <input type="number" placeholder="Qty" value={p.quantity} min={1} onChange={(e) => onChange(idx, 'quantity', e.target.value)} className={`border p-2 rounded ${fontClass} tracking-wide`} />
          <input type="number" placeholder="Unit Price" value={p.unitPrice} onChange={(e) => onChange(idx, 'unitPrice', e.target.value)} className={`border p-2 rounded ${fontClass} tracking-wide`} />
          <div className={`flex justify-between items-center ${fontClass} tracking-wide`}>
            <span className="text-sm font-semibold tracking-wide">{p.totalPrice.toFixed(2)}</span>
            {products.length > 1 && (
              <button type="button" onClick={() => onRemove(idx)} className="text-red-500 text-xs hover:underline tracking-wide">
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className={`mt-2 px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200 ${fontClass} tracking-wide`}
      >
        + Add Product
      </button>
      <div className={`mt-4 text-right ${fontClass} tracking-wide`}>
        <p>Subtotal: <strong>{subtotal.toFixed(2)}</strong></p>
        <div className="flex justify-end gap-2 items-center">
          <label className="text-sm tracking-wide">GST:</label>
          <input type="number" value={gst} onChange={onGSTChange} className={`border p-1 w-20 rounded text-right ${fontClass} tracking-wide`} />
        </div>
        <p className="mt-1 font-bold tracking-wide">Total: {total.toFixed(2)}</p>
      </div>
    </div>
    
  )
}

function AttachmentsSection({ quotationDocs, technicalDrawings, sldFile, onQuotationUpload, onDrawingUpload, onSldUpload, fontClass }: AttachmentsSectionProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${fontClass} tracking-wide`}>Attachments</h2>
      <FileUpload label="Quotation Documents" multiple files={quotationDocs} onUpload={onQuotationUpload} fontClass={fontClass} />
      <FileUpload label="Technical Drawings" multiple files={technicalDrawings} onUpload={onDrawingUpload} fontClass={fontClass} />
      <FileUpload label="Single Line Diagram (SLD)" files={sldFile ? [sldFile] : []} onUpload={(files) => onSldUpload(files?.[0] || null)} fontClass={fontClass} />
    </div>
  )
}

function FileUpload({ label, multiple, files, onUpload, fontClass }: FileUploadProps) {
  return (
    <div className={`mb-4 ${fontClass} tracking-wide`}>
      <label className={`block font-medium text-sm mb-1 tracking-wide`}>{label}</label>
      <input 
        type="file" 
        multiple={multiple} 
        onChange={(e) => onUpload(e.target.files)} 
        className={`block w-full text-sm border rounded p-2 ${fontClass} tracking-wide`} 
      />
      {files?.length > 0 && (
        <ul className={`mt-2 text-sm text-gray-600 ${fontClass} tracking-wide`}>
          {files.map((f, i) => (
            <li key={i} className="tracking-wide">📄 {f.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}