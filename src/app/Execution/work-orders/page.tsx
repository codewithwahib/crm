'use client'

import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Execution/Components/sidebar'
import Link from 'next/link'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import { HiSearch, HiX } from 'react-icons/hi'
import toast, { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

interface WorkOrder {
  _id: string
  _createdAt: string
  workOrderSection?: {
    workOrderNumber?: string
    clientName?: string
    jobReference?: string
    clientPONumber?: string
    date?: string
    deliveryDate?: string
  }
}

export default function WorkOrderList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const query = `*[_type == "workOrderSalesOrder"]{
          _id,
          _createdAt,
          workOrderSection{
            workOrderNumber,
            clientName,
            jobReference,
            clientPONumber,
            date,
            deliveryDate
          }
        } | order(_createdAt desc)`
        
        const result = await client.fetch<WorkOrder[]>(query)
        setWorkOrders(result)
      } catch (err) {
        console.error('Failed to fetch work orders', err)
        setError('Failed to load work orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkOrders()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredWorkOrders = workOrders.filter(order => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const section = order.workOrderSection || {}
    
    return (
      (section.workOrderNumber?.toLowerCase() || '').includes(searchLower) ||
      (section.clientName?.toLowerCase() || '').includes(searchLower) ||
      (section.jobReference?.toLowerCase() || '').includes(searchLower) ||
      (section.clientPONumber?.toLowerCase() || '').includes(searchLower)
    )
  })

  const handleDelete = async (id: string) => {
    const workOrder = workOrders.find(order => order._id === id)
    const orderNumber = workOrder?.workOrderSection?.workOrderNumber || 'this work order'
    
    toast.custom((t) => (
      <div className={`bg-white p-6 rounded-lg shadow-xl border border-gray-200 max-w-md ${dmSans.className}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete work order <span className="font-semibold">#{orderNumber}</span>? 
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              toast.dismiss(t.id)
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                setDeletingId(id)

                const res = await fetch('/api/work-orders/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    id,
                    workOrderNumber: orderNumber
                  }),
                })

                const data = await res.json()

                if (!res.ok) throw new Error(data.error || 'Failed to delete')

                setWorkOrders(prev => prev.filter(order => order._id !== id))
                toast.success(`Work order #${orderNumber} deleted successfully!`, {
                  duration: 4000,
                })
              } catch (err) {
                console.error(err)
                toast.error(`Failed to delete work order #${orderNumber}`, {
                  duration: 4000,
                })
              } finally {
                setDeletingId(null)
              }
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity
    })
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
        <Toaster position="top-center" />
        <Sidebar />
        <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-6 border-b pb-6">
            <div className="space-y-2">
              <h1 className={`text-2xl sm:text-3xl pt-8 font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
                Work Orders
              </h1>
              <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>
                List of all work orders
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-80">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <HiSearch className="w-5 h-5" />
                </span>

                <input
                  type="text"
                  placeholder="Search work orders..."
                  className={`w-full pl-10 pr-24 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none transition ${dmSans.className} tracking-wide`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-16 top-2.5 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => console.log("Search triggered:", searchTerm)}
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] transition tracking-wide"
                >
                  Search
                </button>
              </div>

              <span className={`text-sm text-gray-500 tracking-wide ${dmSans.className} sm:self-end`}>
                {filteredWorkOrders.length} records
              </span>
            </div>
          </div>

          {/* Responsive Table Container */}
          <div className="overflow-x-auto">
            {isMobile ? (
              <div className="space-y-4">
                {filteredWorkOrders.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No work orders found
                  </div>
                ) : (
                  filteredWorkOrders.map((order) => (
                    <div key={order._id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-[#8B5E3C]">
                            {order.workOrderSection?.workOrderNumber || 'N/A'}
                          </h3>
                          <div className="flex space-x-2">
                            <Link
                              href={`/Execution/work-order/${order._id}`}
                              className="text-[#8B5E3C] hover:text-[#6d4a2f] text-sm"
                            >
                              View
                            </Link>
                            <Link
                              href={`/Execution/work-order/edit/${order._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(order._id)}
                              disabled={deletingId === order._id}
                              className={`text-red-600 hover:text-red-800 text-sm ${
                                deletingId === order._id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {deletingId === order._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p><span className="font-medium">Client:</span> {order.workOrderSection?.clientName || 'N/A'}</p>
                          <p><span className="font-medium">Job Ref:</span> {order.workOrderSection?.jobReference || 'N/A'}</p>
                          <p><span className="font-medium">PO #:</span> {order.workOrderSection?.clientPONumber || 'N/A'}</p>
                          <p><span className="font-medium">Date:</span> {formatDate(order.workOrderSection?.date)}</p>
                          <p><span className="font-medium">Delivery:</span> {formatDate(order.workOrderSection?.deliveryDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className={`w-full table-auto divide-y divide-gray-200 ${dmSans.className} tracking-wide`}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Work Order #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Job Reference
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        PO Number
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Delivery Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          No work orders found
                        </td>
                      </tr>
                    ) : (
                      filteredWorkOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.workOrderSection?.workOrderNumber || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {order.workOrderSection?.clientName || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {order.workOrderSection?.jobReference || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {order.workOrderSection?.clientPONumber || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDate(order.workOrderSection?.date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDate(order.workOrderSection?.deliveryDate)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 space-x-3">
                            <Link
                              href={`/Execution/work-order/${order._id}`}
                              className="text-[#8B5E3C] hover:text-[#6d4a2f] font-medium"
                            >
                              View
                            </Link>
                            <Link
                              href={`/Execution/work-order/edit/${order._id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(order._id)}
                              disabled={deletingId === order._id}
                              className={`text-red-600 hover:text-red-800 font-medium ${
                                deletingId === order._id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {deletingId === order._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export const dynamic = 'force-dynamic'