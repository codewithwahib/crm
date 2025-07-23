'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/app/Components/sidebar'
import { DM_Sans } from 'next/font/google'
import toast, { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default function AddDocumentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    documentType: '',
    relatedCustomer: '',
    relatedProject: '',
    notes: '',
    uploadedBy: '',
  })
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.documentType || !file) {
      toast.error('Title, Document Type & File are required!')
      return
    }

    setIsSubmitting(true)

    const formPayload = new FormData()
    formPayload.append('title', formData.title)
    formPayload.append('documentType', formData.documentType)
    formPayload.append('relatedCustomer', formData.relatedCustomer)
    formPayload.append('relatedProject', formData.relatedProject)
    formPayload.append('notes', formData.notes)
    formPayload.append('uploadedBy', formData.uploadedBy || 'Admin')
    formPayload.append('file', file)

    try {
      const res = await fetch('/api/documents/add', {
        method: 'POST',
        body: formPayload,
      })

      if (!res.ok) {
        throw new Error('Failed to upload document')
      }

      toast.success('✅ Document uploaded successfully!')
      router.push('/documents')
    } catch (error) {
      console.error(error)
      toast.error('❌ Failed to upload document')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen bg-white ${dmSans.variable} font-sans`}>
      <Sidebar />
      <Toaster position="top-right" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* ✅ Page Heading */}
        <h1 className={`text-3xl font-bold text-[#8B5E3C] mb-8 ${dmSans.className} tracking-wide`}>
          Upload New Document
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ✅ Basic Information Section */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-6 border-b pb-3 ${dmSans.className} tracking-wide`}>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Title */}
              <div className="h-24">
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className} tracking-wide`}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-md pl-2 border-gray-300 shadow-sm focus:ring-[#8B5E3C] focus:border-[#8B5E3C] h-10 text-black ${dmSans.className} tracking-wide`}
                />
              </div>

              {/* Document Type */}
              <div className="h-24">
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className} tracking-wide`}>
                  Document Type *
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#8B5E3C] focus:border-[#8B5E3C] h-10 bg-white text-black ${dmSans.className} tracking-wide`}
                >
                  <option value="" className="text-gray-500">Select a type</option>
                  <option value="Invoice" className="text-black">Invoice</option>
                  <option value="Contract" className="text-black">Contract</option>
                  <option value="Quotation" className="text-black">Quotation</option>
                  <option value="Report" className="text-black">Report</option>
                  <option value="Other" className="text-black">Other</option>
                </select>
              </div>

              {/* Related Customer */}
              <div className="h-24">
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className} tracking-wide`}>
                  Related Customer
                </label>
                <input
                  type="text"
                  name="relatedCustomer"
                  value={formData.relatedCustomer}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-2 rounded-md border-gray-300 shadow-sm focus:ring-[#8B5E3C] focus:border-[#8B5E3C] h-10 text-black ${dmSans.className} tracking-wide`}
                />
              </div>

              {/* Related Project */}
              <div className="h-24">
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className} tracking-wide`}>
                  Related Project
                </label>
                <input
                  type="text"
                  name="relatedProject"
                  value={formData.relatedProject}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md pl-2 border-gray-300 shadow-sm focus:ring-[#8B5E3C] focus:border-[#8B5E3C] h-10 text-black ${dmSans.className} tracking-wide`}
                />
              </div>

              {/* Uploaded By */}
              <div className="h-24">
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className} tracking-wide`}>
                  Uploaded By
                </label>
                <input
                  type="text"
                  name="uploadedBy"
                  value={formData.uploadedBy}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`mt-1 block w-full rounded-md pl-2 border-gray-300 shadow-sm focus:ring-[#8B5E3C] focus:border-[#8B5E3C] h-10 text-black ${dmSans.className} tracking-wide`}
                />
              </div>
            </div>
          </div>

          {/* ✅ Notes Section */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200 min-h-[300px]">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-6 border-b pb-3 ${dmSans.className} tracking-wide`}>
              Additional Notes
            </h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={6}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#8B5E3C] focus:border-[#8B5E3C] min-h-[200px] text-black ${dmSans.className} tracking-wide`}
            ></textarea>
          </div>

          {/* ✅ File Upload Section */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200 min-h-[250px]">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-6 border-b pb-3 ${dmSans.className} tracking-wide`}>
              Document File
            </h2>
            <div className="h-40 flex flex-col justify-center">
              <label className={`block text-sm font-medium text-gray-700 mb-3 ${dmSans.className} tracking-wide`}>
                Select File *
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className={`block w-full text-sm h-12 text-black ${dmSans.className} tracking-wide`}
              />
              {file && (
                <p className={`text-sm text-gray-500 mt-4 ${dmSans.className} tracking-wide`}>
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* ✅ Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-4 px-6 rounded-md bg-[#8B5E3C] text-white hover:bg-[#A78B6F] transition disabled:opacity-50 text-lg ${dmSans.className} tracking-wide font-medium`}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}