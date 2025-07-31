'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import Sidebar from '@/app/Execution/Components/sidebar'
import { HiSearch, HiX, HiChevronDown, HiChevronUp } from "react-icons/hi"
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

interface Quotation {
  quotationId: string
  referenceNo: string
  date: string
  salesPerson?: string | null
  company?: string | null
  status?: string | null
  projectName?: string | null
}

async function getQuotations(): Promise<Quotation[]> {
  const query = `
    *[_type == "quotation"] | order(date asc, _createdAt asc) {
      quotationId,
      referenceNo,
      date,
      salesPerson,
      company,
      status,
      projectName
    }
  `
  try {
    return await client.fetch(query)
  } catch (err) {
    console.error('❌ Failed to fetch quotations:', err)
    return []
  }
}

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [expandedQuotation, setExpandedQuotation] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const data = await getQuotations()
      setQuotations(data)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const filteredQuotations = quotations.filter((q) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const fieldsToSearch = [
      q.quotationId?.toLowerCase() || '',
      q.referenceNo?.toLowerCase() || '',
      q.company?.toLowerCase() || '',
      q.projectName?.toLowerCase() || '',
      q.salesPerson?.toLowerCase() || '',
      q.status?.toLowerCase() || '',
      q.date ? new Date(q.date).toLocaleDateString().toLowerCase() : '',
    ]
    return fieldsToSearch.some((field) => field.includes(term))
  })

  const toggleExpand = (quotationId: string) => {
    setExpandedQuotation(expandedQuotation === quotationId ? null : quotationId)
  }

  if (isLoading) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.className} font-sans`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
      </div>
    </div>
  );
}

  return (
    <ProtectedRoute allowedUser='execution'>
    <div className={`min-h-screen bg-white text-black ${dmSans.className} tracking-wide`}>
      <Sidebar />

      <main className="max-w-6xl mx-auto px-4 py-6 lg:pl-8">
        {/* Header with search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 sm:pt-0">
          <h1 className={`text-2xl sm:text-3xl pt-9 font-bold text-[#8B5E3C]`}>
            All Quotations
          </h1>

          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <HiSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search quotations..."
              className={`w-full pl-10 pr-20 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-14 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
            <button className="absolute right-1.5 top-1.5 px-3 py-1.5 text-sm bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition">
              Search
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5E3C]" />
          </div>
        ) : isMobileView ? (
          // Mobile view - cards
          <div className="space-y-4">
            {filteredQuotations.length > 0 ? (
              filteredQuotations.map((q) => {
                const status = q.status || 'Draft'
                const statusClass =
                  status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                  status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                  status === 'Accepted' ? 'bg-green-100 text-green-700' :
                  status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'

                return (
                  <div key={q.quotationId} className="border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{q.quotationId?.toUpperCase() || '-'}</h3>
                        <p className="text-gray-600">{q.company || '-'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                        {status}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => toggleExpand(q.quotationId)}
                      className="flex items-center text-sm text-gray-500 mt-2"
                    >
                      {expandedQuotation === q.quotationId ? (
                        <>
                          <span>Hide details</span>
                          <HiChevronUp className="ml-1" />
                        </>
                      ) : (
                        <>
                          <span>Show details</span>
                          <HiChevronDown className="ml-1" />
                        </>
                      )}
                    </button>

                    {expandedQuotation === q.quotationId && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Project:</span>
                          <span>{q.projectName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span>{q.date ? new Date(q.date).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sales Person:</span>
                          <span>{q.salesPerson || '-'}</span>
                        </div>
                        <Link
                          href={`/Execution/Quotations/${q.quotationId?.toUpperCase()}`}
                          className="block mt-3 text-center text-blue-600 hover:underline font-medium"
                        >
                          View Full Details
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-10 text-gray-500">
                {searchTerm ? 'No matching quotations found' : 'No quotations found yet'}
              </div>
            )}
          </div>
        ) : (
          // Desktop view - table
          <div className="overflow-x-auto border shadow-sm bg-white rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Reference No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Recv. Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Sales Person
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.length > 0 ? (
                  filteredQuotations.map((q) => {
                    const status = q.status || 'Draft'
                    const statusClass =
                      status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                      status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                      status === 'Accepted' ? 'bg-green-100 text-green-700' :
                      status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'

                    return (
                      <tr key={q.quotationId} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {q.quotationId?.toUpperCase() || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {q.company || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {q.projectName || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {q.date ? new Date(q.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {q.salesPerson || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/Execution/Quotations/${q.quotationId?.toUpperCase()}`}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                      {searchTerm ? 'No matching quotations found' : 'No quotations found yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  )
}