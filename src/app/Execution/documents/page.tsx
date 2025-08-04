'use client'

import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Execution/Components/sidebar'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

interface DocumentFile {
  _id: string
  title: string
  documentType: string
  relatedCustomer?: string
  relatedProject?: string
  fileUrl: string
  fileName: string
  uploadedBy: string
  uploadedDate: string
  notes?: string
}

export default function DocumentFilesPage() {
  const [files, setFiles] = useState<DocumentFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterType, _setFilterType] = useState('all')

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const query = `*[_type == "documentFile"] | order(uploadedDate desc) {
          _id,
          title,
          documentType,
          relatedCustomer,
          relatedProject,
          "fileUrl": uploadedFile.asset->url,
          "fileName": uploadedFile.asset->originalFilename,
          uploadedBy,
          uploadedDate,
          notes
        }`

        const result = await client.fetch<DocumentFile[]>(query)
        setFiles(result)
      } catch (err) {
        console.error('Failed to fetch document files', err)
        setError('Failed to load document files')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const filteredFiles = files.filter(file => {
    const matchesSearch = 
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.relatedCustomer && file.relatedCustomer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.relatedProject && file.relatedProject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.notes && file.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || file.documentType === filterType
    
    return matchesSearch && matchesType
  })

  const documentTypes = ['all', ...Array.from(new Set(files.map(file => file.documentType)))]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

if (isLoading) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedUser='execution'>
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Sidebar />
      <main className="max-w-6xl pt-16 pl-5 sm:pl-4 mx-auto px-4 py-10 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className={`text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
              Document Files
            </h1>
            <p className={`text-gray-600 ${dmSans.className}`}>
              Manage and access all uploaded document files
            </p>
          </div>
          {/* <Link 
            href="/studio/structure/documentFile"
            className="px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#A78B6F] transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Upload New
          </Link> */}
        </div>

        {/* Stats Overview - Moved to top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total Files</h3>
                <p className={`text-2xl font-bold mt-1 text-[#8B5E3C] ${dmSans.className}`}>
                  {files.length}
                </p>
              </div>
              <div className="bg-[#8B5E3C] bg-opacity-10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8B5E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Filtered Files</h3>
                <p className={`text-2xl font-bold mt-1 text-[#8B5E3C] ${dmSans.className}`}>
                  {filteredFiles.length}
                </p>
              </div>
              <div className="bg-[#8B5E3C] bg-opacity-10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8B5E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Document Types</h3>
                <p className={`text-2xl font-bold mt-1 text-[#8B5E3C] ${dmSans.className}`}>
                  {documentTypes.length - 1}
                </p>
              </div>
              <div className="bg-[#8B5E3C] bg-opacity-10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8B5E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className={`block text-sm font-medium text-gray-700 ${dmSans.className}`}>
              Search Documents
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by title, customer, project or notes..."
                className="focus:ring-[#8B5E3C] focus:border-[#8B5E3C] block w-full pl-10 pr-12 py-2 border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* <div>
            <label htmlFor="documentType" className={`block text-sm font-medium text-gray-700 ${dmSans.className}`}>
              Filter by Type
            </label>
            <select
              id="documentType"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#8B5E3C] focus:border-[#8B5E3C] rounded-md"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        {/* Files Table */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5E3C] uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5E3C] ppercase">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5E3C] uppercase">Customer/Project</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5E3C] uppercase">Uploaded By</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5E3C] uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-[#8B5E3C] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {/* <div className="flex-shrink-0 h-10 w-10 bg-[#8B5E3C] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8B5E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div> */}
                          <div>
                            <div className="font-medium pt-3 text-gray-900">{file.title}</div>
                            {file.notes && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{file.notes}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                          {file.documentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {file.relatedCustomer || '-'}
                        </div>
                        {file.relatedProject && (
                          <div className="text-sm text-gray-500">{file.relatedProject}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {file.uploadedBy}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(file.uploadedDate)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-4">
                          <a
                            href={file.fileUrl}
                            download={file.fileName}
                            className="text-[#8B5E3C] hover:text-[#A78B6F] flex items-center"
                            title="Download"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </a>
                          {/* <Link
                            href={`/documents/${file._id}`}
                            className="text-[#8B5E3C] hover:text-[#A78B6F] flex items-center"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </Link> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className={`mt-2 text-lg font-medium text-gray-900 ${dmSans.className}`}>
                        No documents found
                      </h3>
                      <p className={`mt-1 text-gray-500 ${dmSans.className}`}>
                        {searchTerm || filterType !== 'all' ? 
                          'Try adjusting your search or filter criteria' : 
                          'No documents have been uploaded yet'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}

export const dynamic = 'force-dynamic'