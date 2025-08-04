
// // import { client } from '@/sanity/lib/client'
// // import { notFound } from 'next/navigation'
// // import { DM_Sans } from 'next/font/google'
// // import Sidebar from '@/app/Components/sidebar'

// // const dmSans = DM_Sans({
// //   subsets: ['latin'],
// //   weight: ['400', '500', '700'],
// //   variable: '--font-dm-sans',
// // })

// // export const dynamic = 'force-dynamic'

// // export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
// //   const query = `
// //     *[_type == "workOrderSalesOrder" && _id == $id][0] {
// //       _id,
// //       _createdAt,
      
// //       workOrderSection{
// //         workOrderNumber,
// //         clientName,
// //         jobReference,
// //         clientPONumber,
// //         date,
// //         deliveryDate,
// //         products[]{
// //           serialNumber,
// //           itemDescription,
// //           quantity,
// //           remarks
// //         }
// //       },
      
// //       salesOrderSection{
// //         customerInfo{
// //           customerName,
// //           salesPerson,
// //           contactPerson,
// //           mobileNo,
// //           phoneNo,
// //           email
// //         },
// //         orderDetails{
// //           productType,
// //           poNumber,
// //           poDate,
// //           poValue,
// //           deliveryDate,
// //           shopDrawingApproval,
// //           shopDrawingApprovalDate,
// //           expectedCompletionDate,
// //           specialInstructions
// //         },
// //         termsAndConditions{
// //           paymentType,
// //           pricesIncludeGST,
// //           deliveryMethod,
// //           warrantyPeriod
// //         },
// //         requiredDocuments{
// //           "quotationWithFinalPriceUrl": quotationWithFinalPrice.asset->url,
// //           "quotationWithFinalPriceName": quotationWithFinalPrice.asset->originalFilename,
// //           "approvedShopDrawingUrl": approvedShopDrawing.asset->url,
// //           "approvedShopDrawingName": approvedShopDrawing.asset->originalFilename,
// //           "componentListUrl": componentList.asset->url,
// //           "componentListName": componentList.asset->originalFilename,
// //           "customerPOCopyUrl": customerPOCopy.asset->url,
// //           "customerPOCopyName": customerPOCopy.asset->originalFilename,
// //           "technicalSpecificationsUrl": technicalSpecifications.asset->url,
// //           "technicalSpecificationsName": technicalSpecifications.asset->originalFilename
// //         },
// //         authorizedBy
// //       },
      
// //       purchaseOrderSection{
// //         poTable[]{
// //           description,
// //           unit,
// //           quantity,
// //           unitRatePKR,
// //           totalAmountPKR
// //         },
// //         shipTo,
// //         paymentTerms,
// //         deliveryTerms
// //       }
// //     }
// //   `

// //   const data = await client.fetch(query, { id: params.id })
// //   if (!data) return notFound()

// //   const {
// //     workOrderSection,
// //     salesOrderSection,
// //     purchaseOrderSection,
// //     _createdAt
// //   } = data

// //   // Calculate totals
// //   const poTotal = purchaseOrderSection?.poTable?.reduce(
// //     (sum: number, item: any) => sum + (item.totalAmountPKR || 0), 0
// //   ) || 0

// //   // Format date
// //   const formatDate = (dateString?: string) => {
// //     if (!dateString) return 'N/A'
// //     const date = new Date(dateString)
// //     return date.toLocaleDateString('en-US', {
// //       year: 'numeric',
// //       month: 'short',
// //       day: 'numeric'
// //     })
// //   }

// //   return (
// //     <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
// //       <Sidebar />
// //       <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
// //         {/* Header Section */}
// //         <div className="flex justify-between items-start border-b pb-6">
// //           <div className="space-y-2">
// //             <h1 className={`text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
// //               Work Order: {workOrderSection?.workOrderNumber || 'N/A'}
// //             </h1>
// //             <div className="flex flex-wrap items-center gap-4">
// //               <div>
// //                 <span className="font-semibold text-[#8B5E3C]">Created:</span>{' '}
// //                 {formatDate(_createdAt)}
// //               </div>
// //               {workOrderSection?.date && (
// //                 <div>
// //                   <span className="font-semibold text-[#8B5E3C]">Order Date:</span>{' '}
// //                   {formatDate(workOrderSection.date)}
// //                 </div>
// //               )}
// //               {salesOrderSection?.orderDetails?.poNumber && (
// //                 <div>
// //                   <span className="font-semibold text-[#8B5E3C]">PO Number:</span>{' '}
// //                   {salesOrderSection.orderDetails.poNumber}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Client & Order Info */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
// //           {/* Client Information */}
// //           <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
// //             <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
// //               Client Information
// //             </h2>
// //             <div className="space-y-3">
// //               <div>
// //                 <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Client Name:</p>
// //                 <p className={`text-lg ${dmSans.className}`}>
// //                   {workOrderSection?.clientName || salesOrderSection?.customerInfo?.customerName || 'N/A'}
// //                 </p>
// //               </div>
              
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 {salesOrderSection?.customerInfo?.contactPerson && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Contact Person:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.contactPerson}</p>
// //                   </div>
// //                 )}
// //                 {salesOrderSection?.customerInfo?.salesPerson && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Sales Person:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.salesPerson}</p>
// //                   </div>
// //                 )}
// //               </div>
              
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 {salesOrderSection?.customerInfo?.email && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Email:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.email}</p>
// //                   </div>
// //                 )}
// //                 {salesOrderSection?.customerInfo?.mobileNo && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Mobile:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.mobileNo}</p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>

