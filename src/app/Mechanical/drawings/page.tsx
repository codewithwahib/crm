'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/app/Mechanical/Components/sidebar'
import { HiSearch, HiX, HiChevronDown, HiChevronUp } from "react-icons/hi"
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

interface WorkOrder {
  _id: string
  _createdAt: string
  workOrderSection: {
    workOrderNumber: string
    clientName: string
    jobReference: string
    clientPONumber: string
    deliveryDate: string
    products: {
      serialNumber: string
      itemDescription: string
      quantity: number
      remarks: string
    }[]
  }
  salesOrderSection: {
    requiredDocuments: {
      approvedShopDrawingUrl?: string
      approvedShopDrawingName?: string
      componentListUrl?: string
      componentListName?: string
    }
  }
}

async function getWorkOrders(): Promise<WorkOrder[]> {
  const query = `
    *[_type == "workOrderSalesOrder"] | order(_createdAt desc) {
      _id,
      _createdAt,
      workOrderSection{
        clientName,
        workOrderNumber,
        jobReference,
        clientPONumber,
        deliveryDate,
        products[]{
          serialNumber,
          itemDescription,
          quantity,
          remarks
        }
      },
      salesOrderSection{
        requiredDocuments{
          "approvedShopDrawingUrl": approvedShopDrawing.asset->url,
          "approvedShopDrawingName": approvedShopDrawing.asset->originalFilename,
          "componentListUrl": componentList.asset->url,
          "componentListName": componentList.asset->originalFilename
        }
      }
    }
  `
  try {
    return await client.fetch(query)
  } catch (err) {
    console.error('❌ Failed to fetch work orders:', err)
    return []
  }
}

export default function WorkOrdersListPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

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
      const data = await getWorkOrders()
      setWorkOrders(data)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const filteredWorkOrders = workOrders.filter((wo) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const fieldsToSearch = [
      wo.workOrderSection.workOrderNumber?.toLowerCase() || '',
      wo.workOrderSection.clientName?.toLowerCase() || '',
      wo.workOrderSection.jobReference?.toLowerCase() || '',
      wo.workOrderSection.clientPONumber?.toLowerCase() || '',
      wo._createdAt ? new Date(wo._createdAt).toLocaleString().toLowerCase() : '',
      wo.workOrderSection.deliveryDate ? new Date(wo.workOrderSection.deliveryDate).toLocaleDateString().toLowerCase() : '',
    ]
    return fieldsToSearch.some((field) => field.includes(term))
  })

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  return (
    <div className={`min-h-screen bg-white text-black ${dmSans.className} tracking-wide`}>
      <Sidebar />

      <main className="max-w-6xl mx-auto px-4 py-6 lg:pl-8">
        {/* Header with search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 sm:pt-0">
          <h1 className={`text-2xl sm:text-3xl pt-9 font-bold text-[#8B5E3C]`}>
            All Work Orders
          </h1>

          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <HiSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search work orders..."
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
            {filteredWorkOrders.length > 0 ? (
              filteredWorkOrders.map((wo) => (
                <div key={wo._id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">
                        {wo.workOrderSection.workOrderNumber || '-'}
                      </h3>
                      <p className="text-gray-600">{wo.workOrderSection.clientName || '-'}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {wo._createdAt ? new Date(wo._createdAt).toLocaleString() : '-'}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => toggleExpand(wo._id)}
                    className="flex items-center text-sm text-gray-500 mt-2"
                  >
                    {expandedOrder === wo._id ? (
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

                  {expandedOrder === wo._id && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Job Reference:</span>
                        <span>{wo.workOrderSection.jobReference || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Client PO:</span>
                        <span>{wo.workOrderSection.clientPONumber || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery Date:</span>
                        <span>
                          {wo.workOrderSection.deliveryDate 
                            ? new Date(wo.workOrderSection.deliveryDate).toLocaleDateString() 
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shop Drawing:</span>
                        <span>
                          {wo.salesOrderSection.requiredDocuments.approvedShopDrawingName || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Component List:</span>
                        <span>
                          {wo.salesOrderSection.requiredDocuments.componentListName || '-'}
                        </span>
                      </div>
                      <div className="pt-2">
                        <h4 className="font-medium text-gray-700">Products:</h4>
                        {wo.workOrderSection.products.map((product, index) => (
                          <div key={index} className="mt-2 pl-2 border-l-2 border-gray-200">
                            <p><span className="font-medium">SN:</span> {product.serialNumber || '-'}</p>
                            <p><span className="font-medium">Item:</span> {product.itemDescription || '-'}</p>
                            <p><span className="font-medium">Qty:</span> {product.quantity || '-'}</p>
                            {product.remarks && <p><span className="font-medium">Remarks:</span> {product.remarks}</p>}
                          </div>
                        ))}
                      </div>
                      <Link
                        href={`/Mechanical/Drawing/${wo._id}`}
                        className="block mt-3 text-center text-blue-600 hover:underline font-medium"
                      >
                        View Full Details
                      </Link>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                {searchTerm ? 'No matching work orders found' : 'No work orders found yet'}
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
                    Work Order #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Job Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Client PO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5E3C] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkOrders.length > 0 ? (
                  filteredWorkOrders.map((wo) => (
                    <tr key={wo._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {wo.workOrderSection.workOrderNumber || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {wo.workOrderSection.clientName || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {wo.workOrderSection.jobReference || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {wo.workOrderSection.clientPONumber || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {wo.workOrderSection.deliveryDate 
                          ? new Date(wo.workOrderSection.deliveryDate).toLocaleDateString() 
                          : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {wo._createdAt ? new Date(wo._createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/Mechanical/Drawing/${wo._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                      {searchTerm ? 'No matching work orders found' : 'No work orders found yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}