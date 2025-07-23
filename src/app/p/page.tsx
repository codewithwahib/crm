// export const dynamic = 'force-dynamic' // ensures fresh Sanity data every render

// import { client } from '@/sanity/lib/client'
// import { notFound } from 'next/navigation'
// import { DM_Sans } from 'next/font/google'
// import Sidebar from '@/app/Components/sidebar'

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-dm-sans',
// })

// interface PaymentDetails {
//   _id: string
//   _createdAt: string
//   paymentMethod: string
//   paymentDate: string
//   amount: number
//   currency: string
//   transactionId: string
//   paymentStatus: string
//   notes?: string
// }

// export default async function PaymentDetailsPage() {
//   const query = `
//     *[_type == "paymentDetails"]{
//       _id,
//       _createdAt,
//       paymentMethod,
//       paymentDate,
//       amount,
//       currency,
//       transactionId,
//       paymentStatus,
//       notes
//     }
//   `

//   // Fetch payment details from Sanity
//   const payments: PaymentDetails[] = await client.fetch(query)
//   if (!payments || payments.length === 0) return notFound()

//   // Status color mapping
//   const statusColors: Record<string, string> = {
//     'Completed': 'bg-green-100 text-green-700',
//     'Pending': 'bg-yellow-100 text-yellow-700',
//     'Failed': 'bg-red-100 text-red-700',
//     'Refunded': 'bg-blue-100 text-blue-700',
//   }

//   return (
//     <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//       <Sidebar />
//       <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
//         {/* Header Section */}
//         <div className="flex justify-between items-start border-b pb-6">
//           <div className="space-y-2">
//             <h1 className={`text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
//               Payment Details
//             </h1>
//             <p className={`text-lg text-gray-600 ${dmSans.className}`}>
//               View all payment transactions
//             </p>
//           </div>
//         </div>

//         {/* Payment Details Table */}
//         <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Date</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Transaction ID</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Method</th>
//                   <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Amount</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Status</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Notes</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {payments.map((payment) => (
//                   <tr key={payment._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {new Date(payment.paymentDate).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric',
//                       })}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="font-mono">{payment.transactionId}</span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap capitalize">
//                       {payment.paymentMethod.toLowerCase()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right">
//                       {payment.currency} {payment.amount.toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           statusColors[payment.paymentStatus] || 'bg-gray-100 text-gray-700'
//                         }`}
//                       >
//                         {payment.paymentStatus}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-gray-500">
//                       {payment.notes || '-'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
//             <h3 className={`text-lg font-medium text-green-800 ${dmSans.className}`}>Total Completed</h3>
//             <p className={`text-3xl font-bold text-green-600 ${dmSans.className}`}>
//               {payments[0].currency} {
//                 payments
//                   .filter(p => p.paymentStatus === 'Completed')
//                   .reduce((sum, p) => sum + p.amount, 0)
//                   .toFixed(2)
//               }
//             </p>
//             <p className="text-sm text-green-600 mt-1">
//               {payments.filter(p => p.paymentStatus === 'Completed').length} transactions
//             </p>
//           </div>

//           <div className="bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-100">
//             <h3 className={`text-lg font-medium text-yellow-800 ${dmSans.className}`}>Total Pending</h3>
//             <p className={`text-3xl font-bold text-yellow-600 ${dmSans.className}`}>
//               {payments[0].currency} {
//                 payments
//                   .filter(p => p.paymentStatus === 'Pending')
//                   .reduce((sum, p) => sum + p.amount, 0)
//                   .toFixed(2)
//               }
//             </p>
//             <p className="text-sm text-yellow-600 mt-1">
//               {payments.filter(p => p.paymentStatus === 'Pending').length} transactions
//             </p>
//           </div>

//           <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
//             <h3 className={`text-lg font-medium text-blue-800 ${dmSans.className}`}>Total Transactions</h3>
//             <p className={`text-3xl font-bold text-blue-600 ${dmSans.className}`}>
//               {payments[0].currency} {
//                 payments
//                   .reduce((sum, p) => sum + p.amount, 0)
//                   .toFixed(2)
//               }
//             </p>
//             <p className="text-sm text-blue-600 mt-1">
//               {payments.length} transactions
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }