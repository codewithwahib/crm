// 'use client'

// import WorkOrderDashboard from './workorders'
// import { useState, useEffect } from 'react'
// import { client } from '@/sanity/lib/client'
// import { DM_Sans } from 'next/font/google'
// import Sidebar from '@/app/Components/sidebar'

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-dm-sans',
// })

// interface Quotation {
//   quotationId: string
//   client: string
//   date: string
//   status: string
//   amountWithoutGST: number
//   gst: number
//   amountWithGST: number
// }

// export default function QuotationDashboard() {
//   const [quotations, setQuotations] = useState<Quotation[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchQuotations = async () => {
//       try {
//         const query = `*[_type == "quotation"]{
//           quotationId,
//           client,
//           date,
//           status,
//           "amountWithoutGST": subtotal,
//           gst,
//           "amountWithGST": totalPrice
//         } | order(date desc)`
        
//         const result = await client.fetch<Quotation[]>(query)
//         setQuotations(result)
//       } catch (err) {
//         console.error('Failed to fetch quotations', err)
//         setError('Failed to load quotations')
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchQuotations()
//   }, [])

//   // Calculate totals
//   const totalQuotations = quotations.length
//   const totalAmountWithoutGST = quotations.reduce((sum, q) => sum + (q.amountWithoutGST || 0), 0)
//   const totalGST = quotations.reduce((sum, q) => sum + (q.gst || 0), 0)
//   const totalAmountWithGST = quotations.reduce((sum, q) => sum + (q.amountWithGST || 0), 0)

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount).replace('₹', 'Rs ');
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
//               Quotation Dashboard
//             </h1>
//             <p className={`text-gray-600 ${dmSans.className}`}>
//               Overview of all quotations
//             </p>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {/* Total Quotations Card */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
//             <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total Quotations</h3>
//             <p className={`text-3xl font-bold mt-2 text-[#8B5E3C] ${dmSans.className}`}>
//               {totalQuotations}
//             </p>
//           </div>

//           {/* Amount Without GST Card */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
//             <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total (excl. GST)</h3>
//             <p className={`text-3xl font-bold mt-2 text-[#8B5E3C] ${dmSans.className}`}>
//               {formatCurrency(totalAmountWithoutGST)}
//             </p>
//           </div>

//           {/* GST Card */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
//             <h3 className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total GST</h3>
//             <p className={`text-3xl font-bold mt-2 text-[#8B5E3C] ${dmSans.className}`}>
//               {formatCurrency(totalGST)}
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

//         {/* Status Breakdown */}
//         <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
//           <h2 className={`text-xl font-bold text-[#8B5E3C] mb-4 ${dmSans.className}`}>
//             Quotation Status Breakdown
//           </h2>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             {/* Draft */}
//             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
//               <h3 className={`text-sm font-medium text-yellow-800 ${dmSans.className}`}>Draft</h3>
//               <p className={`text-2xl font-bold mt-1 ${dmSans.className}`}>
//                 {quotations.filter(q => q.status === 'Draft').length}
//               </p>
//             </div>
            
//             {/* Sent */}
//             <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//               <h3 className={`text-sm font-medium text-blue-800 ${dmSans.className}`}>Sent</h3>
//               <p className={`text-2xl font-bold mt-1 ${dmSans.className}`}>
//                 {quotations.filter(q => q.status === 'Sent').length}
//               </p>
//             </div>
            
//             {/* Accepted */}
//             <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//               <h3 className={`text-sm font-medium text-green-800 ${dmSans.className}`}>Accepted</h3>
//               <p className={`text-2xl font-bold mt-1 ${dmSans.className}`}>
//                 {quotations.filter(q => q.status === 'Accepted').length}
//               </p>
//             </div>
            
//             {/* Rejected */}
//             <div className="bg-red-50 p-4 rounded-lg border border-red-200">
//               <h3 className={`text-sm font-medium text-red-800 ${dmSans.className}`}>Rejected</h3>
//               <p className={`text-2xl font-bold mt-1 ${dmSans.className}`}>
//                 {quotations.filter(q => q.status === 'Rejected').length}
//               </p>
//             </div>
            
//             {/* Expired */}
//             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//               <h3 className={`text-sm font-medium text-gray-800 ${dmSans.className}`}>Expired</h3>
//               <p className={`text-2xl font-bold mt-1 ${dmSans.className}`}>
//                 {quotations.filter(q => q.status === 'Expired').length}
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }


// export const dynamic = 'force-dynamic'