// //           {/* Order Details */}
// //           <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
// //             <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
// //               Order Details
// //             </h2>
// //             <div className="space-y-3">
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div>
// //                   <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Job Reference:</p>
// //                   <p className={`text-lg ${dmSans.className}`}>{workOrderSection?.jobReference || 'N/A'}</p>
// //                 </div>
// //                 <div>
// //                   <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Client PO Number:</p>
// //                   <p className={`text-lg ${dmSans.className}`}>{workOrderSection?.clientPONumber || 'N/A'}</p>
// //                 </div>
// //               </div>
              
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 {salesOrderSection?.orderDetails?.productType && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Product Type:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.orderDetails.productType}</p>
// //                   </div>
// //                 )}
// //                 {salesOrderSection?.orderDetails?.poValue && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>PO Value:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>
// //                       Rs. {salesOrderSection.orderDetails.poValue?.toFixed(2)}
// //                     </p>
// //                   </div>
// //                 )}
// //               </div>
              
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 {workOrderSection?.deliveryDate && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Delivery Date:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>
// //                       {formatDate(workOrderSection.deliveryDate)}
// //                     </p>
// //                   </div>
// //                 )}
// //                 {salesOrderSection?.orderDetails?.expectedCompletionDate && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Expected Completion:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>
// //                       {formatDate(salesOrderSection.orderDetails.expectedCompletionDate)}
// //                     </p>
// //                   </div>
// //                 )}
// //               </div>
              
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div>
// //                   <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Drawing Approved:</p>
// //                   <p className={`text-lg ${dmSans.className}`}>
// //                     {salesOrderSection?.orderDetails?.shopDrawingApproval ? 'Yes' : 'No'}
// //                   </p>
// //                 </div>
// //                 {salesOrderSection?.orderDetails?.shopDrawingApprovalDate && (
// //                   <div>
// //                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Approval Date:</p>
// //                     <p className={`text-lg ${dmSans.className}`}>
// //                       {formatDate(salesOrderSection.orderDetails.shopDrawingApprovalDate)}
// //                     </p>
// //                   </div>
// //                 )}
// //               </div>
              
// //               {salesOrderSection?.orderDetails?.specialInstructions && (
// //                 <div>
// //                   <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Special Instructions:</p>
// //                   <p className={`text-lg ${dmSans.className}`}>
// //                     {salesOrderSection.orderDetails.specialInstructions}
// //                   </p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Work Order Products */}
// //         {workOrderSection?.products?.length > 0 && (
// //           <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
// //             <h2 className={`text-2xl font-semibold text-[#8B5E3C] p-6 pb-4 ${dmSans.className}`}>
// //               Work Order 
// //             </h2>
// //             <div className="overflow-x-auto">
// //               <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
// //                 <thead className="bg-gray-50">
// //                   <tr>
// //                     <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">S No.</th>
// //                     <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Serial Number</th>
// //                     <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Description</th>
// //                     <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Qty</th>
// //                     <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Remarks</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="bg-white divide-y divide-gray-200">
// //                   {workOrderSection.products.map((product: any, i: number) => (
// //                     <tr key={i} className="hover:bg-gray-50">
// //                       <td className="px-6 py-4">{i + 1}.</td>
// //                       <td className="px-6 py-4 font-medium">{product.serialNumber || '-'}</td>
// //                       <td className="px-6 py-4">{product.itemDescription}</td>
// //                       <td className="px-6 py-4 text-right">{product.quantity}</td>
// //                       <td className="px-6 py-4 text-gray-500">{product.remarks || '-'}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //         )}

// //         {/* Purchase Order Section */}
// //         {purchaseOrderSection?.poTable?.length > 0 && (
// //           <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
// //             <h2 className={`text-2xl font-semibold text-[#8B5E3C] p-6 pb-4 ${dmSans.className}`}>
// //               Purchase Order 
// //             </h2>
            
// //             <div className="px-6 pb-4 space-y-4">
// //               {purchaseOrderSection.shipTo && (
// //                 <div>
// //                   <p className={`text-lg font-semibold ${dmSans.className}`}>Ship To:</p>
// //                   <p className={`${dmSans.className}`}>{purchaseOrderSection.shipTo}</p>
// //                 </div>
// //               )}
              
// //               {purchaseOrderSection.paymentTerms && (
// //                 <div>
// //                   <p className={`text-lg font-semibold ${dmSans.className}`}>Payment Terms:</p>
// //                   <p className={`${dmSans.className}`}>{purchaseOrderSection.paymentTerms}</p>
// //                 </div>
// //               )}
              
// //               {purchaseOrderSection.deliveryTerms && (
// //                 <div>
// //                   <p className={`text-lg font-semibold ${dmSans.className}`}>Delivery Terms:</p>
// //                   <p className={`${dmSans.className}`}>{purchaseOrderSection.deliveryTerms}</p>
// //                 </div>
// //               )}
// //             </div>
            
// //             <div className="overflow-x-auto">
// //               <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
// //                 <thead className="bg-gray-50">
// //                   <tr>
// //                     <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Description</th>
// //                     <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Unit</th>
// //                     <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Qty</th>
// //                     <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Unit Rate (PKR)</th>
// //                     <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Total (PKR)</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="bg-white divide-y divide-gray-200">
// //                   {purchaseOrderSection.poTable.map((item: any, i: number) => (
// //                     <tr key={i} className="hover:bg-gray-50">
// //                       <td className="px-6 py-4">{item.description}</td>
// //                       <td className="px-6 py-4">{item.unit}</td>
// //                       <td className="px-6 py-4 text-right">{item.quantity}</td>
// //                       <td className="px-6 py-4 text-right">{item.unitRatePKR?.toFixed(2)}</td>
// //                       <td className="px-6 py-4 text-right font-medium">{item.totalAmountPKR?.toFixed(2)}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //                 <tfoot className="bg-gray-50">
// //                   <tr className="border-t border-gray-200">
// //                     <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
// //                       Total Amount:
// //                     </td>
// //                     <td className="px-6 py-3 text-right text-sm font-bold text-[#8B5E3C]">
// //                       Rs. {poTotal.toFixed(2)}
// //                     </td>
// //                   </tr>
// //                 </tfoot>
// //               </table>
// //             </div>
// //           </div>
// //         )}

// //         {/* Terms & Conditions */}
// //         {salesOrderSection?.termsAndConditions && (
// //           <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
// //             <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
// //               Terms & Conditions
// //             </h2>
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div>
// //                 <p className={`text-lg font-semibold ${dmSans.className}`}>Payment Type:</p>
// //                 <p className={`${dmSans.className}`}>
// //                   {salesOrderSection.termsAndConditions.paymentType || 'N/A'}
// //                 </p>
// //               </div>
// //               <div>
// //                 <p className={`text-lg font-semibold ${dmSans.className}`}>Prices Include GST:</p>
// //                 <p className={`${dmSans.className}`}>
// //                   {salesOrderSection.termsAndConditions.pricesIncludeGST ? 'Yes' : 'No'}
// //                 </p>
// //               </div>
// //               <div>
// //                 <p className={`text-lg font-semibold ${dmSans.className}`}>Delivery Method:</p>
// //                 <p className={`${dmSans.className}`}>
// //                   {salesOrderSection.termsAndConditions.deliveryMethod || 'N/A'}
// //                 </p>
// //               </div>
// //               {salesOrderSection.termsAndConditions.warrantyPeriod && (
// //                 <div>
// //                   <p className={`text-lg font-semibold ${dmSans.className}`}>Warranty Period:</p>
// //                   <p className={`${dmSans.className}`}>
// //                     {salesOrderSection.termsAndConditions.warrantyPeriod}
// //                   </p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         )}

// //         {/* Required Documents */}
// //         {salesOrderSection?.requiredDocuments && (
// //           <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
// //             <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
// //               Required Documents
// //             </h2>
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //               {salesOrderSection.requiredDocuments.quotationWithFinalPriceUrl && (
// //                 <div>
// //                   <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Quotation with Final Price</h3>
// //                   <a
// //                     href={salesOrderSection.requiredDocuments.quotationWithFinalPriceUrl}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="text-blue-600 hover:underline flex items-center gap-2"
// //                   >
// //                     📄 {salesOrderSection.requiredDocuments.quotationWithFinalPriceName || 'Document'}
// //                   </a>
// //                 </div>
// //               )}
// //               {salesOrderSection.requiredDocuments.approvedShopDrawingUrl && (
// //                 <div>
// //                   <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Approved Shop Drawing</h3>
// //                   <a
// //                     href={salesOrderSection.requiredDocuments.approvedShopDrawingUrl}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="text-blue-600 hover:underline flex items-center gap-2"
// //                   >
// //                     📄 {salesOrderSection.requiredDocuments.approvedShopDrawingName || 'Document'}
// //                   </a>
// //                 </div>
// //               )}
// //               {salesOrderSection.requiredDocuments.componentListUrl && (
// //                 <div>
// //                   <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Component List</h3>
// //                   <a
// //                     href={salesOrderSection.requiredDocuments.componentListUrl}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="text-blue-600 hover:underline flex items-center gap-2"
// //                   >
// //                     📄 {salesOrderSection.requiredDocuments.componentListName || 'Document'}
// //                   </a>
// //                 </div>
// //               )}
// //               {salesOrderSection.requiredDocuments.customerPOCopyUrl && (
// //                 <div>
// //                   <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Customer PO Copy</h3>
// //                   <a
// //                     href={salesOrderSection.requiredDocuments.customerPOCopyUrl}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="text-blue-600 hover:underline flex items-center gap-2"
// //                   >
// //                     📄 {salesOrderSection.requiredDocuments.customerPOCopyName || 'Document'}
// //                   </a>
// //                 </div>
// //               )}
// //               {salesOrderSection.requiredDocuments.technicalSpecificationsUrl && (
// //                 <div>
// //                   <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Technical Specifications</h3>
// //                   <a
// //                     href={salesOrderSection.requiredDocuments.technicalSpecificationsUrl}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="text-blue-600 hover:underline flex items-center gap-2"
// //                   >
// //                     📄 {salesOrderSection.requiredDocuments.technicalSpecificationsName || 'Document'}
// //                   </a>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         )}

// //         {/* Authorized By */}
// //         {salesOrderSection?.authorizedBy && (
// //           <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
// //             <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
// //               Authorization
// //             </h2>
// //             <div className="flex justify-end">
// //               <div className="text-center">
// //                 <p className={`text-lg font-semibold ${dmSans.className}`}>Authorized By:</p>
// //                 <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.authorizedBy}</p>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </main>
// //     </div>
// //   )
// // }


// import { client } from '@/sanity/lib/client'
// import { notFound } from 'next/navigation'
// import ProtectedRoute from '@/app/Components/ProtectedRoute'
// import { DM_Sans } from 'next/font/google'
// import Sidebar from '@/app/Components/sidebar'

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-dm-sans',
// })

// // TypeScript interfaces
// interface Product {
//   serialNumber?: string
//   itemDescription: string
//   quantity: number
//   remarks?: string
// }

// interface POItem {
//   description: string
//   unit: string
//   quantity: number
//   unitRatePKR?: number | string | null
//   totalAmountPKR?: number | string | null
// }

// // ✅ Helper: Safe number formatter
// const formatCurrency = (value?: number | string | null): string => {
//   if (value === undefined || value === null) return '0.00'
//   const num = Number(value)
//   return isNaN(num) ? '0.00' : num.toFixed(2)
// }

// // ✅ Helper: Safe date formatter
// const formatDate = (dateString?: string) => {
//   if (!dateString) return 'N/A'
//   const date = new Date(dateString)
//   return date.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric'
//   })
// }

// export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
//   const query = `
//     *[_type == "workOrderSalesOrder" && _id == $id][0] {
//       _id,
//       _createdAt,
      
//       workOrderSection{
//         workOrderNumber,
//         clientName,
//         jobReference,
//         clientPONumber,
//         date,
//         deliveryDate,
//         products[]{
//           serialNumber,
//           itemDescription,
//           quantity,
//           remarks
//         }
//       },
      
//       salesOrderSection{
//         customerInfo{
//           customerName,
//           salesPerson,
//           contactPerson,
//           mobileNo,
//           phoneNo,
//           email
//         },
//         orderDetails{
//           productType,
//           poNumber,
//           poDate,
//           poValue,
//           deliveryDate,
//           shopDrawingApproval,
//           shopDrawingApprovalDate,
//           expectedCompletionDate,
//           specialInstructions
//         },
//         termsAndConditions{
//           paymentType,
//           pricesIncludeGST,
//           deliveryMethod,
//           warrantyPeriod
//         },
//         requiredDocuments{
//           "quotationWithFinalPriceUrl": quotationWithFinalPrice.asset->url,
//           "quotationWithFinalPriceName": quotationWithFinalPrice.asset->originalFilename,
//           "approvedShopDrawingUrl": approvedShopDrawing.asset->url,
//           "approvedShopDrawingName": approvedShopDrawing.asset->originalFilename,
//           "componentListUrl": componentList.asset->url,
//           "componentListName": componentList.asset->originalFilename,
//           "customerPOCopyUrl": customerPOCopy.asset->url,
//           "customerPOCopyName": customerPOCopy.asset->originalFilename,
//           "technicalSpecificationsUrl": technicalSpecifications.asset->url,
//           "technicalSpecificationsName": technicalSpecifications.asset->originalFilename
//         },
//         authorizedBy
//       },
      
//       purchaseOrderSection{
//         poTable[]{
//           description,
//           unit,
//           quantity,
//           unitRatePKR,
//           totalAmountPKR
//         },
//         shipTo,
//         paymentTerms,
//         deliveryTerms
//       }
//     }
//   `

//   // Add revalidation: 0 to ensure fresh data
//   const data = await client.fetch(query, { id: params.id }, { cache: 'no-store' })
//   if (!data) return notFound()

//   const {
//     workOrderSection,
//     salesOrderSection,
//     purchaseOrderSection,
//     _createdAt
//   } = data

//   // ✅ Safe total calculation
//   const poTotal =
//     purchaseOrderSection?.poTable?.reduce((sum: number, item: POItem) => {
//       const val = Number(item.totalAmountPKR || 0)
//       return sum + (isNaN(val) ? 0 : val)
//     }, 0) || 0

//   return (
//     <ProtectedRoute allowedUser='director'>
//     <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//       <Sidebar />
//       <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">

//         {/* HEADER */}
//         <div className="flex justify-between items-start border-b pb-6">
//           <div className="space-y-2">
//             <h1 className={`text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
//               Work Order: {workOrderSection?.workOrderNumber || 'N/A'}
//             </h1>
//             <div className="flex flex-wrap items-center gap-4">
//               <div>
//                 <span className="font-semibold text-[#8B5E3C]">Created:</span>{' '}
//                 {formatDate(_createdAt)}
//               </div>
//               {workOrderSection?.date && (
//                 <div>
//                   <span className="font-semibold text-[#8B5E3C]">Order Date:</span>{' '}
//                   {formatDate(workOrderSection.date)}
//                 </div>
//               )}
//               {salesOrderSection?.orderDetails?.poNumber && (
//                 <div>
//                   <span className="font-semibold text-[#8B5E3C]">PO Number:</span>{' '}
//                   {salesOrderSection.orderDetails.poNumber}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* CLIENT & ORDER INFO */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* CLIENT INFO */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
//             <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
//               Client Information
//             </h2>
//             <div className="space-y-3">
//               <div>
//                 <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Client Name:</p>
//                 <p className={`text-lg ${dmSans.className}`}>
//                   {workOrderSection?.clientName || salesOrderSection?.customerInfo?.customerName || 'N/A'}
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {salesOrderSection?.customerInfo?.contactPerson && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Contact Person:</p>
//                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.contactPerson}</p>
//                   </div>
//                 )}
//                 {salesOrderSection?.customerInfo?.salesPerson && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Sales Person:</p>
//                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.salesPerson}</p>
//                   </div>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {salesOrderSection?.customerInfo?.email && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Email:</p>
//                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.email}</p>
//                   </div>
//                 )}
//                 {salesOrderSection?.customerInfo?.mobileNo && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Mobile:</p>
//                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.mobileNo}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* ORDER DETAILS */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
//             <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
//               Order Details
//             </h2>
//             <div className="space-y-3">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Job Reference:</p>
//                   <p className={`text-lg ${dmSans.className}`}>{workOrderSection?.jobReference || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Client PO Number:</p>
//                   <p className={`text-lg ${dmSans.className}`}>{workOrderSection?.clientPONumber || 'N/A'}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {salesOrderSection?.orderDetails?.productType && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Product Type:</p>
//                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.orderDetails.productType}</p>
//                   </div>
//                 )}
//                 {salesOrderSection?.orderDetails?.poValue && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>PO Value:</p>
//                     <p className={`text-lg ${dmSans.className}`}>
//                       Rs. {formatCurrency(salesOrderSection.orderDetails.poValue)}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {workOrderSection?.deliveryDate && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Delivery Date:</p>
//                     <p className={`text-lg ${dmSans.className}`}>{formatDate(workOrderSection.deliveryDate)}</p>
//                   </div>
//                 )}
//                 {salesOrderSection?.orderDetails?.expectedCompletionDate && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Expected Completion:</p>
//                     <p className={`text-lg ${dmSans.className}`}>
//                       {formatDate(salesOrderSection.orderDetails.expectedCompletionDate)}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Drawing Approved:</p>
//                     <p className={`text-lg ${dmSans.className}`}>
//                       {salesOrderSection?.orderDetails?.shopDrawingApproval ? 'Yes' : 'No'}
//                     </p>
//                   </div>
//                   {salesOrderSection?.orderDetails?.shopDrawingApprovalDate && (
//                     <div>
//                       <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Approval Date:</p>
//                       <p className={`text-lg ${dmSans.className}`}>
//                         {formatDate(salesOrderSection.orderDetails.shopDrawingApprovalDate)}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 {salesOrderSection?.orderDetails?.specialInstructions && (
//                   <div>
//                     <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Special Instructions:</p>
//                     <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.orderDetails.specialInstructions}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* WORK ORDER PRODUCTS */}
//           {workOrderSection?.products?.length > 0 && (
//             <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
//               <h2 className={`text-2xl font-semibold text-[#8B5E3C] p-6 pb-4 ${dmSans.className}`}>Work Order</h2>
//               <div className="overflow-x-auto">
//                 <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">S No.</th>
//                       <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Serial Number</th>
//                       <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Description</th>
//                       <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Qty</th>
//                       <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Remarks</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {workOrderSection.products.map((product: Product, i: number) => (
//                       <tr key={i} className="hover:bg-gray-50">
//                         <td className="px-6 py-4">{i + 1}.</td>
//                         <td className="px-6 py-4 font-medium">{product.serialNumber || '-'}</td>
//                         <td className="px-6 py-4">{product.itemDescription}</td>
//                         <td className="px-6 py-4 text-right">{product.quantity}</td>
//                         <td className="px-6 py-4 text-gray-500">{product.remarks || '-'}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* PURCHASE ORDER SECTION */}
//           {purchaseOrderSection?.poTable?.length > 0 && (
//             <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
//               <h2 className={`text-2xl font-semibold text-[#8B5E3C] p-6 pb-4 ${dmSans.className}`}>Purchase Order</h2>

//               {/* Purchase Order Meta */}
//               <div className="px-6 pb-4 space-y-4">
//                 {purchaseOrderSection.shipTo && (
//                   <div>
//                     <p className={`text-lg font-semibold ${dmSans.className}`}>Ship To:</p>
//                     <p className={`${dmSans.className}`}>{purchaseOrderSection.shipTo}</p>
//                   </div>
//                 )}
//                 {purchaseOrderSection.paymentTerms && (
//                   <div>
//                     <p className={`text-lg font-semibold ${dmSans.className}`}>Payment Terms:</p>
//                     <p className={`${dmSans.className}`}>{purchaseOrderSection.paymentTerms}</p>
//                   </div>
//                 )}
//                 {purchaseOrderSection.deliveryTerms && (
//                   <div>
//                     <p className={`text-lg font-semibold ${dmSans.className}`}>Delivery Terms:</p>
//                     <p className={`${dmSans.className}`}>{purchaseOrderSection.deliveryTerms}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Purchase Order Table */}
//               <div className="overflow-x-auto">
//                 <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Description</th>
//                       <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Unit</th>
//                       <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Qty</th>
//                       <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Unit Rate (PKR)</th>
//                       <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Total (PKR)</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {purchaseOrderSection.poTable.map((item: POItem, i: number) => (
//                       <tr key={i} className="hover:bg-gray-50">
//                         <td className="px-6 py-4">{item.description}</td>
//                         <td className="px-6 py-4">{item.unit}</td>
//                         <td className="px-6 py-4 text-right">{item.quantity}</td>
//                         <td className="px-6 py-4 text-right">{formatCurrency(item.unitRatePKR)}</td>
//                         <td className="px-6 py-4 text-right font-medium">{formatCurrency(item.totalAmountPKR)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className="bg-gray-50">
//                     <tr className="border-t border-gray-200">
//                       <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
//                         Total Amount:
//                       </td>
//                       <td className="px-6 py-3 text-right text-sm font-bold text-[#8B5E3C]">
//                         Rs. {poTotal.toFixed(2)}
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </div>
//           )}


//           {/* Terms & Conditions */}
//           {salesOrderSection?.termsAndConditions && (
//             <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
//               <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
//                 Terms & Conditions
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <p className={`text-lg font-semibold ${dmSans.className}`}>Payment Type:</p>
//                   <p className={`${dmSans.className}`}>
//                     {salesOrderSection.termsAndConditions.paymentType || 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className={`text-lg font-semibold ${dmSans.className}`}>Prices Include GST:</p>
//                   <p className={`${dmSans.className}`}>
//                     {salesOrderSection.termsAndConditions.pricesIncludeGST ? 'Yes' : 'No'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className={`text-lg font-semibold ${dmSans.className}`}>Delivery Method:</p>
//                   <p className={`${dmSans.className}`}>
//                     {salesOrderSection.termsAndConditions.deliveryMethod || 'N/A'}
//                   </p>
//                 </div>
//                 {salesOrderSection.termsAndConditions.warrantyPeriod && (
//                   <div>
//                     <p className={`text-lg font-semibold ${dmSans.className}`}>Warranty Period:</p>
//                     <p className={`${dmSans.className}`}>
//                       {salesOrderSection.termsAndConditions.warrantyPeriod}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Required Documents */}
//           {salesOrderSection?.requiredDocuments && (
//             <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
//               <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
//                 Required Documents
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {salesOrderSection.requiredDocuments.quotationWithFinalPriceUrl && (
//                   <div>
//                     <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Quotation with Final Price</h3>
//                     <a
//                       href={salesOrderSection.requiredDocuments.quotationWithFinalPriceUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline flex items-center gap-2"
//                     >
//                       📄 {salesOrderSection.requiredDocuments.quotationWithFinalPriceName || 'Document'}
//                     </a>
//                   </div>
//                 )}
//                 {salesOrderSection.requiredDocuments.approvedShopDrawingUrl && (
//                   <div>
//                     <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Approved Shop Drawing</h3>
//                     <a
//                       href={salesOrderSection.requiredDocuments.approvedShopDrawingUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline flex items-center gap-2"
//                     >
//                       📄 {salesOrderSection.requiredDocuments.approvedShopDrawingName || 'Document'}
//                     </a>
//                   </div>
//                 )}
//                 {salesOrderSection.requiredDocuments.componentListUrl && (
//                   <div>
//                     <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Component List</h3>
//                     <a
//                       href={salesOrderSection.requiredDocuments.componentListUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline flex items-center gap-2"
//                     >
//                       📄 {salesOrderSection.requiredDocuments.componentListName || 'Document'}
//                     </a>
//                   </div>
//                 )}
//                 {salesOrderSection.requiredDocuments.customerPOCopyUrl && (
//                   <div>
//                     <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Customer PO Copy</h3>
//                     <a
//                       href={salesOrderSection.requiredDocuments.customerPOCopyUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline flex items-center gap-2"
//                     >
//                       📄 {salesOrderSection.requiredDocuments.customerPOCopyName || 'Document'}
//                     </a>
//                   </div>
//                 )}
//                 {salesOrderSection.requiredDocuments.technicalSpecificationsUrl && (
//                   <div>
//                     <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Technical Specifications</h3>
//                     <a
//                       href={salesOrderSection.requiredDocuments.technicalSpecificationsUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline flex items-center gap-2"
//                     >
//                       📄 {salesOrderSection.requiredDocuments.technicalSpecificationsName || 'Document'}
//                     </a>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Authorized By */}
//           {salesOrderSection?.authorizedBy && (
//             <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
//               <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
//                 Authorization
//               </h2>
//               <div className="flex justify-end">
//                 <div className="text-center">
//                   <p className={`text-lg font-semibold ${dmSans.className}`}>Authorized By:</p>
//                   <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.authorizedBy}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//       </ProtectedRoute>
//     )
//   }


  import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Components/sidebar'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

// TypeScript interfaces
interface Product {
  serialNumber?: string
  itemDescription: string
  quantity: number
  remarks?: string
}

interface POItem {
  description: string
  unit: string
  quantity: number
  unitRatePKR: number
  gstApplicable: boolean
  gstPercentage?: number
  gstAmount?: number
  totalAmountPKR: number
}

interface GSTSummary {
  subtotal?: number
  totalGST?: number
  grandTotal?: number
}

// Helper: Safe number formatter
const formatCurrency = (value?: number | string | null): string => {
  if (value === undefined || value === null) return '0.00'
  const num = Number(value)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

// Helper: Safe date formatter
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  const query = `
    *[_type == "workOrderSalesOrder" && _id == $id][0] {
      _id,
      _createdAt,
      
      workOrderSection{
        workOrderNumber,
        clientName,
        jobReference,
        clientPONumber,
        date,
        deliveryDate,
        products[]{
          serialNumber,
          itemDescription,
          quantity,
          remarks
        }
      },
      
      salesOrderSection{
        customerInfo{
          customerName,
          salesPerson,
          contactPerson,
          mobileNo,
          phoneNo,
          email
        },
        orderDetails{
          productType,
          poNumber,
          poDate,
          poValue,
          deliveryDate,
          shopDrawingApproval,
          shopDrawingApprovalDate,
          expectedCompletionDate,
          specialInstructions
        },
        termsAndConditions{
          paymentType,
          pricesIncludeGST,
          gstPercentage,
          deliveryMethod,
          warrantyPeriod
        },
        requiredDocuments{
          "quotationWithFinalPriceUrl": quotationWithFinalPrice.asset->url,
          "quotationWithFinalPriceName": quotationWithFinalPrice.asset->originalFilename,
          "approvedShopDrawingUrl": approvedShopDrawing.asset->url,
          "approvedShopDrawingName": approvedShopDrawing.asset->originalFilename,
          "componentListUrl": componentList.asset->url,
          "componentListName": componentList.asset->originalFilename,
          "customerPOCopyUrl": customerPOCopy.asset->url,
          "customerPOCopyName": customerPOCopy.asset->originalFilename,
          "technicalSpecificationsUrl": technicalSpecifications.asset->url,
          "technicalSpecificationsName": technicalSpecifications.asset->originalFilename
        },
        authorizedBy
      },
      
      purchaseOrderSection{
        poTable[]{
          description,
          unit,
          quantity,
          unitRatePKR,
          gstApplicable,
          gstPercentage,
          gstAmount,
          totalAmountPKR
        },
        gstSummary{
          subtotal,
          totalGST,
          grandTotal
        },
        shipTo,
        paymentTerms,
        deliveryTerms
      }
    }
  `

  const data = await client.fetch(query, { id: params.id }, { cache: 'no-store' })
  if (!data) return notFound()

  const {
    workOrderSection,
    salesOrderSection,
    purchaseOrderSection,
    _createdAt
  } = data

  // Calculate totals
  const poTotal =
    purchaseOrderSection?.poTable?.reduce((sum: number, item: POItem) => {
      const val = Number(item.totalAmountPKR || 0)
      return sum + (isNaN(val) ? 0 : val)
    }, 0) || 0

  return (
    <ProtectedRoute allowedUser='director'>
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <Sidebar />
        <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">

          {/* HEADER */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="space-y-2">
              <h1 className={`text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
                Work Order: {workOrderSection?.workOrderNumber || 'N/A'}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="font-semibold text-[#8B5E3C]">Created:</span>{' '}
                  {formatDate(_createdAt)}
                </div>
                {workOrderSection?.date && (
                  <div>
                    <span className="font-semibold text-[#8B5E3C]">Order Date:</span>{' '}
                    {formatDate(workOrderSection.date)}
                  </div>
                )}
                {salesOrderSection?.orderDetails?.poNumber && (
                  <div>
                    <span className="font-semibold text-[#8B5E3C]">PO Number:</span>{' '}
                    {salesOrderSection.orderDetails.poNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CLIENT & ORDER INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CLIENT INFO */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
                Client Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Client Name:</p>
                  <p className={`text-lg ${dmSans.className}`}>
                    {workOrderSection?.clientName || salesOrderSection?.customerInfo?.customerName || 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {salesOrderSection?.customerInfo?.contactPerson && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Contact Person:</p>
                      <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.contactPerson}</p>
                    </div>
                  )}
                  {salesOrderSection?.customerInfo?.salesPerson && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Sales Person:</p>
                      <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.salesPerson}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {salesOrderSection?.customerInfo?.email && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Email:</p>
                      <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.email}</p>
                    </div>
                  )}
                  {salesOrderSection?.customerInfo?.mobileNo && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Mobile:</p>
                      <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.customerInfo.mobileNo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ORDER DETAILS */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
                Order Details
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Job Reference:</p>
                    <p className={`text-lg ${dmSans.className}`}>{workOrderSection?.jobReference || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Client PO Number:</p>
                    <p className={`text-lg ${dmSans.className}`}>{workOrderSection?.clientPONumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {salesOrderSection?.orderDetails?.productType && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Product Type:</p>
                      <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.orderDetails.productType}</p>
                    </div>
                  )}
                  {salesOrderSection?.orderDetails?.poValue && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>PO Value:</p>
                      <p className={`text-lg ${dmSans.className}`}>
                        Rs. {formatCurrency(salesOrderSection.orderDetails.poValue)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workOrderSection?.deliveryDate && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Delivery Date:</p>
                      <p className={`text-lg ${dmSans.className}`}>{formatDate(workOrderSection.deliveryDate)}</p>
                    </div>
                  )}
                  {salesOrderSection?.orderDetails?.expectedCompletionDate && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Expected Completion:</p>
                      <p className={`text-lg ${dmSans.className}`}>
                        {formatDate(salesOrderSection.orderDetails.expectedCompletionDate)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Drawing Approved:</p>
                    <p className={`text-lg ${dmSans.className}`}>
                      {salesOrderSection?.orderDetails?.shopDrawingApproval ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {salesOrderSection?.orderDetails?.shopDrawingApprovalDate && (
                    <div>
                      <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Approval Date:</p>
                      <p className={`text-lg ${dmSans.className}`}>
                        {formatDate(salesOrderSection.orderDetails.shopDrawingApprovalDate)}
                      </p>
                    </div>
                  )}
                </div>

                {salesOrderSection?.orderDetails?.specialInstructions && (
                  <div>
                    <p className={`text-lg font-semibold text-gray-600 ${dmSans.className}`}>Special Instructions:</p>
                    <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.orderDetails.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WORK ORDER PRODUCTS */}
          {workOrderSection?.products?.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <h2 className={`text-2xl font-semibold text-[#8B5E3C] p-6 pb-4 ${dmSans.className}`}>Work Order</h2>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">S No.</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Serial Number</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Description</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Qty</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workOrderSection.products.map((product: Product, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{i + 1}.</td>
                        <td className="px-6 py-4 font-medium">{product.serialNumber || '-'}</td>
                        <td className="px-6 py-4">{product.itemDescription}</td>
                        <td className="px-6 py-4 text-right">{product.quantity}</td>
                        <td className="px-6 py-4 text-gray-500">{product.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PURCHASE ORDER SECTION */}
          {purchaseOrderSection?.poTable?.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <h2 className={`text-2xl font-semibold text-[#8B5E3C] p-6 pb-4 ${dmSans.className}`}>Purchase Order</h2>

              {/* Purchase Order Meta */}
              <div className="px-6 pb-4 space-y-4">
                {purchaseOrderSection.shipTo && (
                  <div>
                    <p className={`text-lg font-semibold ${dmSans.className}`}>Ship To:</p>
                    <p className={`${dmSans.className}`}>{purchaseOrderSection.shipTo}</p>
                  </div>
                )}
                {purchaseOrderSection.paymentTerms && (
                  <div>
                    <p className={`text-lg font-semibold ${dmSans.className}`}>Payment Terms:</p>
                    <p className={`${dmSans.className}`}>{purchaseOrderSection.paymentTerms}</p>
                  </div>
                )}
                {purchaseOrderSection.deliveryTerms && (
                  <div>
                    <p className={`text-lg font-semibold ${dmSans.className}`}>Delivery Terms:</p>
                    <p className={`${dmSans.className}`}>{purchaseOrderSection.deliveryTerms}</p>
                  </div>
                )}
              </div>

              {/* Purchase Order Table */}
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Unit</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Qty</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Unit Rate (PKR)</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">GST</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">GST Amount</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseOrderSection.poTable.map((item: POItem, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{item.description}</td>
                        <td className="px-6 py-4">{item.unit}</td>
                        <td className="px-6 py-4 text-right">{item.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(item.unitRatePKR)}</td>
                        <td className="px-6 py-4 text-right">
                          {item.gstApplicable ? `${item.gstPercentage || 0}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.gstApplicable ? formatCurrency(item.gstAmount) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{formatCurrency(item.totalAmountPKR)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {purchaseOrderSection.gstSummary && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          Subtotal:
                        </td>
                        <td colSpan={2} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          Rs. {formatCurrency(purchaseOrderSection.gstSummary.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          Total GST:
                        </td>
                        <td colSpan={2} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          Rs. {formatCurrency(purchaseOrderSection.gstSummary.totalGST)}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td colSpan={5} className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                          Grand Total:
                        </td>
                        <td colSpan={2} className="px-6 py-3 text-right text-sm font-bold text-[#8B5E3C]">
                          Rs. {formatCurrency(purchaseOrderSection.gstSummary.grandTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {salesOrderSection?.termsAndConditions && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
                Terms & Conditions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={`text-lg font-semibold ${dmSans.className}`}>Payment Type:</p>
                  <p className={`${dmSans.className}`}>
                    {salesOrderSection.termsAndConditions.paymentType || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-lg font-semibold ${dmSans.className}`}>Prices Include GST:</p>
                  <p className={`${dmSans.className}`}>
                    {salesOrderSection.termsAndConditions.pricesIncludeGST ? 'Yes' : 'No'}
                  </p>
                </div>
                {salesOrderSection.termsAndConditions.gstPercentage && (
                  <div>
                    <p className={`text-lg font-semibold ${dmSans.className}`}>GST Percentage:</p>
                    <p className={`${dmSans.className}`}>
                      {salesOrderSection.termsAndConditions.gstPercentage}%
                    </p>
                  </div>
                )}
                <div>
                  <p className={`text-lg font-semibold ${dmSans.className}`}>Delivery Method:</p>
                  <p className={`${dmSans.className}`}>
                    {salesOrderSection.termsAndConditions.deliveryMethod || 'N/A'}
                  </p>
                </div>
                {salesOrderSection.termsAndConditions.warrantyPeriod && (
                  <div>
                    <p className={`text-lg font-semibold ${dmSans.className}`}>Warranty Period:</p>
                    <p className={`${dmSans.className}`}>
                      {salesOrderSection.termsAndConditions.warrantyPeriod}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Required Documents */}
          {salesOrderSection?.requiredDocuments && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
                Required Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {salesOrderSection.requiredDocuments.quotationWithFinalPriceUrl && (
                  <div>
                    <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Quotation with Final Price</h3>
                    <a
                      href={salesOrderSection.requiredDocuments.quotationWithFinalPriceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      📄 {salesOrderSection.requiredDocuments.quotationWithFinalPriceName || 'Document'}
                    </a>
                  </div>
                )}
                {salesOrderSection.requiredDocuments.approvedShopDrawingUrl && (
                  <div>
                    <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Approved Shop Drawing</h3>
                    <a
                      href={salesOrderSection.requiredDocuments.approvedShopDrawingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      📄 {salesOrderSection.requiredDocuments.approvedShopDrawingName || 'Document'}
                    </a>
                  </div>
                )}
                {salesOrderSection.requiredDocuments.componentListUrl && (
                  <div>
                    <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Component List</h3>
                    <a
                      href={salesOrderSection.requiredDocuments.componentListUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      📄 {salesOrderSection.requiredDocuments.componentListName || 'Document'}
                    </a>
                  </div>
                )}
                {salesOrderSection.requiredDocuments.customerPOCopyUrl && (
                  <div>
                    <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Customer PO Copy</h3>
                    <a
                      href={salesOrderSection.requiredDocuments.customerPOCopyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      📄 {salesOrderSection.requiredDocuments.customerPOCopyName || 'Document'}
                    </a>
                  </div>
                )}
                {salesOrderSection.requiredDocuments.technicalSpecificationsUrl && (
                  <div>
                    <h3 className="text-lg font-medium text-[#8B5E3C] mb-3">Technical Specifications</h3>
                    <a
                      href={salesOrderSection.requiredDocuments.technicalSpecificationsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      📄 {salesOrderSection.requiredDocuments.technicalSpecificationsName || 'Document'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Authorized By */}
          {salesOrderSection?.authorizedBy && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
                Authorization
              </h2>
              <div className="flex justify-end">
                <div className="text-center">
                  <p className={`text-lg font-semibold ${dmSans.className}`}>Authorized By:</p>
                  <p className={`text-lg ${dmSans.className}`}>{salesOrderSection.authorizedBy}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}