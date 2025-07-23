// 'use client'

// import { useState, useEffect } from 'react'
// import { client } from '@/sanity/lib/client'
// import { DM_Sans } from 'next/font/google'
// import Sidebar from '@/app/Components/sidebar'

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-dm-sans',
// })

// interface WorkOrder {
//   _id: string
//   _createdAt: string
//   salesOrderSection: {
//     orderDetails: {
//       poValue: number
//     }
//     termsAndConditions: {
//       pricesIncludeGST: boolean
//     }
//   }
// }

// export default function WorkOrderDashboard() {
//   const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchWorkOrders = async () => {
//       try {
//         const query = `*[_type == "workOrderSalesOrder"]{
//           _id,
//           _createdAt,
//           salesOrderSection{
//             orderDetails{
//               poValue
//             },
//             termsAndConditions{
//               pricesIncludeGST
//             }
//           }
//         }`
        
//         const result = await client.fetch<WorkOrder[]>(query)
//         setWorkOrders(result)
//       } catch (err) {
//         console.error('Failed to fetch work orders', err)
//         setError('Failed to load work orders')
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchWorkOrders()
//   }, [])

//   // Calculate totals
//   const totalWorkOrders = workOrders.length
//   const totalAmountWithGST = workOrders.reduce((sum, wo) => sum + (wo.salesOrderSection?.orderDetails?.poValue || 0), 0)
  
//   // Calculate amount without GST (assuming 17% GST if prices include GST)
//   const totalAmountWithoutGST = workOrders.reduce((sum, wo) => {
//     const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
//     if (wo.salesOrderSection?.termsAndConditions?.pricesIncludeGST) {
//       return sum + (poValue / 1.17) // Remove 17% GST
//     }
//     return sum + poValue // Already without GST
//   }, 0)

//   const totalGST = totalAmountWithGST - totalAmountWithoutGST

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'PKR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount).replace('PKR', 'Rs ')
//   }

//   if (isLoading) {
//     return (
//       <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//         <Sidebar />
//         <main className="max-w-6xl mx-auto px-4 py-10">
//           <div className="flex justify-center items-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div>
//           </div>
//         </main>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//         <Sidebar />
//         <main className="max-w-6xl mx-auto px-4 py-10">
//           <div className="bg-red-100 text-red-700 p-4 rounded-md">
//             <p className="font-medium">{error}</p>
//           </div>
//         </main>
//       </div>
//     )
//   }

//   return (
//     <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//       <Sidebar />
//       <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
//         {/* Header Section */}
//         <div className="flex justify-between items-start border-b pb-6">
//           <div className="space-y-2">
//             <h1 className={`text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
//               Work Order Dashboard
//             </h1>
//             <p className={`text-gray-600 ${dmSans.className}`}>
//               Overview of all work orders
//             </p>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Total Work Orders Card */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
//             <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total Work Orders</h3>
//             <p className={`text-3xl font-bold mt-2 text-[#8B5E3C] ${dmSans.className}`}>
//               {totalWorkOrders}
//             </p>
//           </div>

//           {/* Amount Without GST Card */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
//             <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total (excl. GST)</h3>
//             <p className={`text-3xl font-bold mt-2 text-[#8B5E3C] ${dmSans.className}`}>
//               {formatCurrency(totalAmountWithoutGST)}
//             </p>
//           </div>

//           {/* Amount With GST Card */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
//             <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total (incl. GST)</h3>
//             <p className={`text-3xl font-bold mt-2 text-[#8B5E3C] ${dmSans.className}`}>
//               {formatCurrency(totalAmountWithGST)}
//             </p>
//           </div>
//         </div>

//         {/* Additional summary card for GST */}
//         <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
//           <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total GST</h3>
//           <p className={`text-3xl font-bold mt-2 text-[#8B5E3C] ${dmSans.className}`}>
//             {formatCurrency(totalGST)}
//           </p>
//         </div>
//       </main>
//     </div>
//   )
// }

// export const dynamic = 'force-dynamic'