// // app/Components/QuotationDetail.tsx

// 'use client'

// import { PortableText } from '@portabletext/react'
// import Image from 'next/image'

// type Quotation = {
//   quotationId: string
//   referenceNo: string
//   revision: string
//   revisionDate: string
//   date: string
//   validity: string
//   subject: string
//   currency: string
//   subtotal: number
//   taxPercent: number
//   taxAmount: number
//   totalAmount: number
//   termsAndConditions?: string
//   notes?: string
//   status: 'Draft' | 'Sent' | 'Approved' | 'Rejected'
//   company: {
//     name: string
//     address: string
//     phone: string
//     email: string
//     logo?: { asset: { url: string } }
//     website?: string
//     gstNumber?: string
//     ntnNumber?: string
//   }
//   client: {
//     companyName: string
//     contactPerson: string
//     designation: string
//     address: string
//     phone: string
//     email: string
//     city: string
//     country: string
//   }
//   preparedBy: {
//     name: string
//     email: string
//     phone: string
//     department: string
//   }
//   items: {
//     itemNo: number
//     description: string
//     quantity: number
//     unit: string
//     unitPrice: number
//     totalPrice: number
//     remarks?: string
//   }[]
// }

// type Props = {
//   quotation: Quotation
// }

// export default function QuotationDetail({ quotation }: Props) {
//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center border-b pb-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">{quotation.company.name}</h2>
//           <p className="text-sm text-gray-600">{quotation.company.address}</p>
//           <p className="text-sm text-gray-600">{quotation.company.email}</p>
//           <p className="text-sm text-gray-600">{quotation.company.phone}</p>
//         </div>
//         {quotation.company.logo?.asset?.url && (
//           <Image
//             src={quotation.company.logo.asset.url}
//             alt="Company Logo"
//             width={100}
//             height={100}
//             className="object-contain h-20 w-20"
//           />
//         )}
//       </div>

//       {/* Quotation Info */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
//         <div>
//           <p><strong>Quotation ID:</strong> {quotation.quotationId}</p>
//           <p><strong>Reference No:</strong> {quotation.referenceNo}</p>
//           <p><strong>Revision:</strong> {quotation.revision}</p>
//           <p><strong>Revision Date:</strong> {quotation.revisionDate}</p>
//         </div>
//         <div>
//           <p><strong>Quotation Date:</strong> {quotation.date}</p>
//           <p><strong>Validity:</strong> {quotation.validity}</p>
//           <p><strong>Status:</strong> {quotation.status}</p>
//           <p><strong>Currency:</strong> {quotation.currency}</p>
//         </div>
//       </div>

//       {/* Client Info */}
//       <div className="border-t pt-4">
//         <h3 className="text-lg font-semibold">Client Information</h3>
//         <div className="text-sm text-gray-700">
//           <p><strong>Company:</strong> {quotation.client.companyName}</p>
//           <p><strong>Contact:</strong> {quotation.client.contactPerson}</p>
//           <p><strong>Email:</strong> {quotation.client.email}</p>
//           <p><strong>City:</strong> {quotation.client.city}, {quotation.client.country}</p>
//         </div>
//       </div>

//       {/* Items Table */}
//       <div>
//         <h3 className="text-lg font-semibold mb-2">Quotation Items</h3>
//         <div className="overflow-x-auto">
//           <table className="min-w-full border border-gray-300 text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border p-2">#</th>
//                 <th className="border p-2">Description</th>
//                 <th className="border p-2">Qty</th>
//                 <th className="border p-2">Unit</th>
//                 <th className="border p-2">Unit Price</th>
//                 <th className="border p-2">Total</th>
//                 <th className="border p-2">Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               {quotation.items.map((item) => (
//                 <tr key={item.itemNo}>
//                   <td className="border p-2 text-center">{item.itemNo}</td>
//                   <td className="border p-2">{item.description}</td>
//                   <td className="border p-2 text-center">{item.quantity}</td>
//                   <td className="border p-2 text-center">{item.unit}</td>
//                   <td className="border p-2 text-right">{item.unitPrice}</td>
//                   <td className="border p-2 text-right">{item.totalPrice}</td>
//                   <td className="border p-2">{item.remarks}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Totals */}
//       <div className="flex justify-end space-y-1 flex-col items-end text-sm text-gray-800">
//         <p><strong>Subtotal:</strong> {quotation.subtotal} {quotation.currency}</p>
//         <p><strong>Tax ({quotation.taxPercent}%):</strong> {quotation.taxAmount} {quotation.currency}</p>
//         <p className="text-lg font-bold"><strong>Total:</strong> {quotation.totalAmount} {quotation.currency}</p>
//       </div>

//       {/* Footer */}
//       {quotation.termsAndConditions && (
//         <div className="pt-4 border-t">
//           <h4 className="font-semibold text-sm">Terms & Conditions</h4>
//           <p className="text-sm text-gray-700">{quotation.termsAndConditions}</p>
//         </div>
//       )}
//       {quotation.notes && (
//         <div className="pt-2">
//           <h4 className="font-semibold text-sm">Additional Notes</h4>
//           <p className="text-sm text-gray-700">{quotation.notes}</p>
//         </div>
//       )}

//       {/* Prepared By */}
//       <div className="pt-4 text-sm text-gray-600 border-t">
//         <p><strong>Prepared By:</strong> {quotation.preparedBy.name} ({quotation.preparedBy.department})</p>
//         <p>{quotation.preparedBy.email} | {quotation.preparedBy.phone}</p>
//       </div>
//     </div>
//   )
// }
