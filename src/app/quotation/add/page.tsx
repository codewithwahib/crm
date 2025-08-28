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
  discount: number
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
  discount: number
  gst: number
  total: number
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGSTChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubtotalChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTotalChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fontClass: string
}

interface AttachmentsSectionProps {
  quotationDocs: File[]
  technicalDrawings: File[]
  sldFile: File | null
  otherDocuments: File[]
  onQuotationUpload: (files: FileList | null) => void
  onDrawingUpload: (files: FileList | null) => void
  onSldUpload: (file: File | null) => void
  onOtherDocumentsUpload: (files: FileList | null) => void
  onRemoveQuotationDoc: (index: number) => void
  onRemoveDrawing: (index: number) => void
  onRemoveSld: () => void
  onRemoveOtherDocument: (index: number) => void
  fontClass: string
}

interface FileUploadProps {
  label: string
  multiple?: boolean
  files: File[]
  onUpload: (files: FileList | null) => void
  onRemove: (index: number) => void
  fontClass: string
}

interface SingleFileUploadProps {
  label: string
  file: File | null
  onUpload: (file: File | null) => void
  onRemove: () => void
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
    discount: 0,
    gst: 0,
    totalPrice: 0,
    termsAndConditions: '',
    notes: ''
  })

  const [products, setProducts] = useState<Product[]>([
    { itemName: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ])

  const [quotationDocs, setQuotationDocs] = useState<File[]>([])
  const [technicalDrawings, setTechnicalDrawings] = useState<File[]>([])
  const [sldFile, setSldFile] = useState<File | null>(null)
  const [otherDocuments, setOtherDocuments] = useState<File[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let processedValue = value
    
    // Capitalize each word for salesPerson and preparedBy fields
    if (name === 'salesPerson' || name === 'preparedBy') {
      processedValue = capitalizeWords(value)
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }))
  }

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updated = [...products]
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'totalPrice' ? Number(value) : value
    }
    setProducts(updated)
  }

  const addProductRow = () => {
    setProducts([...products, { itemName: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  const removeProductRow = (index: number) => {
    const updated = products.filter((_, i) => i !== index)
    setProducts(updated)
  }

  const handleSubtotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subtotalValue = Number(e.target.value)
    setFormData((prev) => ({ ...prev, subtotal: subtotalValue }))
  }

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalValue = Number(e.target.value)
    setFormData((prev) => ({ ...prev, totalPrice: totalValue }))
  }

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const discountValue = Number(e.target.value)
    setFormData((prev) => ({ ...prev, discount: discountValue }))
  }

  const handleGSTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gstValue = Number(e.target.value)
    setFormData((prev) => ({ ...prev, gst: gstValue }))
  }

  const handleFileUpload = (setter: React.Dispatch<React.SetStateAction<File[]>>, files: FileList | null) => {
    if (!files) return
    setter((prev) => [...prev, ...Array.from(files)])
  }

  const handleSldUpload = (file: File | null) => {
    if (!file) return
    setSldFile(file)
  }

  const handleRemoveFile = (setter: React.Dispatch<React.SetStateAction<File[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveSld = () => {
    setSldFile(null)
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
      otherDocuments.forEach(file => fd.append('otherDocuments', file))

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
              discount={formData.discount}
              gst={formData.gst}
              total={formData.totalPrice}
              onDiscountChange={handleDiscountChange}
              onGSTChange={handleGSTChange}
              onSubtotalChange={handleSubtotalChange}
              onTotalChange={handleTotalChange}
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
              otherDocuments={otherDocuments}
              onQuotationUpload={(f: FileList | null) => handleFileUpload(setQuotationDocs, f)}
              onDrawingUpload={(f: FileList | null) => handleFileUpload(setTechnicalDrawings, f)}
              onSldUpload={(f: File | null) => handleSldUpload(f)}
              onOtherDocumentsUpload={(f: FileList | null) => handleFileUpload(setOtherDocuments, f)}
              onRemoveQuotationDoc={(index: number) => handleRemoveFile(setQuotationDocs, index)}
              onRemoveDrawing={(index: number) => handleRemoveFile(setTechnicalDrawings, index)}
              onRemoveSld={handleRemoveSld}
              onRemoveOtherDocument={(index: number) => handleRemoveFile(setOtherDocuments, index)}
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

function ProductsSection({ products, onChange, onAdd, onRemove, subtotal, discount, gst, total, onDiscountChange, onGSTChange, onSubtotalChange, onTotalChange, fontClass }: ProductsSectionProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${fontClass} tracking-wide`}>Quoted Products</h2>
      
      {/* Column Headers */}
      <div className={`grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2 ${fontClass} tracking-wide`}>
        <div className="text-sm font-medium text-gray-700">Item Name *</div>
        <div className="text-sm font-medium text-gray-700">Description</div>
        <div className="text-sm font-medium text-gray-700">Quantity</div>
        <div className="text-sm font-medium text-gray-700">Unit Price</div>
        <div className="text-sm font-medium text-gray-700">Total Price</div>
      </div>
      
      {/* Product Rows */}
      {products.map((p, idx) => (
        <div key={idx} className={`grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2 ${fontClass} tracking-wide`}>
          <div>
            <input 
              placeholder="Item Name" 
              value={p.itemName} 
              onChange={(e) => onChange(idx, 'itemName', e.target.value)} 
              className={`w-full border p-2 rounded ${fontClass} tracking-wide`} 
              required 
            />
          </div>
          <div>
            <input 
              placeholder="Description" 
              value={p.description} 
              onChange={(e) => onChange(idx, 'description', e.target.value)} 
              className={`w-full border p-2 rounded ${fontClass} tracking-wide`} 
            />
          </div>
          <div>
            <input 
              type="number" 
              placeholder="Qty" 
              value={p.quantity} 
              min={1} 
              onChange={(e) => onChange(idx, 'quantity', e.target.value)} 
              className={`w-full border p-2 rounded ${fontClass} tracking-wide`} 
            />
          </div>
          <div>
            <input 
              type="number" 
              placeholder="Unit Price" 
              value={p.unitPrice} 
              onChange={(e) => onChange(idx, 'unitPrice', e.target.value)} 
              className={`w-full border p-2 rounded ${fontClass} tracking-wide`} 
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Total Price" 
              value={p.totalPrice} 
              onChange={(e) => onChange(idx, 'totalPrice', e.target.value)} 
              className={`w-full border p-2 rounded ${fontClass} tracking-wide`} 
            />
            {products.length > 1 && (
              <button 
                type="button" 
                onClick={() => onRemove(idx)} 
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
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
      
      {/* Totals Section */}
      <div className={`mt-6 pt-4 border-t ${fontClass} tracking-wide`}>
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium tracking-wide">Subtotal:</label>
              <input 
                type="number" 
                value={subtotal} 
                onChange={onSubtotalChange} 
                className={`border p-1 w-32 rounded text-right ${fontClass} tracking-wide`} 
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium tracking-wide">Discount:</label>
              <input 
                type="number" 
                value={discount} 
                onChange={onDiscountChange} 
                className={`border p-1 w-32 rounded text-right ${fontClass} tracking-wide`} 
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium tracking-wide">GST:</label>
              <input 
                type="number" 
                value={gst} 
                onChange={onGSTChange} 
                className={`border p-1 w-32 rounded text-right ${fontClass} tracking-wide`} 
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <label className="text-sm font-bold tracking-wide">Total:</label>
              <input 
                type="number" 
                value={total} 
                onChange={onTotalChange} 
                className={`border p-1 w-32 rounded text-right font-bold ${fontClass} tracking-wide`} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AttachmentsSection({ 
  quotationDocs, 
  technicalDrawings, 
  sldFile, 
  otherDocuments,
  onQuotationUpload, 
  onDrawingUpload, 
  onSldUpload, 
  onOtherDocumentsUpload,
  onRemoveQuotationDoc, 
  onRemoveDrawing, 
  onRemoveSld, 
  onRemoveOtherDocument,
  fontClass 
}: AttachmentsSectionProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${fontClass} tracking-wide`}>Attachments</h2>
      <FileUpload 
        label="Quotation Documents" 
        multiple 
        files={quotationDocs} 
        onUpload={onQuotationUpload} 
        onRemove={onRemoveQuotationDoc} 
        fontClass={fontClass} 
      />
      <FileUpload 
        label="Technical Drawings" 
        multiple 
        files={technicalDrawings} 
        onUpload={onDrawingUpload} 
        onRemove={onRemoveDrawing} 
        fontClass={fontClass} 
      />
      <SingleFileUpload 
        label="Single Line Diagram (SLD)" 
        file={sldFile} 
        onUpload={onSldUpload} 
        onRemove={onRemoveSld} 
        fontClass={fontClass} 
      />
      <FileUpload 
        label="Other Documents" 
        multiple 
        files={otherDocuments} 
        onUpload={onOtherDocumentsUpload} 
        onRemove={onRemoveOtherDocument} 
        fontClass={fontClass} 
      />
    </div>
  )
}

function FileUpload({ label, multiple, files, onUpload, onRemove, fontClass }: FileUploadProps) {
  return (
    <div className={`mb-4 ${fontClass} tracking-wide`}>
      <label className={`block font-medium text-sm mb-1 tracking-wide`}>{label}</label>
      <input 
        type="file" 
        multiple={multiple} 
        onChange={(e) => onUpload(e.target.files)} 
        className={`block w-full text-sm border rounded p-2 ${fontClass} tracking-wide`} 
      />
      {files.length > 0 && (
        <ul className={`mt-2 text-sm text-gray-600 ${fontClass} tracking-wide`}>
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between py-1 border-b">
              <span className="tracking-wide">📄 {f.name}</span>
              <button 
                type="button" 
                onClick={() => onRemove(i)}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Remove file"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SingleFileUpload({ label, file, onUpload, onRemove, fontClass }: SingleFileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpload(e.target.files?.[0] || null)
  }

  return (
    <div className={`mb-4 ${fontClass} tracking-wide`}>
      <label className={`block font-medium text-sm mb-1 tracking-wide`}>{label}</label>
      <input 
        type="file" 
        onChange={handleFileChange} 
        className={`block w-full text-sm border rounded p-2 ${fontClass} tracking-wide`} 
      />
      {file && (
        <div className="mt-2 flex items-center justify-between py-1 border-b">
          <span className="text-sm text-gray-600 tracking-wide">📄 {file.name}</span>
          <button 
            type="button" 
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 ml-2"
            title="Remove file"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}