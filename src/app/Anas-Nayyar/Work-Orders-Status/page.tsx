'use client'

import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Components/sidebar'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

type WorkOrderStatus =
  | 'Mechanical'
  | 'Powder Paint'
  | 'Assembling'
  | 'Delivered'
  | 'Bill'
  | 'Paint'
  | 'Wiring'

interface WorkOrder {
  _id: string
  _createdAt: string
  workOrderNumber: string
  clientName: string
  jobReference?: string
  poNumber?: string
  deliveryDate?: string
  status: WorkOrderStatus
  items: {
    description: string
    quantity: number
    remarks?: string
  }[]
}

export default function WorkOrderStatusPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] =
    useState<WorkOrderStatus | 'All'>('All')

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const query = `
          *[_type == "workOrderStatus"]{
            _id,
            _createdAt,
            workOrderNumber,
            clientName,
            jobReference,
            poNumber,
            deliveryDate,
            status,
            items[] {
              description,
              quantity,
              remarks
            }
          } | order(_createdAt desc)
        `
        const data = await client.fetch(query)
        setWorkOrders(data)
      } catch (err) {
        setError('Failed to fetch work orders')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkOrders()
  }, [])

  const statusColors: Record<WorkOrderStatus, string> = {
    Mechanical: 'bg-purple-100 text-purple-700',
    'Powder Paint': 'bg-pink-100 text-pink-700',
    Assembling: 'bg-blue-100 text-blue-700',
    Delivered: 'bg-green-100 text-green-700',
    Bill: 'bg-yellow-100 text-yellow-700',
    Paint: 'bg-orange-100 text-orange-700',
    Wiring: 'bg-teal-100 text-teal-700',
  }

  const filteredWorkOrders =
    statusFilter === 'All'
      ? workOrders
      : workOrders.filter((wo) => wo.status === statusFilter)

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <Sidebar />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5E3C]"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <Sidebar />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p
                  className={`${dmSans.className} tracking-wide text-sm text-red-700`}
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Sidebar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* ✅ Heading */}
        <div className="flex justify-between items-center border-b pb-6">
          <div className="space-y-2">
            <h1
              className={`${dmSans.className} tracking-wide text-3xl font-bold text-[#8B5E3C]`}
            >
              Work Order Status
            </h1>
            <p
              className={`${dmSans.className} tracking-wide text-lg text-gray-600`}
            >
              View the current status of all work orders
            </p>
          </div>
        </div>

        {/* ✅ Status Filter Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries({
            All: workOrders.length,
            Mechanical: workOrders.filter((wo) => wo.status === 'Mechanical')
              .length,
            'Powder Paint': workOrders.filter(
              (wo) => wo.status === 'Powder Paint'
            ).length,
            Assembling: workOrders.filter((wo) => wo.status === 'Assembling')
              .length,
            Delivered: workOrders.filter((wo) => wo.status === 'Delivered')
              .length,
            Bill: workOrders.filter((wo) => wo.status === 'Bill').length,
            Paint: workOrders.filter((wo) => wo.status === 'Paint').length,
            Wiring: workOrders.filter((wo) => wo.status === 'Wiring').length,
          }).map(([status, count]) => (
            <button
              key={status}
              onClick={() =>
                setStatusFilter(
                  status === 'All' ? 'All' : (status as WorkOrderStatus)
                )
              }
              className={`bg-gray-50 p-4 rounded-lg shadow-sm border ${
                statusFilter === status ||
                (status === 'All' && statusFilter === 'All')
                  ? 'border-[#8B5E3C]'
                  : 'border-gray-200'
              } hover:bg-gray-100 transition-colors`}
            >
              <p
                className={`${dmSans.className} tracking-wide text-sm font-medium text-gray-600`}
              >
                {status}
              </p>
              <p
                className={`${dmSans.className} tracking-wide text-2xl font-bold text-[#8B5E3C]`}
              >
                {count}
              </p>
            </button>
          ))}
        </div>

        {/* ✅ Work Orders Table (READ ONLY) */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Work Order #',
                    'Client',
                    'Job Reference',
                    'PO Number',
                    'Delivery Date',
                    'Status',
                    'Items',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`${dmSans.className} tracking-wide px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkOrders.map((workOrder) => (
                  <tr key={workOrder._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/work-orders/${workOrder._id}`}
                        className={`${dmSans.className} tracking-wide text-[#8B5E3C] hover:underline font-medium`}
                      >
                        {workOrder.workOrderNumber}
                      </Link>
                    </td>
                    <td
                      className={`${dmSans.className} tracking-wide px-6 py-4 whitespace-nowrap`}
                    >
                      {workOrder.clientName}
                    </td>
                    <td
                      className={`${dmSans.className} tracking-wide px-6 py-4 whitespace-nowrap`}
                    >
                      {workOrder.jobReference || '-'}
                    </td>
                    <td
                      className={`${dmSans.className} tracking-wide px-6 py-4 whitespace-nowrap`}
                    >
                      {workOrder.poNumber || '-'}
                    </td>
                    <td
                      className={`${dmSans.className} tracking-wide px-6 py-4 whitespace-nowrap`}
                    >
                      {workOrder.deliveryDate
                        ? format(
                            new Date(workOrder.deliveryDate),
                            'MMM dd, yyyy'
                          )
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`${dmSans.className} tracking-wide inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[workOrder.status] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {workOrder.status}
                      </span>
                    </td>
                    <td
                      className={`${dmSans.className} tracking-wide px-6 py-4 whitespace-nowrap`}
                    >
                      {workOrder.items.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Empty State */}
        {filteredWorkOrders.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3
              className={`${dmSans.className} tracking-wide mt-2 text-lg font-medium text-gray-900`}
            >
              No work orders found
            </h3>
            <p
              className={`${dmSans.className} tracking-wide mt-1 text-gray-500`}
            >
              {statusFilter === 'All'
                ? 'No work orders available at the moment.'
                : `No work orders with status "${statusFilter}" found.`}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
