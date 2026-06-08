// // app/manual-work-order/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import ProtectedRoute from "@/app/Components/ProtectedRoute";
// import { DM_Sans } from 'next/font/google'
// import Sidebar from '@/app/Mechanical/Components/sidebar'
// import { HiSearch, HiX, HiPrinter, HiEye } from 'react-icons/hi'
// import toast, { Toaster } from 'react-hot-toast'

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-dm-sans',
// })

// interface StoreItem {
//   _id: string
//   partNumber: string
//   partName: string
//   category: string
//   storeLocation: string
//   gauge?: string
//   material?: string
//   blankWidthMM?: number
//   blankLengthMM?: number
//   blankWidthInch?: number
//   blankLengthInch?: number
//   blankWidth?: number
//   blankLength?: number
//   sqft?: number
//   todayPaintCost?: number
//   stockInStore: number
//   minimumStockLevel: number
//   unitOfMeasure: string
//   weight?: number
// }

// interface PartItem {
//   partNo: string
//   partName: string
//   category: string
//   storeLocation: string
//   blankWidthMM?: number
//   blankLengthMM?: number
//   blankWidthInch?: number
//   blankLengthInch?: number
//   blankWidth?: number
//   blankLength?: number
//   blankSizeSqft: number
//   totalSqft?: number
//   paintCostPerSqft: number
//   paintCostPerPiece: number
//   gauge: string
//   material: string
//   qty: number
//   storeItemId?: string
//   originalQty?: number
//   totalPrice?: number
//   originalPaintCostPerPiece?: number // Store original value for backend
// }

// interface MechanicalPart {
//   partNo: string
//   partName: string
//   category: string
//   storeLocation: string
//   blankWidthMM?: number
//   blankLengthMM?: number
//   blankWidthInch?: number
//   blankLengthInch?: number
//   blankWidth?: number
//   blankLength?: number
//   blankSizeSqft: number
//   sheetCost: number
//   todayPaintCost: number
//   paintCostPerPiece: number
//   gauge: string
//   material: string
//   qty: number
//   storeItemId?: string
// }

// interface MechanicalOp {
//   _id: string
//   workOrderNo: string
//   gatepassNo: string
//   dateIssued: string
//   remarks?: string
//   parts: MechanicalPart[]
// }

// interface ManualWorkOrder {
//   _id: string
//   _createdAt: string
//   workOrderNo: string
//   gatepassNo: string
//   mwo: string
//   dateIssued: string
//   remarks?: string
//   parts: PartItem[]
//   total?: number
// }

// interface FormData {
//   workOrderNo: string
//   gatepassNo: string
//   mwo: string
//   dateIssued: string
//   remarks: string
//   parts: PartItem[]
// }

// // Define ExtendedStoreItem interface
// interface ExtendedStoreItem extends StoreItem {
//   weight: number
// }

// // Helper function to convert inches to mm
// const inchesToMM = (inches: number): number => {
//   return Number((inches * 25.4).toFixed(1))
// }

// // Helper function to get dimension display
// const getDimensionDisplay = (item: StoreItem | PartItem): string => {
//   if (item.blankWidthMM && item.blankLengthMM && item.blankWidthMM > 0 && item.blankLengthMM > 0) {
//     return `${item.blankWidthMM}mm x ${item.blankLengthMM}mm`
//   }
//   const width = (item as StoreItem).blankWidthInch || (item as PartItem).blankWidthInch || (item as StoreItem).blankWidth || (item as PartItem).blankWidth || 0
//   const length = (item as StoreItem).blankLengthInch || (item as PartItem).blankLengthInch || (item as StoreItem).blankLength || (item as PartItem).blankLength || 0
//   return `${inchesToMM(width)}mm x ${inchesToMM(length)}mm`
// }

// export default function ManualWorkOrderList() {
//   const [manualWorkOrders, setManualWorkOrders] = useState<ManualWorkOrder[]>([])
//   const [mechanicalOps, setMechanicalOps] = useState<MechanicalOp[]>([])
//   const [storeItems, setStoreItems] = useState<StoreItem[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [deletingId, setDeletingId] = useState<string | null>(null)
//   const [isMobile, setIsMobile] = useState(false)
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [editingItem, setEditingItem] = useState<ManualWorkOrder | null>(null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [currentPartIndex, setCurrentPartIndex] = useState<number | null>(null)
//   const [isPartModalOpen, setIsPartModalOpen] = useState(false)
//   const [selectedStoreItem, setSelectedStoreItem] = useState<StoreItem | null>(null)
//   const [partSearchTerm, setPartSearchTerm] = useState('')
//   const [partQuantity, setPartQuantity] = useState(1)
//   const [isMechanicalModalOpen, setIsMechanicalModalOpen] = useState(false)
//   const [mechanicalSearchTerm, setMechanicalSearchTerm] = useState('')
//   const [printFormatModal, setPrintFormatModal] = useState(false)
//   const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<ManualWorkOrder | null>(null)
  
//   // View Modal State
//   const [viewModalOpen, setViewModalOpen] = useState(false)
//   const [selectedOrderForView, setSelectedOrderForView] = useState<ManualWorkOrder | null>(null)
  
//   const [formData, setFormData] = useState<FormData>({
//     workOrderNo: '',
//     gatepassNo: '',
//     mwo: '',
//     dateIssued: '',
//     remarks: '',
//     parts: []
//   })

//   const generateGatepassNumber = () => {
//     const date = new Date()
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
//     return `P-IN-${year}${month}${day}-${random}`
//   }

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768)
//     }
    
//     handleResize()
//     window.addEventListener('resize', handleResize)
//     return () => window.removeEventListener('resize', handleResize)
//   }, [])

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const storeResponse = await fetch('/api/store/add-item')
//         if (!storeResponse.ok) throw new Error('Failed to fetch store items')
//         const storeResult = await storeResponse.json()
        
//         const storeItemsWithMM: ExtendedStoreItem[] = (Array.isArray(storeResult) ? storeResult : []).map((item: StoreItem) => ({
//           ...item,
//           weight: (item as { weight?: number }).weight || 0,
//           sqft: (item as { sqft?: number }).sqft || 0,
//           blankWidthMM: (item as { blankWidthMM?: number }).blankWidthMM || 0,
//           blankLengthMM: (item as { blankLengthMM?: number }).blankLengthMM || 0,
//           blankWidthInch: (item as { blankWidthInch?: number }).blankWidthInch || (item.blankWidth || 0),
//           blankLengthInch: (item as { blankLengthInch?: number }).blankLengthInch || (item.blankLength || 0),
//           blankWidth: (item as { blankWidthInch?: number }).blankWidthInch || item.blankWidth || 0,
//           blankLength: (item as { blankLengthInch?: number }).blankLengthInch || item.blankLength || 0,
//         }))
        
//         setStoreItems(storeItemsWithMM)

//         const mechanicalResponse = await fetch('/api/mechanical-op')
//         if (!mechanicalResponse.ok) throw new Error('Failed to fetch mechanical operations')
//         const mechanicalResult = await mechanicalResponse.json()
        
//         const mappedMechanicalOps: MechanicalOp[] = (Array.isArray(mechanicalResult) ? mechanicalResult : []).map((op: MechanicalOp) => ({
//           ...op,
//           parts: (op.parts || []).map((part: MechanicalPart) => {
//             // CRITICAL: Preserve todayPaintCost from the API response
//             const todayPaintCostValue = part.todayPaintCost || 0
//             const originalPaintCostPerPieceValue = part.paintCostPerPiece || (part.blankSizeSqft * todayPaintCostValue) || 0
//             // Multiply by 2 for display
//             const paintCostPerPieceValue = originalPaintCostPerPieceValue * 2
            
//             return {
//               partNo: part.partNo,
//               partName: part.partName,
//               category: part.category,
//               storeLocation: part.storeLocation,
//               blankWidthMM: part.blankWidthMM || 0,
//               blankLengthMM: part.blankLengthMM || 0,
//               blankWidthInch: part.blankWidthInch || part.blankWidth || 0,
//               blankLengthInch: part.blankLengthInch || part.blankLength || 0,
//               blankWidth: part.blankWidthInch || part.blankWidth || 0,
//               blankLength: part.blankLengthInch || part.blankLength || 0,
//               blankSizeSqft: part.blankSizeSqft || 0,
//               sheetCost: part.sheetCost || 0,
//               todayPaintCost: todayPaintCostValue,
//               paintCostPerPiece: paintCostPerPieceValue, // Display value (×2)
//               gauge: part.gauge || '',
//               material: part.material || '',
//               qty: part.qty || 0,
//               storeItemId: part.storeItemId
//             }
//           }) || []
//         }))
        
//         console.log('Mechanical Ops loaded with todayPaintCost (×2 applied for display):', mappedMechanicalOps.map(op => ({
//           workOrderNo: op.workOrderNo,
//           parts: op.parts.map(p => ({
//             name: p.partName,
//             todayPaintCost: p.todayPaintCost,
//             paintCostPerPiece: p.paintCostPerPiece
//           }))
//         })))
        
//         setMechanicalOps(mappedMechanicalOps)

//         const workOrderResponse = await fetch('/api/paint-in-opr')
//         if (!workOrderResponse.ok) throw new Error('Failed to fetch paint inward work orders')
//         const workOrderResult = await workOrderResponse.json()
        
//         const workOrdersData = workOrderResult.data || workOrderResult
        
//         // Process existing work orders to multiply paintCostPerPiece by 2 for display
//         const processedWorkOrders = (Array.isArray(workOrdersData) ? workOrdersData : []).map((order: any) => ({
//           ...order,
//           parts: order.parts.map((part: any) => ({
//             ...part,
//             paintCostPerPiece: (part.paintCostPerPiece || 0) * 2, // Multiply by 2 for display
//             totalPrice: ((part.paintCostPerPiece || 0) * 2) * (part.qty || 0) // Recalculate total with ×2
//           })),
//           total: order.total ? order.total * 2 : undefined // Also multiply total if exists
//         }))
        
//         setManualWorkOrders(processedWorkOrders)
//       } catch (err) {
//         console.error('Failed to fetch data', err)
//         setError('Failed to load data')
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   // Open View Modal
//   const openViewModal = (order: ManualWorkOrder) => {
//     setSelectedOrderForView(order)
//     setViewModalOpen(true)
//   }

//   const formatDateTime = (dateString?: string) => {
//     if (!dateString) return 'N/A'
//     const date = new Date(dateString)
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const calculateTotalCost = (parts: PartItem[]) => {
//     return parts.reduce((total, part) => total + ((part.paintCostPerPiece || 0) * (part.qty || 0)), 0)
//   }

//   const calculateTotalQty = (parts: PartItem[]) => {
//     return parts.reduce((total, part) => total + (part.qty || 0), 0)
//   }

//   const calculateTotalSqft = (parts: PartItem[]) => {
//     return parts.reduce((total, part) => total + ((part.blankSizeSqft || 0) * (part.qty || 0)), 0)
//   }

//   const calculatePartTotal = (part: PartItem) => {
//     return (part.paintCostPerPiece || 0) * (part.qty || 0)
//   }

//   const filteredItems = Array.isArray(manualWorkOrders) ? manualWorkOrders.filter(item => {
//     if (!searchTerm) return true
//     const searchLower = searchTerm.toLowerCase()
//     return (
//       (item.workOrderNo?.toLowerCase() || '').includes(searchLower) ||
//       (item.gatepassNo?.toLowerCase() || '').includes(searchLower) ||
//       (item.mwo?.toLowerCase() || '').includes(searchLower) ||
//       (item.remarks?.toLowerCase() || '').includes(searchLower) ||
//       item.parts?.some(part => 
//         part.partNo?.toLowerCase().includes(searchLower) ||
//         part.partName?.toLowerCase().includes(searchLower)
//       )
//     )
//   }) : []

//   const filteredMechanicalOps = Array.isArray(mechanicalOps) ? mechanicalOps.filter(item => {
//     if (!mechanicalSearchTerm) return true
//     const searchLower = mechanicalSearchTerm.toLowerCase()
//     return (
//       (item.workOrderNo?.toLowerCase() || '').includes(searchLower) ||
//       (item.gatepassNo?.toLowerCase() || '').includes(searchLower) ||
//       item.parts?.some(part => 
//         part.partNo?.toLowerCase().includes(searchLower) ||
//         part.partName?.toLowerCase().includes(searchLower)
//       )
//     )
//   }) : []

//   const filteredStoreItems = Array.isArray(storeItems) ? storeItems.filter(item => {
//     if (!partSearchTerm) return true
//     const searchLower = partSearchTerm.toLowerCase()
//     return (
//       (item.partNumber?.toLowerCase() || '').includes(searchLower) ||
//       (item.partName?.toLowerCase() || '').includes(searchLower) ||
//       (item.category?.toLowerCase() || '').includes(searchLower) ||
//       (item.material?.toLowerCase() || '').includes(searchLower)
//     )
//   }) : []

//   // Open print format selection modal
//   const openPrintFormatModal = (order: ManualWorkOrder) => {
//     setSelectedOrderForPrint(order)
//     setPrintFormatModal(true)
//   }

//   // Qadri Paint Format - with dimensions in mm, Qty between Dimensions and SQFT (×2 applied)
//   const handlePrintQadriPaintFormat = (order: ManualWorkOrder) => {
//     setPrintFormatModal(false)
//     setTimeout(() => {
//       const totalQty = calculateTotalQty(order.parts)
//       const totalCost = order.total || calculateTotalCost(order.parts)
//       const totalSqft = calculateTotalSqft(order.parts)
      
//       const printWindow = window.open('', '_blank')
//       if (printWindow) {
//         printWindow.document.write(`
//           <!DOCTYPE html>
//           <html>
//             <head>
//               <title>Qadri Paint - ${order.workOrderNo}</title>
//               <style>
//                 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
//                 * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
//                 body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
//                 .print-container { max-width: 1200px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
//                 .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding: 5px 15px 10px 15px; border-bottom: 2px solid #000; background: #fff; }
//                 .logo-placeholder { width: 250px; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #000; font-weight: 600; text-transform: uppercase; }
//                 .logo-img { width: 250px; height: 100px; object-fit: contain; }
//                 .title-section { flex: 2; text-align: right; margin-top: -3px; }
//                 .main-title { font-size: 24px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.1em; }
//                 .challan-type { font-size: 16px; font-weight: bold; margin-top: 3px; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; }
//                 .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
//                 .info-table { width: 100%; border-collapse: collapse; }
//                 .info-table td { padding: 3px 8px; vertical-align: top; }
//                 .info-label { font-weight: bold; white-space: nowrap; }
//                 .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; margin-top: 10px; margin-bottom: 0; }
//                 .data-table th { background: #f0f0f0; padding: 6px 4px; text-align: center; font-weight: bold; border: 1px solid #000; }
//                 .data-table td { padding: 4px 4px; border: 1px solid #000; }
//                 .numeric-cell { text-align: right; }
//                 .center-cell { text-align: center; }
//                 .total-row { background: #e8f5e8 !important; font-weight: bold; }
//                 .remarks-section { padding: 8px 15px; margin: 5px 15px; }
//                 .remarks-label { font-weight: bold; font-size: 11px; }
//                 .remarks-text { font-size: 11px; margin-top: 3px; line-height: 1.3; }
//                 .content-wrapper { flex: 1; }
//                 .signature-section { padding: 10px 15px 5px 15px; margin-top: auto; border-top: 1px solid #000; }
//                 .signature-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-top: 5px; }
//                 .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
//                 .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
//                 .datetime-footer { text-align: left; padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; font-weight: bold; }
//                 .multiplier-note { background: #fff3cd; border: 1px solid #ffc107; padding: 5px 10px; margin: 10px 15px; font-size: 10px; text-align: center; border-radius: 4px; }
//                 @media print { body { padding: 3px; } .print-container { border: none; } }
//               </style>
//             </head>
//             <body>
//               <div class="print-container">
//                 <div class="header-section">
//                   <div class="logo-section"><div class="logo-placeholder"><img src="${window.location.origin}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='COMPANY LOGO';"></div></div>
//                   <div class="title-section"><div class="main-title">PAINT INWARD</div><div class="challan-type">QADRI PAINT - WORK ORDER</div></div>
//                 </div>
//                 <div class="content-wrapper">
//                   <div class="info-section">
//                     <table class="info-table"><tbody>
//                       <tr><td class="info-label">M/S Qadri Spray Tech</td><td></td><td class="info-label">Work Order No:</td><td>${order.workOrderNo}</td></tr>
//                       <tr><td class="info-label">Production Order No#:</td><td>${order.mwo || 'N/A'}</td><td class="info-label">Gate Pass No:</td><td>${order.gatepassNo}</td></tr>
//                       <tr><td class="info-label">Date Issued:</td><td>${formatDateTime(order.dateIssued)}</td><td></td><td></td></tr>
//                     </tbody></table>
//                   </div>
//                   <div style="overflow-x: auto;">
//                     <table class="data-table">
//                       <thead>
//                         <tr>
//                           <th>S.No</th>
//                           <th>Part No</th>
//                           <th>Part Name</th>
//                           <th>Material/Gauge</th>
//                           <th>Dimensions (mm)</th>
//                           <th>Qty</th>
//                           <th>SQFT</th>
//                           <th>Total SQFT</th>
//                           <th>Paint Cost/SQFT</th>
//                           <th>Paint Cost/Piece</th>
//                           <th>Total Cost</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         ${order.parts.map((part, idx) => {
//                           const totalSqftVal = (part.blankSizeSqft || 0) * part.qty
//                           const dimensionDisplay = getDimensionDisplay(part)
//                           return `
//                             <tr>
//                               <td class="center-cell">${idx + 1}</td>
//                               <td class="center-cell">${part.partNo}</td>
//                               <td>${part.partName}</td>
//                               <td class="center-cell">${part.material}/${part.gauge}</td>
//                               <td class="center-cell">${dimensionDisplay}</td>
//                               <td class="center-cell">${part.qty}</td>
//                               <td class="numeric-cell">${part.blankSizeSqft || 0}</td>
//                               <td class="numeric-cell">${totalSqftVal.toFixed(2)}</td>
//                               <td class="numeric-cell">Rs ${(part.paintCostPerSqft || 0).toLocaleString()}</td>
//                               <td class="numeric-cell">Rs ${(part.paintCostPerPiece || 0).toLocaleString()}</td>
//                               <td class="numeric-cell">Rs ${((part.paintCostPerPiece || 0) * part.qty).toLocaleString()}</td>
//                             </tr>
//                           `
//                         }).join('')}
//                       </tbody>
//                       <tfoot>
//                         <tr class="total-row">
//                           <td colspan="5" class="numeric-cell">GRAND TOTAL:</td>
//                           <td class="center-cell">${totalQty}</td>
//                           <td class="numeric-cell">-</td>
//                           <td class="numeric-cell">${totalSqft.toFixed(2)}</td>
//                           <td class="numeric-cell">-</td>
//                           <td class="numeric-cell">-</td>
//                           <td class="numeric-cell">Rs ${totalCost.toLocaleString()}</td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                   </div>
//                 </div>
//                 ${order.remarks ? `
//                 <div class="remarks-section">
//                   <div class="remarks-label">REMARKS:</div>
//                   <div class="remarks-text">${order.remarks}</div>
//                 </div>
//                 ` : ''}
//                 <div class="signature-section">
//                   <div class="signature-grid">
//                     <div><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
//                     <div><div class="signature-line"></div><div class="signature-label">Store Dept.</div></div>
//                     <div><div class="signature-line"></div><div class="signature-label">Accounts Dept.</div></div>
//                     <div><div class="signature-line"></div><div class="signature-label">Received By</div></div>
//                   </div>
//                 </div>
//                 <div class="datetime-footer">Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
//               </div>
//             </body>
//           </html>
//         `)
//         printWindow.document.close()
//         printWindow.focus()
//         printWindow.print()
//         printWindow.onafterprint = () => printWindow.close()
//       }
//     }, 100)
//   }

//   // Floor Format Print - with dimensions in mm, Qty between Dimensions and SQFT (×2 applied in display but hidden)
//   const handlePrintFloorFormat = (order: ManualWorkOrder) => {
//     setPrintFormatModal(false)
//     setTimeout(() => {
//       const totalQty = calculateTotalQty(order.parts)
//       const totalSqft = calculateTotalSqft(order.parts)
      
//       const printWindow = window.open('', '_blank')
//       if (printWindow) {
//         printWindow.document.write(`
//           <!DOCTYPE html>
//           <html>
//             <head>
//               <title>Floor Format - ${order.workOrderNo}</title>
//               <style>
//                 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
//                 * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
//                 body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
//                 .print-container { max-width: 1200px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
//                 .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding: 5px 15px 10px 15px; border-bottom: 2px solid #000; background: #fff; }
//                 .logo-placeholder { width: 250px; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #000; font-weight: 600; text-transform: uppercase; }
//                 .logo-img { width: 250px; height: 100px; object-fit: contain; }
//                 .title-section { flex: 2; text-align: right; margin-top: -3px; }
//                 .main-title { font-size: 24px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.1em; }
//                 .challan-type { font-size: 16px; font-weight: bold; margin-top: 3px; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; background: #e8f5e8; }
//                 .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
//                 .info-table { width: 100%; border-collapse: collapse; }
//                 .info-table td { padding: 3px 8px; vertical-align: top; }
//                 .info-label { font-weight: bold; white-space: nowrap; }
//                 .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; margin-top: 10px; margin-bottom: 0; }
//                 .data-table th { background: #f0f0f0; padding: 6px 4px; text-align: center; font-weight: bold; border: 1px solid #000; }
//                 .data-table td { padding: 4px 4px; border: 1px solid #000; }
//                 .center-cell { text-align: center; }
//                 .numeric-cell { text-align: right; }
//                 .total-row { background: #e8f5e8 !important; font-weight: bold; }
//                 .remarks-section { padding: 8px 15px; margin: 5px 15px; }
//                 .remarks-label { font-weight: bold; font-size: 11px; }
//                 .remarks-text { font-size: 11px; margin-top: 3px; line-height: 1.3; }
//                 .content-wrapper { flex: 1; }
//                 .signature-section { padding: 10px 15px 5px 15px; margin-top: auto; border-top: 1px solid #000; }
//                 .signature-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-top: 5px; }
//                 .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
//                 .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
//                 .datetime-footer { text-align: left; padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; font-weight: bold; }
//                 @media print { body { padding: 3px; } .print-container { border: none; } }
//               </style>
//             </head>
//             <body>
//               <div class="print-container">
//                 <div class="header-section">
//                   <div class="logo-section"><div class="logo-placeholder"><img src="${window.location.origin}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='COMPANY LOGO';"></div></div>
//                   <div class="title-section"><div class="main-title">PAINT INWARD</div><div class="challan-type">FLOOR TASK</div></div>
//                 </div>
//                 <div class="content-wrapper">
//                   <div class="info-section">
//                     <table class="info-table"><tbody>
//                       <tr><td class="info-label">M/S Qadri Spray Tech</td><td></td><td class="info-label">Work Order No:</td><td>${order.workOrderNo}</td></tr>
//                       <tr><td class="info-label">Production Order No#:</td><td>${order.mwo || 'N/A'}</td><td class="info-label">Gate Pass No:</td><td>${order.gatepassNo}</td></tr>
//                       <tr><td class="info-label">Date Issued:</td><td>${formatDateTime(order.dateIssued)}</td><td></td><td></td></tr>
//                     </tbody></table>
//                   </div>
//                   <div style="overflow-x: auto;">
//                     <table class="data-table">
//                       <thead>
//                         <tr>
//                           <th>S.No</th>
//                           <th>Part No</th>
//                           <th>Part Name</th>
//                           <th>Material/Gauge</th>
//                           <th>Dimensions (mm)</th>
//                           <th>Qty</th>
//                           <th>SQFT</th>
//                           <th>Total SQFT</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         ${order.parts.map((part, idx) => {
//                           const totalSqftVal = (part.blankSizeSqft || 0) * part.qty
//                           const dimensionDisplay = getDimensionDisplay(part)
//                           return `
//                             <tr>
//                               <td class="center-cell">${idx + 1}</td>
//                               <td class="center-cell">${part.partNo}</td>
//                               <td>${part.partName}</td>
//                               <td class="center-cell">${part.material}/${part.gauge}</td>
//                               <td class="center-cell">${dimensionDisplay}</td>
//                               <td class="center-cell">${part.qty}</td>
//                               <td class="numeric-cell">${part.blankSizeSqft || 0}</td>
//                               <td class="numeric-cell">${totalSqftVal.toFixed(2)}</td>
//                             </tr>
//                           `
//                         }).join('')}
//                       </tbody>
//                       <tfoot>
//                         <tr class="total-row">
//                           <td colspan="5" class="numeric-cell">GRAND TOTAL:</td>
//                           <td class="center-cell">${totalQty}</td>
//                           <td class="numeric-cell">-</td>
//                           <td class="numeric-cell">${totalSqft.toFixed(2)}</td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                   </div>
//                 </div>
//                 ${order.remarks ? `
//                 <div class="remarks-section">
//                   <div class="remarks-label">REMARKS:</div>
//                   <div class="remarks-text">${order.remarks}</div>
//                 </div>
//                 ` : ''}
//                 <div class="signature-section">
//                   <div class="signature-grid">
//                     <div><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
//                     <div><div class="signature-line"></div><div class="signature-label">Store Dept.</div></div>
//                     <div><div class="signature-line"></div><div class="signature-label">Accounts Dept.</div></div>
//                     <div><div class="signature-line"></div><div class="signature-label">Received By</div></div>
//                   </div>
//                 </div>
//                 <div class="datetime-footer">Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
//               </div>
//             </body>
//           </html>
//         `)
//         printWindow.document.close()
//         printWindow.focus()
//         printWindow.print()
//         printWindow.onafterprint = () => printWindow.close()
//       }
//     }, 100)
//   }

//   const handleDelete = async (id: string) => {
//     const item = manualWorkOrders.find(item => item._id === id)
//     const workOrderNo = item?.workOrderNo || 'this item'

//     toast.custom((t) => (
//       <div className={`bg-white p-6 rounded-lg shadow-xl border border-gray-200 max-w-md ${dmSans.className}`}>
//         <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
//         <p className="text-gray-600 mb-6">
//           Are you sure you want to delete Work Order <span className="font-semibold">{workOrderNo}</span>? 
//           This action cannot be undone.
//         </p>
//         <div className="flex justify-end space-x-3">
//           <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button>
//           <button onClick={async () => {
//             toast.dismiss(t.id)
//             try {
//               setDeletingId(id)
//               const res = await fetch(`/api/paint-in-opr?id=${id}`, { method: 'DELETE' })
//               const data = await res.json()
//               if (!res.ok) throw new Error(data.error || data.details || 'Failed to delete')
//               setManualWorkOrders(prev => prev.filter(item => item._id !== id))
//               toast.success(`Work Order ${workOrderNo} deleted successfully!`, { duration: 4000 })
//             } catch (err) {
//               console.error('Delete error:', err)
//               toast.error(err instanceof Error ? err.message : `Failed to delete ${workOrderNo}`, { duration: 4000 })
//             } finally {
//               setDeletingId(null)
//             }
//           }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition">Delete</button>
//         </div>
//       </div>
//     ), { duration: Infinity })
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const resetForm = () => {
//     setFormData({
//       workOrderNo: '',
//       gatepassNo: generateGatepassNumber(),
//       mwo: '',
//       dateIssued: new Date().toISOString().slice(0, 16),
//       remarks: '',
//       parts: []
//     })
//   }

//   const resetPartSelection = () => {
//     setSelectedStoreItem(null)
//     setPartQuantity(1)
//     setPartSearchTerm('')
//     setCurrentPartIndex(null)
//   }

//   const openAddModal = () => {
//     resetForm()
//     setIsAddModalOpen(true)
//   }

//   const openEditModal = (item: ManualWorkOrder) => {
//     setEditingItem(item)
//     setFormData({
//       workOrderNo: item.workOrderNo,
//       gatepassNo: item.gatepassNo,
//       mwo: item.mwo || '',
//       dateIssued: item.dateIssued,
//       remarks: item.remarks || '',
//       parts: item.parts.map(part => ({ 
//         ...part,
//         paintCostPerSqft: part.paintCostPerSqft || 0,
//         paintCostPerPiece: part.paintCostPerPiece || 0, // Already multiplied by 2 from fetch
//         blankWidth: part.blankWidth || 0,
//         blankLength: part.blankLength || 0,
//         totalSqft: (part.blankSizeSqft || 0) * (part.qty || 0)
//       }))
//     })
//     setIsEditModalOpen(true)
//   }

//   // FIXED: Select Mechanical Op - properly preserve paint cost values with ×2 multiplier for display
//   const selectMechanicalOp = (item: MechanicalOp) => {
//     const paintInwardGatepassNo = generateGatepassNumber()

//     console.log('=== Loading Mechanical OP to Paint Inward ===')
//     console.log('Work Order:', item.workOrderNo)
//     console.log('Gate Pass Number (will be used as MWO/Doc Ref):', item.gatepassNo)
//     console.log('Parts with paint cost (×2 applied):', item.parts.map(p => ({
//       name: p.partName,
//       todayPaintCost: p.todayPaintCost,
//       paintCostPerPiece: p.paintCostPerPiece,
//       blankSizeSqft: p.blankSizeSqft,
//       qty: p.qty
//     })))

//     setFormData(prev => ({
//       ...prev,
//       workOrderNo: item.workOrderNo,
//       gatepassNo: paintInwardGatepassNo,
//       mwo: item.gatepassNo,  // Document Ref No# = Gate Pass Number from Mechanical OP
//       dateIssued: item.dateIssued,
//       remarks: item.remarks || `Loaded from Mechanical OP: ${item.workOrderNo}`,
//       parts: item.parts.map(part => {
//         // CRITICAL: Preserve the paint cost values from mechanical op (already multiplied by 2)
//         const paintCostPerSqftValue = part.todayPaintCost || 0
//         const paintCostPerPieceValue = part.paintCostPerPiece || (part.blankSizeSqft * paintCostPerSqftValue * 2) || 0
//         const blankSizeSqftValue = part.blankSizeSqft || 0
//         const totalSqftValue = blankSizeSqftValue * part.qty
//         const totalPriceValue = paintCostPerPieceValue * part.qty
        
//         console.log(`Part ${part.partName}:`, {
//           blankSizeSqft: blankSizeSqftValue,
//           paintCostPerSqft: paintCostPerSqftValue,
//           paintCostPerPiece: paintCostPerPieceValue,
//           qty: part.qty,
//           totalPrice: totalPriceValue,
//           note: 'Paint Cost/Piece already includes ×2 multiplier'
//         })
        
//         return {
//           partNo: part.partNo,
//           partName: part.partName,
//           category: part.category,
//           storeLocation: part.storeLocation,
//           blankWidthMM: part.blankWidthMM || 0,
//           blankLengthMM: part.blankLengthMM || 0,
//           blankWidthInch: part.blankWidthInch || 0,
//           blankLengthInch: part.blankLengthInch || 0,
//           blankWidth: part.blankWidthInch || 0,
//           blankLength: part.blankLengthInch || 0,
//           blankSizeSqft: blankSizeSqftValue,
//           totalSqft: totalSqftValue,
//           paintCostPerSqft: paintCostPerSqftValue,
//           paintCostPerPiece: paintCostPerPieceValue, // This already has ×2
//           gauge: part.gauge,
//           material: part.material,
//           qty: part.qty,
//           originalQty: part.qty,
//           storeItemId: part.storeItemId,
//           totalPrice: totalPriceValue
//         }
//       })
//     }))
//     setIsMechanicalModalOpen(false)
//     toast.success(`Work order ${item.workOrderNo} loaded successfully! Document Ref (MWO): ${item.gatepassNo} | Paint Cost/SQFT: ${item.parts[0]?.todayPaintCost || 'N/A'} | Paint Cost/Piece displayed with ×2`, { duration: 5000 })
//   }

//   const selectStoreItem = (item: StoreItem) => {
//     setSelectedStoreItem(item)
//     setPartQuantity(1)
//   }

//   const addPartToWorkOrder = () => {
//     if (!selectedStoreItem) {
//       toast.error('Please select a part first')
//       return
//     }

//     if (partQuantity <= 0) {
//       toast.error('Please enter a valid quantity')
//       return
//     }

//     if (partQuantity > selectedStoreItem.stockInStore) {
//       toast.error(`Insufficient stock! Only ${selectedStoreItem.stockInStore} ${selectedStoreItem.unitOfMeasure} available.`)
//       return
//     }

//     const paintCostPerSqftValue = selectedStoreItem.todayPaintCost || 0
//     // Calculate original value then multiply by 2 for display
//     const originalPaintCostPerPieceValue = (selectedStoreItem.sqft || 0) * paintCostPerSqftValue
//     const paintCostPerPieceValue = originalPaintCostPerPieceValue * 2

//     const newPart: PartItem = {
//       partNo: selectedStoreItem.partNumber,
//       partName: selectedStoreItem.partName,
//       category: selectedStoreItem.category,
//       storeLocation: selectedStoreItem.storeLocation,
//       blankWidthMM: selectedStoreItem.blankWidthMM || 0,
//       blankLengthMM: selectedStoreItem.blankLengthMM || 0,
//       blankWidthInch: selectedStoreItem.blankWidthInch || 0,
//       blankLengthInch: selectedStoreItem.blankLengthInch || 0,
//       blankWidth: selectedStoreItem.blankWidthInch || 0,
//       blankLength: selectedStoreItem.blankLengthInch || 0,
//       blankSizeSqft: selectedStoreItem.sqft || 0,
//       totalSqft: (selectedStoreItem.sqft || 0) * partQuantity,
//       paintCostPerSqft: paintCostPerSqftValue,
//       paintCostPerPiece: paintCostPerPieceValue, // ×2 for display
//       gauge: selectedStoreItem.gauge || '',
//       material: selectedStoreItem.material || '',
//       qty: partQuantity,
//       storeItemId: selectedStoreItem._id,
//       totalPrice: paintCostPerPieceValue * partQuantity
//     }

//     const updatedParts = [...formData.parts]

//     if (currentPartIndex !== null) {
//       updatedParts[currentPartIndex] = newPart
//     } else {
//       updatedParts.push(newPart)
//     }

//     setFormData(prev => ({ ...prev, parts: updatedParts }))
//     setIsPartModalOpen(false)
//     resetPartSelection()
//     toast.success(`${selectedStoreItem.partName} added to work order | Paint Cost/Piece: Rs ${paintCostPerPieceValue.toLocaleString()} (×2 applied)`)
//   }

//   const openPartSelection = (index?: number) => {
//     if (index !== undefined) {
//       const part = formData.parts[index]
//       const storeItem = storeItems.find(item => item._id === part.storeItemId)
//       if (storeItem) {
//         setSelectedStoreItem(storeItem)
//         setPartQuantity(part.qty)
//         setCurrentPartIndex(index)
//       }
//     } else {
//       resetPartSelection()
//     }
//     setIsPartModalOpen(true)
//   }

//   const removePart = (index: number) => {
//     const updatedParts = formData.parts.filter((_, i) => i !== index)
//     setFormData(prev => ({ ...prev, parts: updatedParts }))
//     toast.success('Part removed')
//   }

//   const updatePartQuantity = (index: number, newQuantity: number) => {
//     const part = formData.parts[index]

//     if (part.originalQty !== undefined) {
//       if (newQuantity > part.originalQty) {
//         toast.error(`Cannot increase quantity above original (${part.originalQty}). You can only decrease.`)
//         return
//       }
//     }

//     if (newQuantity <= 0) {
//       toast.error('Quantity must be greater than 0')
//       return
//     }

//     const updatedParts = [...formData.parts]
//     updatedParts[index] = { 
//       ...updatedParts[index], 
//       qty: newQuantity,
//       totalSqft: (updatedParts[index].blankSizeSqft || 0) * newQuantity,
//       totalPrice: (updatedParts[index].paintCostPerPiece || 0) * newQuantity
//     }
//     setFormData(prev => ({ ...prev, parts: updatedParts }))
//     toast.success(`Quantity updated to ${newQuantity}`)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!formData.workOrderNo || !formData.gatepassNo || !formData.mwo || !formData.dateIssued) {
//       toast.error('Please fill in all required fields (Work Order, Gate Pass, MWO, Date)')
//       return
//     }

//     if (formData.parts.length === 0) {
//       toast.error('Please add at least one part')
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       const formattedParts = formData.parts.map(part => ({
//         partNo: part.partNo,
//         partName: part.partName,
//         category: part.category,
//         storeLocation: part.storeLocation,
//         blankWidth: part.blankWidthInch || part.blankWidth || 0,
//         blankLength: part.blankLengthInch || part.blankLength || 0,
//         blankSizeSqft: part.blankSizeSqft,
//         paintCostPerSqft: part.paintCostPerSqft,
//         paintCostPerPiece: part.paintCostPerPiece / 2, // Divide by 2 to store original value in backend
//         gauge: part.gauge,
//         material: part.material,
//         qty: part.qty,
//         storeItemId: part.storeItemId
//       }))

//       console.log('Submitting Paint Inward with parts:', formattedParts.map(p => ({
//         name: p.partName,
//         paintCostPerSqft: p.paintCostPerSqft,
//         paintCostPerPiece: p.paintCostPerPiece, // This is original value (without ×2)
//         blankSizeSqft: p.blankSizeSqft,
//         qty: p.qty,
//         note: 'paintCostPerPiece is original value (divided by 2) for backend storage'
//       })))

//       const newWorkOrder = {
//         workOrderNo: formData.workOrderNo,
//         gatepassNo: formData.gatepassNo,
//         mwo: formData.mwo,
//         dateIssued: formData.dateIssued,
//         remarks: formData.remarks || undefined,
//         parts: formattedParts
//       }

//       const response = await fetch('/api/paint-in-opr', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newWorkOrder),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || result.details || 'Failed to add work order')
//       }

//       const refreshResponse = await fetch('/api/paint-in-opr')
//       const refreshData = await refreshResponse.json()
      
//       // Process fetched data to multiply by 2 for display
//       const processedData = (refreshData.data || refreshData).map((order: any) => ({
//         ...order,
//         parts: order.parts.map((part: any) => ({
//           ...part,
//           paintCostPerPiece: (part.paintCostPerPiece || 0) * 2,
//           totalPrice: ((part.paintCostPerPiece || 0) * 2) * (part.qty || 0)
//         })),
//         total: order.total ? order.total * 2 : undefined
//       }))
      
//       setManualWorkOrders(processedData)
      
//       toast.success(result.message || 'Work order created successfully! Paint Cost/Piece ×2 applied for display', { duration: 3000 })
//       setIsAddModalOpen(false)
//       resetForm()
      
//     } catch (error) {
//       console.error('Error adding work order:', error)
//       toast.error(error instanceof Error ? error.message : 'Failed to add work order. Please try again.')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleEditSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!formData.workOrderNo || !formData.gatepassNo || !formData.mwo || !formData.dateIssued) {
//       toast.error('Please fill in all required fields (Work Order, Gate Pass, MWO, Date)')
//       return
//     }

//     if (formData.parts.length === 0) {
//       toast.error('Please add at least one part')
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       const formattedParts = formData.parts.map(part => ({
//         partNo: part.partNo,
//         partName: part.partName,
//         category: part.category,
//         storeLocation: part.storeLocation,
//         blankWidth: part.blankWidthInch || part.blankWidth || 0,
//         blankLength: part.blankLengthInch || part.blankLength || 0,
//         blankSizeSqft: part.blankSizeSqft,
//         paintCostPerSqft: part.paintCostPerSqft,
//         paintCostPerPiece: part.paintCostPerPiece / 2, // Divide by 2 for backend storage
//         gauge: part.gauge,
//         material: part.material,
//         qty: part.qty,
//         storeItemId: part.storeItemId
//       }))

//       const updateData = {
//         id: editingItem?._id,
//         workOrderNo: formData.workOrderNo,
//         gatepassNo: formData.gatepassNo,
//         mwo: formData.mwo,
//         dateIssued: formData.dateIssued,
//         remarks: formData.remarks,
//         parts: formattedParts
//       }

//       const response = await fetch('/api/paint-in-opr', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updateData),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to update work order')
//       }

//       const refreshResponse = await fetch('/api/paint-in-opr')
//       const refreshData = await refreshResponse.json()
      
//       // Process fetched data to multiply by 2 for display
//       const processedData = (refreshData.data || refreshData).map((order: any) => ({
//         ...order,
//         parts: order.parts.map((part: any) => ({
//           ...part,
//           paintCostPerPiece: (part.paintCostPerPiece || 0) * 2,
//           totalPrice: ((part.paintCostPerPiece || 0) * 2) * (part.qty || 0)
//         })),
//         total: order.total ? order.total * 2 : undefined
//       }))
      
//       setManualWorkOrders(processedData)
      
//       toast.success('Work order updated successfully! Paint Cost/Piece ×2 applied for display', { duration: 3000 })
//       setIsEditModalOpen(false)
//       resetForm()
//       setEditingItem(null)
      
//     } catch (error) {
//       console.error('Error updating work order:', error)
//       toast.error(error instanceof Error ? error.message : 'Failed to update work order')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.className} font-sans`}>
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//         <main className="max-w-7xl mx-auto px-4 py-10">
//           <div className="bg-red-100 text-red-700 p-4 rounded-md">
//             <p className="font-medium">{error}</p>
//           </div>
//         </main>
//       </div>
//     )
//   }

//   return (
//     <ProtectedRoute allowedUser='mechanical'>
//       <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//         <Toaster position="top-center" />
//         <Sidebar />
        
//         <main className={`max-w-7xl mx-auto px-4 py-10 space-y-8 transition-all duration-300 ${
//           isAddModalOpen || isEditModalOpen || isPartModalOpen || isMechanicalModalOpen || printFormatModal || viewModalOpen ? 'blur-sm pointer-events-none' : ''
//         }`}>
          
//           <div className="flex flex-col gap-6 border-b pb-6">
//             <div className="space-y-2">
//               <h1 className={`text-2xl sm:text-3xl pt-8 font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
//                 Paint Inward Management
//               </h1>
//               <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>
//                 Manage gatepasses
//               </p>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
//               <div className="relative w-full sm:w-96">
//                 <span className="absolute left-3 top-2.5 text-gray-400">
//                   <HiSearch className="w-5 h-5" />
//                 </span>
//                 <input
//                   type="text"
//                   placeholder="Search by work order, gate pass, MWO, part number, part name..."
//                   className={`w-full pl-10 pr-24 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none transition ${dmSans.className}`}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="absolute right-16 top-2.5 text-gray-400 hover:text-gray-600"
//                   >
//                     <HiX className="w-5 h-5" />
//                   </button>
//                 )}
//                 <button className="absolute right-1.5 top-1.5 px-3 py-1.5 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] transition">
//                   Search
//                 </button>
//               </div>
//               <button
//                 onClick={openAddModal}
//                 className="px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition text-sm font-medium"
//               >
//                 + Create Work Order
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="bg-gray-50 rounded-lg p-4 border">
//               <p className="text-sm text-gray-500">Total Work Orders</p>
//               <p className="text-2xl font-bold text-gray-800">{manualWorkOrders.length}</p>
//             </div>
//             <div className="bg-gray-50 rounded-lg p-4 border">
//               <p className="text-sm text-gray-500">Total Parts Issued</p>
//               <p className="text-2xl font-bold text-gray-800">
//                 {manualWorkOrders.reduce((sum, op) => sum + calculateTotalQty(op.parts), 0)}
//               </p>
//             </div>
//             <div className="bg-gray-50 rounded-lg p-4 border">
//               <p className="text-sm text-gray-500">Total Cost (PKR)</p>
//               <p className="text-2xl font-bold text-[#8B5E3C]">
//                 Rs {manualWorkOrders.reduce((sum, op) => sum + (op.total || calculateTotalCost(op.parts)), 0).toLocaleString()}
//               </p>
//             </div>
//             <div className="bg-gray-50 rounded-lg p-4 border">
//               <p className="text-sm text-gray-500">Total SQFT Issued</p>
//               <p className="text-2xl font-bold text-gray-800">
//                 {manualWorkOrders.reduce((sum, op) => sum + calculateTotalSqft(op.parts), 0).toFixed(2)}
//               </p>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             {isMobile ? (
//               <div className="space-y-4">
//                 {filteredItems.length === 0 ? (
//                   <div className="text-center py-4 text-gray-500">No work orders found</div>
//                 ) : (
//                   filteredItems.map((item) => (
//                     <div key={item._id} className="bg-white border rounded-lg p-4 shadow-sm">
//                       <div className="space-y-2">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h3 className="font-medium text-[#8B5E3C]">WO: {item.workOrderNo}</h3>
//                             <p className="text-xs text-gray-500">GP: {item.gatepassNo}</p>
//                             <p className="text-xs text-gray-500">MWO: {item.mwo || 'N/A'}</p>
//                           </div>
//                           <div className="flex space-x-2">
//                             <button onClick={() => openViewModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">
//                               <HiEye className="inline w-4 h-4 mr-1" /> View
//                             </button>
//                             <button onClick={() => openPrintFormatModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">🖨️ Print</button>
//                             <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
//                             <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}
//                               className={`text-red-600 hover:text-red-800 text-sm ${deletingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
//                               {deletingId === item._id ? 'Deleting...' : 'Delete'}
//                             </button>
//                           </div>
//                         </div>
//                         <div className="text-sm space-y-1">
//                           <p><span className="font-medium">Date Issued:</span> {formatDateTime(item.dateIssued)}</p>
//                           <p><span className="font-medium">Parts:</span> {item.parts.length} items</p>
//                           <p><span className="font-medium">Total Qty:</span> {calculateTotalQty(item.parts)}</p>
//                           <p><span className="font-medium">Total SQFT:</span> {calculateTotalSqft(item.parts).toFixed(2)}</p>
//                           <p><span className="font-medium">Total Cost (×2):</span> Rs {(item.total || calculateTotalCost(item.parts)).toLocaleString()}</p>
//                           {item.remarks && <p><span className="font-medium">Remarks:</span> {item.remarks}</p>}
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             ) : (
//               <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
//                 <table className={`w-full table-auto divide-y divide-gray-200 ${dmSans.className}`}>
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Work Order #</th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gate Pass #</th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">MWO (Doc Ref)</th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date Issued</th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Parts</th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Qty</th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total SQFT</th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Cost</th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredItems.length === 0 ? (
//                       <tr>
//                         <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">No work orders found</td>
//                       </tr>
//                     ) : (
//                       filteredItems.map((item) => (
//                         <tr key={item._id} className="hover:bg-gray-50">
//                           <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.workOrderNo}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{item.gatepassNo}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{item.mwo || 'N/A'}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(item.dateIssued)}</td>
//                           <td className="px-4 py-4 text-sm text-gray-700">
//                             <div className="space-y-1">
//                               {item.parts.slice(0, 2).map((part, idx) => (
//                                 <div key={idx} className="text-xs">{part.partName} (x{part.qty})</div>
//                               ))}
//                               {item.parts.length > 2 && <div className="text-xs text-gray-500">+{item.parts.length - 2} more</div>}
//                             </div>
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{calculateTotalQty(item.parts)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{calculateTotalSqft(item.parts).toFixed(2)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">Rs {(item.total || calculateTotalCost(item.parts)).toLocaleString()}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 space-x-3">
//                             <button onClick={() => openViewModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">
//                               <HiEye className="inline w-4 h-4 mr-1" /> View
//                             </button>
//                             <button onClick={() => openPrintFormatModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">
//                               <HiPrinter className="inline w-4 h-4 mr-1" /> Print
//                             </button>
//                             <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
//                             <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}
//                               className={`text-red-600 hover:text-red-800 font-medium ${deletingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
//                               {deletingId === item._id ? 'Deleting...' : 'Delete'}
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </main>

//         {/* View Modal */}
//         {viewModalOpen && selectedOrderForView && (
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setViewModalOpen(false)}></div>
//             <div className="relative min-h-screen flex items-center justify-center p-4">
//               <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                   <div>
//                     <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Paint Inward Details</h2>
//                     <p className="text-sm text-gray-500 mt-1">{selectedOrderForView.workOrderNo}</p>
//                   </div>
//                   <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <div className="p-6">
//                   <div className="border rounded-lg overflow-hidden">
//                     <div className="bg-gray-50 p-4 border-b">
//                       <h3 className="font-bold text-lg">PAINT INWARD</h3>
//                       <p className="text-sm text-gray-600">QADRI PAINT - WORK ORDER</p>
//                     </div>
//                     <div className="p-4 space-y-4">
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
//                         <div><span className="font-semibold">Work Order No:</span> {selectedOrderForView.workOrderNo}</div>
//                         <div><span className="font-semibold">MWO (Doc Ref):</span> <span className="font-mono">{selectedOrderForView.mwo || 'N/A'}</span></div>
//                         <div><span className="font-semibold">Gate Pass No:</span> <span className="font-mono">{selectedOrderForView.gatepassNo}</span></div>
//                         <div><span className="font-semibold">Date Issued:</span> {formatDateTime(selectedOrderForView.dateIssued)}</div>
//                         <div><span className="font-semibold">Total Cost:</span> <span className="text-green-600 font-bold">Rs {selectedOrderForView.total?.toLocaleString() || calculateTotalCost(selectedOrderForView.parts).toLocaleString()}</span></div>
//                       </div>
                      
//                       {selectedOrderForView.remarks && (
//                         <div className="bg-gray-50 p-3 rounded">
//                           <p className="font-semibold text-sm">REMARKS:</p>
//                           <p className="text-sm mt-1">{selectedOrderForView.remarks}</p>
//                         </div>
//                       )}
                      
//                       <div className="overflow-x-auto">
//                         <table className="w-full text-sm border">
//                           <thead className="bg-gray-100">
//                             <tr>
//                               <th className="px-3 py-2 border text-left">S.No</th>
//                               <th className="px-3 py-2 border text-left">Part Name</th>
//                               <th className="px-3 py-2 border text-left">Part No</th>
//                               <th className="px-3 py-2 border text-left">Material/Gauge</th>
//                               <th className="px-3 py-2 border text-left">Dimensions (mm)</th>
//                               <th className="px-3 py-2 border text-right">SQFT</th>
//                               <th className="px-3 py-2 border text-right">Total SQFT</th>
//                               <th className="px-3 py-2 border text-right">Paint Cost/SQFT</th>
//                               <th className="px-3 py-2 border text-right">Paint Cost/Piece</th>
//                               <th className="px-3 py-2 border text-right">Qty</th>
//                               <th className="px-3 py-2 border text-right">Total Cost</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {selectedOrderForView.parts.map((part, idx) => {
//                               const totalSqftVal = (part.blankSizeSqft || 0) * part.qty
//                               const dimensionDisplay = getDimensionDisplay(part)
//                               const partTotal = (part.paintCostPerPiece || 0) * part.qty
//                               return (
//                                 <tr key={idx} className="hover:bg-gray-50">
//                                   <td className="px-3 py-2 border text-center">{idx + 1}</td>
//                                   <td className="px-3 py-2 border">{part.partName}</td>
//                                   <td className="px-3 py-2 border">{part.partNo}</td>
//                                   <td className="px-3 py-2 border">{part.material}/{part.gauge}</td>
//                                   <td className="px-3 py-2 border text-center">{dimensionDisplay}</td>
//                                   <td className="px-3 py-2 border text-right">{part.blankSizeSqft || 0}</td>
//                                   <td className="px-3 py-2 border text-right">{totalSqftVal.toFixed(2)}</td>
//                                   <td className="px-3 py-2 border text-right">Rs {(part.paintCostPerSqft || 0).toLocaleString()}</td>
//                                   <td className="px-3 py-2 border text-right text-purple-600">Rs {(part.paintCostPerPiece || 0).toLocaleString()}</td>
//                                   <td className="px-3 py-2 border text-right font-bold">{part.qty}</td>
//                                   <td className="px-3 py-2 border text-right font-bold text-green-600">Rs {partTotal.toLocaleString()}</td>
//                                 </tr>
//                               )
//                             })}
//                           </tbody>
//                           <tfoot className="bg-green-50 font-semibold">
//                             <tr>
//                               <td colSpan={6} className="px-3 py-2 border text-right">GRAND TOTAL:</td>
//                               <td className="px-3 py-2 border text-right">{selectedOrderForView.parts.reduce((sum, p) => sum + ((p.blankSizeSqft || 0) * p.qty), 0).toFixed(2)}</td>
//                               <td colSpan={2} className="px-3 py-2 border text-right">-</td>
//                               <td className="px-3 py-2 border text-right">{selectedOrderForView.parts.reduce((sum, p) => sum + p.qty, 0)}</td>
//                               <td className="px-3 py-2 border text-right text-green-600 font-bold">
//                                 Rs {selectedOrderForView.parts.reduce((sum, p) => sum + ((p.paintCostPerPiece || 0) * p.qty), 0).toLocaleString()}
//                               </td>
//                             </tr>
//                           </tfoot>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
//                   <button
//                     onClick={() => {
//                       setViewModalOpen(false);
//                       openPrintFormatModal(selectedOrderForView);
//                     }}
//                     className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
//                   >
//                     <HiPrinter className="w-4 h-4" /> Print
//                   </button>
//                   <button
//                     onClick={() => setViewModalOpen(false)}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Print Format Selection Modal */}
//         {printFormatModal && selectedOrderForPrint && (
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setPrintFormatModal(false)}></div>
//             <div className="relative min-h-screen flex items-center justify-center p-4">
//               <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
//                 <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
//                   <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Select Print Format</h2>
//                   <button onClick={() => setPrintFormatModal(false)} className="text-gray-400 hover:text-gray-600">
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//                 <div className="p-6 space-y-4">
//                   <button onClick={() => handlePrintQadriPaintFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition">
//                     <div className="font-semibold text-gray-800">🎨 Qadri Paint Format</div>
//                     <div className="text-sm text-gray-500 mt-1">Complete commercial view</div>
//                   </button>
//                   <button onClick={() => handlePrintFloorFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition">
//                     <div className="font-semibold text-gray-800">🏭 Floor Format</div>
//                     <div className="text-sm text-gray-500 mt-1">Production task view - Costs hidden</div>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Add/Edit Work Order Modal */}
//         {(isAddModalOpen || isEditModalOpen) && (
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
//               setIsAddModalOpen(false)
//               setIsEditModalOpen(false)
//               resetForm()
//               setEditingItem(null)
//             }}></div>
            
//             <div className="relative min-h-screen flex items-center justify-center p-4">
//               <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                   <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
//                     {isEditModalOpen ? 'Edit Work Order' : 'Create New Work Order'}
//                   </h2>
//                   <div className="flex gap-2">
//                     {!isEditModalOpen && (
//                       <button type="button" onClick={() => setIsMechanicalModalOpen(true)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
//                         Load from Mechanical OP
//                       </button>
//                     )}
//                     <button onClick={() => {
//                       setIsAddModalOpen(false)
//                       setIsEditModalOpen(false)
//                       resetForm()
//                       setEditingItem(null)
//                     }} className="text-gray-400 hover:text-gray-600">
//                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>

//                 <form onSubmit={isEditModalOpen ? handleEditSubmit : handleSubmit} className="p-6 space-y-6">
//                   <div className="bg-gray-50 rounded-lg p-6 border">
//                     <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Basic Information</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
//                           Work Order Number <span className="text-red-500">*</span>
//                         </label>
//                         <input type="text" name="workOrderNo" value={formData.workOrderNo} onChange={handleChange} required
//                           className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none"
//                           placeholder="Enter work order number (e.g., WO-001)" />
//                       </div>
//                       <div>
//                         <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
//                           Gate Pass Number <span className="text-red-500">*</span>
//                         </label>
//                         <input type="text" name="gatepassNo" value={formData.gatepassNo} onChange={handleChange} required readOnly
//                           className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none bg-gray-100 cursor-not-allowed"
//                           placeholder="Gate pass number" />
//                         <p className="text-xs text-gray-500 mt-1">Gate pass number is auto-generated in P-IN-YYYYMMDD-RRRR format</p>
//                       </div>
//                       <div>
//                         <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
//                           Document Ref No# (MWO) <span className="text-red-500">*</span>
//                         </label>
//                         <input type="text" name="mwo" value={formData.mwo} onChange={handleChange} required
//                           className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${isEditModalOpen ? 'bg-gray-100' : ''}`}
//                           placeholder="Enter MWO reference (auto-filled from Mechanical OP)" 
//                           readOnly={isEditModalOpen} />
//                         <p className="text-xs text-gray-500 mt-1">Reference to the original Mechanical Work Order number</p>
//                       </div>
//                       <div>
//                         <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
//                           Date Issued <span className="text-red-500">*</span>
//                         </label>
//                         <input type="datetime-local" name="dateIssued" value={formData.dateIssued} onChange={handleChange} required
//                           className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" />
//                       </div>
//                       <div className="md:col-span-2">
//                         <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Remarks</label>
//                         <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2}
//                           className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none"
//                           placeholder="Additional notes..." />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 rounded-lg p-6 border">
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className={`text-lg font-semibold text-gray-800 ${dmSans.className}`}>Parts List (Paint Cost per SQFT with ×2 Multiplier)</h3>
//                       <button type="button" onClick={() => openPartSelection()}
//                         className="px-3 py-1.5 text-sm bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition">
//                         + Add Part from Store
//                       </button>
//                     </div>

//                     {formData.parts.length === 0 ? (
//                       <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
//                         No parts added yet. Click "Add Part from Store" to add items.
//                       </div>
//                     ) : (
//                       <>
//                         <div className="overflow-x-auto">
//                           <table className="w-full text-sm">
//                             <thead className="bg-gray-100">
//                               <tr>
//                                 <th className="px-3 py-2 text-left">Part #</th>
//                                 <th className="px-3 py-2 text-left">Part Name</th>
//                                 <th className="px-3 py-2 text-left">Material/Gauge</th>
//                                 <th className="px-3 py-2 text-left">Dimensions (mm)</th>
//                                 <th className="px-3 py-2 text-right">SQFT</th>
//                                 <th className="px-3 py-2 text-right">Total SQFT</th>
//                                 <th className="px-3 py-2 text-right">Paint Cost/SQFT</th>
//                                 <th className="px-3 py-2 text-right">Paint Cost/Piece (×2)</th>
//                                 <th className="px-3 py-2 text-right">Qty</th>
//                                 <th className="px-3 py-2 text-right">Total (×2)</th>
//                                 <th className="px-3 py-2 text-center">Actions</th>
//                               </tr>
//                             </thead>
//                             <tbody className="divide-y">
//                               {formData.parts.map((part, idx) => {
//                                 const partTotal = calculatePartTotal(part)
//                                 const totalSqftVal = (part.blankSizeSqft || 0) * part.qty
//                                 const dimensionDisplay = getDimensionDisplay(part)
//                                 return (
//                                   <tr key={idx} className="hover:bg-gray-50">
//                                     <td className="px-3 py-2">{part.partNo}</td>
//                                     <td className="px-3 py-2 font-medium">{part.partName}</td>
//                                     <td className="px-3 py-2">{part.material}/{part.gauge}</td>
//                                     <td className="px-3 py-2">{dimensionDisplay}</td>
//                                     <td className="px-3 py-2 text-right">{part.blankSizeSqft}</td>
//                                     <td className="px-3 py-2 text-right">{totalSqftVal.toFixed(2)}</td>
//                                     <td className="px-3 py-2 text-right">Rs {(part.paintCostPerSqft || 0).toLocaleString()}</td>
//                                     <td className="px-3 py-2 text-right text-purple-600">Rs {(part.paintCostPerPiece || 0).toLocaleString()}</td>
//                                     <td className="px-3 py-2 text-right">
//                                       <div className="flex items-center gap-2 justify-end">
//                                         <button type="button" onClick={() => updatePartQuantity(idx, part.qty - 1)}
//                                           className="px-2 py-1 text-red-600 hover:text-red-800 border rounded" disabled={part.qty <= 1}>-</button>
//                                         <span className="w-12 text-center font-medium">{part.qty}</span>
//                                         <button type="button" onClick={() => updatePartQuantity(idx, part.qty + 1)}
//                                           className="px-2 py-1 text-green-600 hover:text-green-800 border rounded"
//                                           disabled={part.originalQty !== undefined && part.qty >= part.originalQty}>+</button>
//                                       </div>
//                                       </td>
//                                     <td className="px-3 py-2 text-right font-medium">Rs {partTotal.toLocaleString()}</td>
//                                     <td className="px-3 py-2 text-center space-x-2">
//                                       <button type="button" onClick={() => openPartSelection(idx)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
//                                       <button type="button" onClick={() => removePart(idx)} className="text-red-600 hover:text-red-800 text-xs">Remove</button>
//                                     </td>
//                                   </tr>
//                                 )
//                               })}
//                             </tbody>
//                           </table>
//                         </div>

//                         {/* GRAND TOTAL SECTION */}
//                         <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mt-6">
//                           <div className="flex justify-between items-center flex-wrap gap-4">
//                             <div>
//                               <h4 className="text-lg font-bold text-gray-800">Grand Total (×2 Multiplier Applied)</h4>
//                               <p className="text-sm text-gray-600 mt-1">
//                                 Total Quantity: <span className="font-semibold text-gray-900">{formData.parts.reduce((sum, p) => sum + p.qty, 0)}</span> units
//                               </p>
//                               <p className="text-sm text-gray-600">
//                                 Total SQFT: <span className="font-semibold text-gray-900">{formData.parts.reduce((sum, p) => sum + ((p.blankSizeSqft || 0) * p.qty), 0).toFixed(2)}</span> sqft
//                               </p>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-sm text-gray-600">Total Amount (with ×2)</p>
//                               <p className="text-3xl font-bold text-[#8B5E3C]">
//                                 Rs {formData.parts.reduce((sum, p) => sum + ((p.paintCostPerPiece || 0) * p.qty), 0).toLocaleString()}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </div>

//                   <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-white py-4 border-t">
//                     <button type="button" onClick={() => {
//                       setIsAddModalOpen(false)
//                       setIsEditModalOpen(false)
//                       resetForm()
//                       setEditingItem(null)
//                     }} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">
//                       Cancel
//                     </button>
//                     <button type="submit" disabled={isSubmitting}
//                       className="px-6 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] transition disabled:opacity-50">
//                       {isSubmitting ? (isEditModalOpen ? 'Updating...' : 'Creating...') : (isEditModalOpen ? 'Update Work Order' : 'Create Work Order')}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Mechanical Operations Selection Modal */}
//         {isMechanicalModalOpen && (
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
//               setIsMechanicalModalOpen(false)
//               setMechanicalSearchTerm('')
//             }}></div>
            
//             <div className="relative min-h-screen flex items-center justify-center p-4">
//               <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                   <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
//                     Select Work Order from Mechanical Operations
//                   </h2>
//                   <p className="text-sm text-gray-500 ml-4">Note: Paint Cost/Piece will be multiplied by ×2 for display</p>
//                   <button onClick={() => {
//                     setIsMechanicalModalOpen(false)
//                     setMechanicalSearchTerm('')
//                   }} className="text-gray-400 hover:text-gray-600">
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <div className="p-6">
//                   <div className="mb-4">
//                     <div className="relative">
//                       <span className="absolute left-3 top-2.5 text-gray-400"><HiSearch className="w-5 h-5" /></span>
//                       <input type="text" placeholder="Search by work order number, gate pass, part name..."
//                         className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${dmSans.className}`}
//                         value={mechanicalSearchTerm} onChange={(e) => setMechanicalSearchTerm(e.target.value)} />
//                     </div>
//                   </div>

//                   <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 sticky top-0">
//                         <tr>
//                           <th className="px-3 py-2 text-left">Work Order #</th>
//                           <th className="px-3 py-2 text-left">Gate Pass #</th>
//                           <th className="px-3 py-2 text-left">Date Issued</th>
//                           <th className="px-3 py-2 text-left">Parts</th>
//                           <th className="px-3 py-2 text-right">Total Qty</th>
//                           <th className="px-3 py-2 text-right">Paint Cost/SQFT</th>
//                           <th className="px-3 py-2 text-right">Paint Cost/Piece</th>
//                           <th className="px-3 py-2 text-center">Action</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {filteredMechanicalOps.length === 0 ? (
//                           <tr>
//                             <td colSpan={8} className="px-3 py-8 text-center text-gray-500">No mechanical operations found</td>
//                           </tr>
//                         ) : (
//                           filteredMechanicalOps.map((item) => {
//                             const firstPartPaintCost = item.parts[0]?.todayPaintCost || 0
//                             const firstPartPaintCostPerPiece = item.parts[0]?.paintCostPerPiece || 0
//                             return (
//                               <tr key={item._id} className="hover:bg-gray-50">
//                                 <td className="px-3 py-2 font-medium">{item.workOrderNo}</td>
//                                 <td className="px-3 py-2">{item.gatepassNo}</td>
//                                 <td className="px-3 py-2">{formatDateTime(item.dateIssued)}</td>
//                                 <td className="px-3 py-2">{item.parts?.length || 0} items</td>
//                                 <td className="px-3 py-2 text-right">{item.parts?.reduce((sum, p) => sum + p.qty, 0) || 0}</td>
//                                 <td className="px-3 py-2 text-right font-semibold text-blue-600">Rs {firstPartPaintCost.toLocaleString()}</td>
//                                 <td className="px-3 py-2 text-right font-semibold text-purple-600">Rs {firstPartPaintCostPerPiece.toLocaleString()}</td>
//                                 <td className="px-3 py-2 text-center">
//                                   <button onClick={() => selectMechanicalOp(item)} className="px-3 py-1 text-xs bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition">
//                                     Select
//                                   </button>
//                                 </td>
//                               </tr>
//                             )
//                           })
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Part Selection Modal - Table with mm dimensions */}
//         {isPartModalOpen && (
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
//               setIsPartModalOpen(false)
//               resetPartSelection()
//             }}></div>
            
//             <div className="relative min-h-screen flex items-center justify-center p-4">
//               <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                   <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Select Part from Store Inventory</h2>
//                   <button onClick={() => { setIsPartModalOpen(false); resetPartSelection() }} className="text-gray-400 hover:text-gray-600">
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <div className="p-6">
//                   <div className="mb-4">
//                     <div className="relative">
//                       <span className="absolute left-3 top-2.5 text-gray-400"><HiSearch className="w-5 h-5" /></span>
//                       <input type="text" placeholder="Search by part number, name, category, material..."
//                         className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${dmSans.className}`}
//                         value={partSearchTerm} onChange={(e) => setPartSearchTerm(e.target.value)} />
//                     </div>
//                   </div>

//                   <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 sticky top-0">
//                         <tr>
//                           <th className="px-3 py-2 text-left">Part #</th>
//                           <th className="px-3 py-2 text-left">Part Name</th>
//                           <th className="px-3 py-2 text-left">Material/Gauge</th>
//                           <th className="px-3 py-2 text-left">Dimensions (mm)</th>
//                           <th className="px-3 py-2 text-right">SQFT</th>
//                           <th className="px-3 py-2 text-right">Stock</th>
//                           <th className="px-3 py-2 text-right">Paint Cost/SQFT</th>
//                           <th className="px-3 py-2 text-right">Paint Cost/Piece</th>
//                           <th className="px-3 py-2 text-center">Action</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {filteredStoreItems.length === 0 ? (
//                           <tr>
//                             <td colSpan={9} className="px-3 py-8 text-center text-gray-500">No parts found in store</td>
//                           </tr>
//                         ) : (
//                           filteredStoreItems.map((item) => {
//                             const paintCostPerSqft = item.todayPaintCost || 0
//                             const originalPaintCostPerPiece = (item.sqft || 0) * paintCostPerSqft
//                             const paintCostPerPiece = originalPaintCostPerPiece * 2
//                             const dimensionDisplay = getDimensionDisplay(item)
//                             return (
//                               <tr key={item._id} className="hover:bg-gray-50">
//                                 <td className="px-3 py-2 font-mono text-xs">{item.partNumber}</td>
//                                 <td className="px-3 py-2 font-medium">{item.partName}</td>
//                                 <td className="px-3 py-2">{item.material}/{item.gauge}</td>
//                                 <td className="px-3 py-2 text-xs">{dimensionDisplay}</td>
//                                 <td className="px-3 py-2 text-right">{item.sqft}</td>
//                                 <td className="px-3 py-2 text-right">
//                                   <span className={item.stockInStore <= 0 ? 'text-red-600' : 'text-green-600'}>
//                                     {item.stockInStore} {item.unitOfMeasure}
//                                   </span>
//                                 </td>
//                                 <td className="px-3 py-2 text-right">Rs {paintCostPerSqft.toLocaleString()}</td>
//                                 <td className="px-3 py-2 text-right text-purple-600">Rs {paintCostPerPiece.toLocaleString()}</td>
//                                 <td className="px-3 py-2 text-center">
//                                   {selectedStoreItem?._id === item._id ? (
//                                     <div className="flex items-center gap-2">
//                                       <input type="number" value={partQuantity} onChange={(e) => setPartQuantity(Number(e.target.value))}
//                                         className="w-20 px-2 py-1 border rounded text-sm text-center" min="1" max={item.stockInStore} />
//                                       <button onClick={addPartToWorkOrder} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Add</button>
//                                     </div>
//                                   ) : (
//                                     <button onClick={() => selectStoreItem(item)} disabled={item.stockInStore <= 0}
//                                       className={`px-3 py-1 text-xs rounded-md transition ${item.stockInStore > 0 ? 'bg-[#8B5E3C] text-white hover:bg-[#6d4a2f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
//                                       {item.stockInStore > 0 ? 'Select' : 'Out of Stock'}
//                                     </button>
//                                   )}
//                                 </td>
//                               </tr>
//                             )
//                           })
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </ProtectedRoute>
//   )
// }

// export const dynamic = 'force-dynamic'





// app/manual-work-order/page.tsx
'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from "@/app/Components/ProtectedRoute";
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Mechanical/Components/sidebar'
import { HiSearch, HiX, HiPrinter, HiEye } from 'react-icons/hi'
import toast, { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

interface StoreItem {
  _id: string
  partNumber: string
  partName: string
  category: string
  storeLocation: string
  gauge?: string
  material?: string
  blankWidthMM?: number
  blankLengthMM?: number
  blankWidthInch?: number
  blankLengthInch?: number
  blankWidth?: number
  blankLength?: number
  sqft?: number
  todayPaintCost?: number
  stockInStore: number
  minimumStockLevel: number
  unitOfMeasure: string
  weight?: number
}

interface PartItem {
  partNo: string
  partName: string
  category: string
  storeLocation: string
  blankWidthMM?: number
  blankLengthMM?: number
  blankWidthInch?: number
  blankLengthInch?: number
  blankWidth?: number
  blankLength?: number
  blankSizeSqft: number
  totalSqft?: number
  paintCostPerSqft: number
  paintCostPerPiece: number
  gauge: string
  material: string
  qty: number
  storeItemId?: string
  originalQty?: number
  totalPrice?: number
  originalPaintCostPerPiece?: number // Store original value for backend
}

interface MechanicalPart {
  partNo: string
  partName: string
  category: string
  storeLocation: string
  blankWidthMM?: number
  blankLengthMM?: number
  blankWidthInch?: number
  blankLengthInch?: number
  blankWidth?: number
  blankLength?: number
  blankSizeSqft: number
  sheetCost: number
  todayPaintCost: number
  paintCostPerPiece: number
  gauge: string
  material: string
  qty: number
  storeItemId?: string
}

interface MechanicalOp {
  _id: string
  workOrderNo: string
  gatepassNo: string
  dateIssued: string
  remarks?: string
  parts: MechanicalPart[]
}

interface ManualWorkOrder {
  _id: string
  _createdAt: string
  workOrderNo: string
  gatepassNo: string
  mwo: string
  dateIssued: string
  remarks?: string
  parts: PartItem[]
  total?: number
}

interface FormData {
  workOrderNo: string
  gatepassNo: string
  mwo: string
  dateIssued: string
  remarks: string
  parts: PartItem[]
}

// Define ExtendedStoreItem interface
interface ExtendedStoreItem extends StoreItem {
  weight: number
}

// Helper function to convert inches to mm
const inchesToMM = (inches: number): number => {
  return Number((inches * 25.4).toFixed(1))
}

// Helper function to get dimension display
const getDimensionDisplay = (item: StoreItem | PartItem): string => {
  if (item.blankWidthMM && item.blankLengthMM && item.blankWidthMM > 0 && item.blankLengthMM > 0) {
    return `${item.blankWidthMM}mm x ${item.blankLengthMM}mm`
  }
  const width = (item as StoreItem).blankWidthInch || (item as PartItem).blankWidthInch || (item as StoreItem).blankWidth || (item as PartItem).blankWidth || 0
  const length = (item as StoreItem).blankLengthInch || (item as PartItem).blankLengthInch || (item as StoreItem).blankLength || (item as PartItem).blankLength || 0
  return `${inchesToMM(width)}mm x ${inchesToMM(length)}mm`
}

export default function ManualWorkOrderList() {
  const [manualWorkOrders, setManualWorkOrders] = useState<ManualWorkOrder[]>([])
  const [mechanicalOps, setMechanicalOps] = useState<MechanicalOp[]>([])
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ManualWorkOrder | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPartIndex, setCurrentPartIndex] = useState<number | null>(null)
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  const [selectedStoreItem, setSelectedStoreItem] = useState<StoreItem | null>(null)
  const [partSearchTerm, setPartSearchTerm] = useState('')
  const [partQuantity, setPartQuantity] = useState(1)
  const [isMechanicalModalOpen, setIsMechanicalModalOpen] = useState(false)
  const [mechanicalSearchTerm, setMechanicalSearchTerm] = useState('')
  const [printFormatModal, setPrintFormatModal] = useState(false)
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<ManualWorkOrder | null>(null)
  
  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedOrderForView, setSelectedOrderForView] = useState<ManualWorkOrder | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    workOrderNo: '',
    gatepassNo: '',
    mwo: '',
    dateIssued: '',
    remarks: '',
    parts: []
  })

  const generateGatepassNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `P-IN-${year}${month}${day}-${random}`
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeResponse = await fetch('/api/store/add-item')
        if (!storeResponse.ok) throw new Error('Failed to fetch store items')
        const storeResult = await storeResponse.json()
        
        const storeItemsWithMM: ExtendedStoreItem[] = (Array.isArray(storeResult) ? storeResult : []).map((item: StoreItem) => ({
          ...item,
          weight: (item as { weight?: number }).weight || 0,
          sqft: (item as { sqft?: number }).sqft || 0,
          blankWidthMM: (item as { blankWidthMM?: number }).blankWidthMM || 0,
          blankLengthMM: (item as { blankLengthMM?: number }).blankLengthMM || 0,
          blankWidthInch: (item as { blankWidthInch?: number }).blankWidthInch || (item.blankWidth || 0),
          blankLengthInch: (item as { blankLengthInch?: number }).blankLengthInch || (item.blankLength || 0),
          blankWidth: (item as { blankWidthInch?: number }).blankWidthInch || item.blankWidth || 0,
          blankLength: (item as { blankLengthInch?: number }).blankLengthInch || item.blankLength || 0,
        }))
        
        setStoreItems(storeItemsWithMM)

        const mechanicalResponse = await fetch('/api/mechanical-op')
        if (!mechanicalResponse.ok) throw new Error('Failed to fetch mechanical operations')
        const mechanicalResult = await mechanicalResponse.json()
        
        const mappedMechanicalOps: MechanicalOp[] = (Array.isArray(mechanicalResult) ? mechanicalResult : []).map((op: MechanicalOp) => ({
          ...op,
          parts: (op.parts || []).map((part: MechanicalPart) => {
            // CRITICAL: Preserve todayPaintCost from the API response
            const todayPaintCostValue = part.todayPaintCost || 0
            const originalPaintCostPerPieceValue = part.paintCostPerPiece || (part.blankSizeSqft * todayPaintCostValue) || 0
            // Multiply by 2 for display
            const paintCostPerPieceValue = originalPaintCostPerPieceValue * 2
            
            return {
              partNo: part.partNo,
              partName: part.partName,
              category: part.category,
              storeLocation: part.storeLocation,
              blankWidthMM: part.blankWidthMM || 0,
              blankLengthMM: part.blankLengthMM || 0,
              blankWidthInch: part.blankWidthInch || part.blankWidth || 0,
              blankLengthInch: part.blankLengthInch || part.blankLength || 0,
              blankWidth: part.blankWidthInch || part.blankWidth || 0,
              blankLength: part.blankLengthInch || part.blankLength || 0,
              blankSizeSqft: part.blankSizeSqft || 0,
              sheetCost: part.sheetCost || 0,
              todayPaintCost: todayPaintCostValue,
              paintCostPerPiece: paintCostPerPieceValue, // Display value (×2)
              gauge: part.gauge || '',
              material: part.material || '',
              qty: part.qty || 0,
              storeItemId: part.storeItemId
            }
          }) || []
        }))
        
        console.log('Mechanical Ops loaded with todayPaintCost (×2 applied for display):', mappedMechanicalOps.map(op => ({
          workOrderNo: op.workOrderNo,
          parts: op.parts.map(p => ({
            name: p.partName,
            todayPaintCost: p.todayPaintCost,
            paintCostPerPiece: p.paintCostPerPiece
          }))
        })))
        
        setMechanicalOps(mappedMechanicalOps)

        const workOrderResponse = await fetch('/api/paint-in-opr')
        if (!workOrderResponse.ok) throw new Error('Failed to fetch paint inward work orders')
        const workOrderResult = await workOrderResponse.json()
        
        const workOrdersData = workOrderResult.data || workOrderResult
        
        // Process existing work orders to multiply paintCostPerPiece by 2 for display
        const processedWorkOrders: ManualWorkOrder[] = (Array.isArray(workOrdersData) ? workOrdersData : []).map((order: ManualWorkOrder) => ({
          ...order,
          parts: order.parts.map((part: PartItem) => ({
            ...part,
            paintCostPerPiece: (part.paintCostPerPiece || 0) * 2, // Multiply by 2 for display
            totalPrice: ((part.paintCostPerPiece || 0) * 2) * (part.qty || 0) // Recalculate total with ×2
          })),
          total: order.total ? order.total * 2 : undefined // Also multiply total if exists
        }))
        
        setManualWorkOrders(processedWorkOrders)
      } catch (err) {
        console.error('Failed to fetch data', err)
        setError('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Open View Modal
  const openViewModal = (order: ManualWorkOrder) => {
    setSelectedOrderForView(order)
    setViewModalOpen(true)
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateTotalCost = (parts: PartItem[]) => {
    return parts.reduce((total, part) => total + ((part.paintCostPerPiece || 0) * (part.qty || 0)), 0)
  }

  const calculateTotalQty = (parts: PartItem[]) => {
    return parts.reduce((total, part) => total + (part.qty || 0), 0)
  }

  const calculateTotalSqft = (parts: PartItem[]) => {
    return parts.reduce((total, part) => total + ((part.blankSizeSqft || 0) * (part.qty || 0)), 0)
  }

  const calculatePartTotal = (part: PartItem) => {
    return (part.paintCostPerPiece || 0) * (part.qty || 0)
  }

  const filteredItems = Array.isArray(manualWorkOrders) ? manualWorkOrders.filter(item => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      (item.workOrderNo?.toLowerCase() || '').includes(searchLower) ||
      (item.gatepassNo?.toLowerCase() || '').includes(searchLower) ||
      (item.mwo?.toLowerCase() || '').includes(searchLower) ||
      (item.remarks?.toLowerCase() || '').includes(searchLower) ||
      item.parts?.some(part => 
        part.partNo?.toLowerCase().includes(searchLower) ||
        part.partName?.toLowerCase().includes(searchLower)
      )
    )
  }) : []

  const filteredMechanicalOps = Array.isArray(mechanicalOps) ? mechanicalOps.filter(item => {
    if (!mechanicalSearchTerm) return true
    const searchLower = mechanicalSearchTerm.toLowerCase()
    return (
      (item.workOrderNo?.toLowerCase() || '').includes(searchLower) ||
      (item.gatepassNo?.toLowerCase() || '').includes(searchLower) ||
      item.parts?.some(part => 
        part.partNo?.toLowerCase().includes(searchLower) ||
        part.partName?.toLowerCase().includes(searchLower)
      )
    )
  }) : []

  const filteredStoreItems = Array.isArray(storeItems) ? storeItems.filter(item => {
    if (!partSearchTerm) return true
    const searchLower = partSearchTerm.toLowerCase()
    return (
      (item.partNumber?.toLowerCase() || '').includes(searchLower) ||
      (item.partName?.toLowerCase() || '').includes(searchLower) ||
      (item.category?.toLowerCase() || '').includes(searchLower) ||
      (item.material?.toLowerCase() || '').includes(searchLower)
    )
  }) : []

  // Open print format selection modal
  const openPrintFormatModal = (order: ManualWorkOrder) => {
    setSelectedOrderForPrint(order)
    setPrintFormatModal(true)
  }

  // Qadri Paint Format - with dimensions in mm, Qty between Dimensions and SQFT (×2 applied)
  const handlePrintQadriPaintFormat = (order: ManualWorkOrder) => {
    setPrintFormatModal(false)
    setTimeout(() => {
      const totalQty = calculateTotalQty(order.parts)
      const totalCost = order.total || calculateTotalCost(order.parts)
      const totalSqft = calculateTotalSqft(order.parts)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Qadri Paint - ${order.workOrderNo}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
                * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
                body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
                .print-container { max-width: 1200px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
                .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding: 5px 15px 10px 15px; border-bottom: 2px solid #000; background: #fff; }
                .logo-placeholder { width: 250px; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #000; font-weight: 600; text-transform: uppercase; }
                .logo-img { width: 250px; height: 100px; object-fit: contain; }
                .title-section { flex: 2; text-align: right; margin-top: -3px; }
                .main-title { font-size: 24px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.1em; }
                .challan-type { font-size: 16px; font-weight: bold; margin-top: 3px; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; }
                .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 3px 8px; vertical-align: top; }
                .info-label { font-weight: bold; white-space: nowrap; }
                .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; margin-top: 10px; margin-bottom: 0; }
                .data-table th { background: #f0f0f0; padding: 6px 4px; text-align: center; font-weight: bold; border: 1px solid #000; }
                .data-table td { padding: 4px 4px; border: 1px solid #000; }
                .numeric-cell { text-align: right; }
                .center-cell { text-align: center; }
                .total-row { background: #e8f5e8 !important; font-weight: bold; }
                .remarks-section { padding: 8px 15px; margin: 5px 15px; }
                .remarks-label { font-weight: bold; font-size: 11px; }
                .remarks-text { font-size: 11px; margin-top: 3px; line-height: 1.3; }
                .content-wrapper { flex: 1; }
                .signature-section { padding: 10px 15px 5px 15px; margin-top: auto; border-top: 1px solid #000; }
                .signature-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-top: 5px; }
                .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
                .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
                .datetime-footer { text-align: left; padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; font-weight: bold; }
                .multiplier-note { background: #fff3cd; border: 1px solid #ffc107; padding: 5px 10px; margin: 10px 15px; font-size: 10px; text-align: center; border-radius: 4px; }
                @media print { body { padding: 3px; } .print-container { border: none; } }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header-section">
                  <div class="logo-section"><div class="logo-placeholder"><img src="${window.location.origin}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='COMPANY LOGO';"></div></div>
                  <div class="title-section"><div class="main-title">PAINT INWARD</div><div class="challan-type">QADRI PAINT - WORK ORDER</div></div>
                </div>
                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table"><tbody>
                      <tr><td class="info-label">M/S Qadri Spray Tech</td><td></td><td class="info-label">Work Order No:</td><td>${order.workOrderNo}</td></tr>
                      <tr><td class="info-label">Production Order No#:</td><td>${order.mwo || 'N/A'}</td><td class="info-label">Gate Pass No:</td><td>${order.gatepassNo}</td></tr>
                      <tr><td class="info-label">Date Issued:</td><td>${formatDateTime(order.dateIssued)}</td><td></td><td></td></tr>
                    </tbody></table>
                  </div>
                  <div style="overflow-x: auto;">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Part No</th>
                          <th>Part Name</th>
                          <th>Material/Gauge</th>
                          <th>Dimensions (mm)</th>
                          <th>Qty</th>
                          <th>SQFT</th>
                          <th>Total SQFT</th>
                          <th>Paint Cost/SQFT</th>
                          <th>Paint Cost/Piece</th>
                          <th>Total Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${order.parts.map((part, idx) => {
                          const totalSqftVal = (part.blankSizeSqft || 0) * part.qty
                          const dimensionDisplay = getDimensionDisplay(part)
                          return `
                            <tr>
                              <td class="center-cell">${idx + 1}</td>
                              <td class="center-cell">${part.partNo}</td>
                              <td>${part.partName}</td>
                              <td class="center-cell">${part.material}/${part.gauge}</td>
                              <td class="center-cell">${dimensionDisplay}</td>
                              <td class="center-cell">${part.qty}</td>
                              <td class="numeric-cell">${part.blankSizeSqft || 0}</td>
                              <td class="numeric-cell">${totalSqftVal.toFixed(2)}</td>
                              <td class="numeric-cell">Rs ${(part.paintCostPerSqft || 0).toLocaleString()}</td>
                              <td class="numeric-cell">Rs ${(part.paintCostPerPiece || 0).toLocaleString()}</td>
                              <td class="numeric-cell">Rs ${((part.paintCostPerPiece || 0) * part.qty).toLocaleString()}</td>
                            </tr>
                          `
                        }).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="5" class="numeric-cell">GRAND TOTAL:</td>
                          <td class="center-cell">${totalQty}</td>
                          <td class="numeric-cell">-</td>
                          <td class="numeric-cell">${totalSqft.toFixed(2)}</td>
                          <td class="numeric-cell">-</td>
                          <td class="numeric-cell">-</td>
                          <td class="numeric-cell">Rs ${totalCost.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                ${order.remarks ? `
                <div class="remarks-section">
                  <div class="remarks-label">REMARKS:</div>
                  <div class="remarks-text">${order.remarks}</div>
                </div>
                ` : ''}
                <div class="signature-section">
                  <div class="signature-grid">
                    <div><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Store Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Accounts Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Received By</div></div>
                  </div>
                </div>
                <div class="datetime-footer">Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => printWindow.close()
      }
    }, 100)
  }

  // Floor Format Print - with dimensions in mm, Qty between Dimensions and SQFT (×2 applied in display but hidden)
  const handlePrintFloorFormat = (order: ManualWorkOrder) => {
    setPrintFormatModal(false)
    setTimeout(() => {
      const totalQty = calculateTotalQty(order.parts)
      const totalSqft = calculateTotalSqft(order.parts)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Floor Format - ${order.workOrderNo}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
                * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
                body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
                .print-container { max-width: 1200px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
                .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding: 5px 15px 10px 15px; border-bottom: 2px solid #000; background: #fff; }
                .logo-placeholder { width: 250px; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #000; font-weight: 600; text-transform: uppercase; }
                .logo-img { width: 250px; height: 100px; object-fit: contain; }
                .title-section { flex: 2; text-align: right; margin-top: -3px; }
                .main-title { font-size: 24px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.1em; }
                .challan-type { font-size: 16px; font-weight: bold; margin-top: 3px; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; background: #e8f5e8; }
                .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 3px 8px; vertical-align: top; }
                .info-label { font-weight: bold; white-space: nowrap; }
                .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; margin-top: 10px; margin-bottom: 0; }
                .data-table th { background: #f0f0f0; padding: 6px 4px; text-align: center; font-weight: bold; border: 1px solid #000; }
                .data-table td { padding: 4px 4px; border: 1px solid #000; }
                .center-cell { text-align: center; }
                .numeric-cell { text-align: right; }
                .total-row { background: #e8f5e8 !important; font-weight: bold; }
                .remarks-section { padding: 8px 15px; margin: 5px 15px; }
                .remarks-label { font-weight: bold; font-size: 11px; }
                .remarks-text { font-size: 11px; margin-top: 3px; line-height: 1.3; }
                .content-wrapper { flex: 1; }
                .signature-section { padding: 10px 15px 5px 15px; margin-top: auto; border-top: 1px solid #000; }
                .signature-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-top: 5px; }
                .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
                .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
                .datetime-footer { text-align: left; padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; font-weight: bold; }
                @media print { body { padding: 3px; } .print-container { border: none; } }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header-section">
                  <div class="logo-section"><div class="logo-placeholder"><img src="${window.location.origin}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='COMPANY LOGO';"></div></div>
                  <div class="title-section"><div class="main-title">PAINT INWARD</div><div class="challan-type">FLOOR TASK</div></div>
                </div>
                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table"><tbody>
                      <tr><td class="info-label">M/S Qadri Spray Tech</td><td></td><td class="info-label">Work Order No:</td><td>${order.workOrderNo}</td></tr>
                      <tr><td class="info-label">Production Order No#:</td><td>${order.mwo || 'N/A'}</td><td class="info-label">Gate Pass No:</td><td>${order.gatepassNo}</td></tr>
                      <tr><td class="info-label">Date Issued:</td><td>${formatDateTime(order.dateIssued)}</td><td></td><td></td></tr>
                    </tbody></table>
                  </div>
                  <div style="overflow-x: auto;">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Part No</th>
                          <th>Part Name</th>
                          <th>Material/Gauge</th>
                          <th>Dimensions (mm)</th>
                          <th>Qty</th>
                          <th>SQFT</th>
                          <th>Total SQFT</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${order.parts.map((part, idx) => {
                          const totalSqftVal = (part.blankSizeSqft || 0) * part.qty
                          const dimensionDisplay = getDimensionDisplay(part)
                          return `
                            <tr>
                              <td class="center-cell">${idx + 1}</td>
                              <td class="center-cell">${part.partNo}</td>
                              <td>${part.partName}</td>
                              <td class="center-cell">${part.material}/${part.gauge}</td>
                              <td class="center-cell">${dimensionDisplay}</td>
                              <td class="center-cell">${part.qty}</td>
                              <td class="numeric-cell">${part.blankSizeSqft || 0}</td>
                              <td class="numeric-cell">${totalSqftVal.toFixed(2)}</td>
                            </tr>
                          `
                        }).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="5" class="numeric-cell">GRAND TOTAL:</td>
                          <td class="center-cell">${totalQty}</td>
                          <td class="numeric-cell">-</td>
                          <td class="numeric-cell">${totalSqft.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                ${order.remarks ? `
                <div class="remarks-section">
                  <div class="remarks-label">REMARKS:</div>
                  <div class="remarks-text">${order.remarks}</div>
                </div>
                ` : ''}
                <div class="signature-section">
                  <div class="signature-grid">
                    <div><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Store Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Accounts Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Received By</div></div>
                  </div>
                </div>
                <div class="datetime-footer">Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => printWindow.close()
      }
    }, 100)
  }

  const handleDelete = async (id: string) => {
    const item = manualWorkOrders.find(item => item._id === id)
    const workOrderNo = item?.workOrderNo || 'this item'

    toast.custom((t) => (
      <div className={`bg-white p-6 rounded-lg shadow-xl border border-gray-200 max-w-md ${dmSans.className}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete Work Order <span className="font-semibold">{workOrderNo}</span>? 
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id)
            try {
              setDeletingId(id)
              const res = await fetch(`/api/paint-in-opr?id=${id}`, { method: 'DELETE' })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || data.details || 'Failed to delete')
              setManualWorkOrders(prev => prev.filter(item => item._id !== id))
              toast.success(`Work Order ${workOrderNo} deleted successfully!`, { duration: 4000 })
            } catch (err) {
              console.error('Delete error:', err)
              toast.error(err instanceof Error ? err.message : `Failed to delete ${workOrderNo}`, { duration: 4000 })
            } finally {
              setDeletingId(null)
            }
          }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition">Delete</button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      workOrderNo: '',
      gatepassNo: generateGatepassNumber(),
      mwo: '',
      dateIssued: new Date().toISOString().slice(0, 16),
      remarks: '',
      parts: []
    })
  }

  const resetPartSelection = () => {
    setSelectedStoreItem(null)
    setPartQuantity(1)
    setPartSearchTerm('')
    setCurrentPartIndex(null)
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (item: ManualWorkOrder) => {
    setEditingItem(item)
    setFormData({
      workOrderNo: item.workOrderNo,
      gatepassNo: item.gatepassNo,
      mwo: item.mwo || '',
      dateIssued: item.dateIssued,
      remarks: item.remarks || '',
      parts: item.parts.map(part => ({ 
        ...part,
        paintCostPerSqft: part.paintCostPerSqft || 0,
        paintCostPerPiece: part.paintCostPerPiece || 0, // Already multiplied by 2 from fetch
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        totalSqft: (part.blankSizeSqft || 0) * (part.qty || 0)
      }))
    })
    setIsEditModalOpen(true)
  }

  // FIXED: Select Mechanical Op - properly preserve paint cost values with ×2 multiplier for display
  const selectMechanicalOp = (item: MechanicalOp) => {
    const paintInwardGatepassNo = generateGatepassNumber()

    console.log('=== Loading Mechanical OP to Paint Inward ===')
    console.log('Work Order:', item.workOrderNo)
    console.log('Gate Pass Number (will be used as MWO/Doc Ref):', item.gatepassNo)
    console.log('Parts with paint cost (×2 applied):', item.parts.map(p => ({
      name: p.partName,
      todayPaintCost: p.todayPaintCost,
      paintCostPerPiece: p.paintCostPerPiece,
      blankSizeSqft: p.blankSizeSqft,
      qty: p.qty
    })))

    setFormData(prev => ({
      ...prev,
      workOrderNo: item.workOrderNo,
      gatepassNo: paintInwardGatepassNo,
      mwo: item.gatepassNo,  // Document Ref No# = Gate Pass Number from Mechanical OP
      dateIssued: item.dateIssued,
      remarks: item.remarks || `Loaded from Mechanical OP: ${item.workOrderNo}`,
      parts: item.parts.map(part => {
        // CRITICAL: Preserve the paint cost values from mechanical op (already multiplied by 2)
        const paintCostPerSqftValue = part.todayPaintCost || 0
        const paintCostPerPieceValue = part.paintCostPerPiece || (part.blankSizeSqft * paintCostPerSqftValue * 2) || 0
        const blankSizeSqftValue = part.blankSizeSqft || 0
        const totalSqftValue = blankSizeSqftValue * part.qty
        const totalPriceValue = paintCostPerPieceValue * part.qty
        
        console.log(`Part ${part.partName}:`, {
          blankSizeSqft: blankSizeSqftValue,
          paintCostPerSqft: paintCostPerSqftValue,
          paintCostPerPiece: paintCostPerPieceValue,
          qty: part.qty,
          totalPrice: totalPriceValue,
          note: 'Paint Cost/Piece already includes ×2 multiplier'
        })
        
        return {
          partNo: part.partNo,
          partName: part.partName,
          category: part.category,
          storeLocation: part.storeLocation,
          blankWidthMM: part.blankWidthMM || 0,
          blankLengthMM: part.blankLengthMM || 0,
          blankWidthInch: part.blankWidthInch || 0,
          blankLengthInch: part.blankLengthInch || 0,
          blankWidth: part.blankWidthInch || 0,
          blankLength: part.blankLengthInch || 0,
          blankSizeSqft: blankSizeSqftValue,
          totalSqft: totalSqftValue,
          paintCostPerSqft: paintCostPerSqftValue,
          paintCostPerPiece: paintCostPerPieceValue, // This already has ×2
          gauge: part.gauge,
          material: part.material,
          qty: part.qty,
          originalQty: part.qty,
          storeItemId: part.storeItemId,
          totalPrice: totalPriceValue
        }
      })
    }))
    setIsMechanicalModalOpen(false)
    toast.success(`Work order ${item.workOrderNo} loaded successfully! Document Ref (MWO): ${item.gatepassNo} | Paint Cost/SQFT: ${item.parts[0]?.todayPaintCost || 'N/A'} | Paint Cost/Piece displayed with ×2`, { duration: 5000 })
  }

  const selectStoreItem = (item: StoreItem) => {
    setSelectedStoreItem(item)
    setPartQuantity(1)
  }

  const addPartToWorkOrder = () => {
    if (!selectedStoreItem) {
      toast.error('Please select a part first')
      return
    }

    if (partQuantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    if (partQuantity > selectedStoreItem.stockInStore) {
      toast.error(`Insufficient stock! Only ${selectedStoreItem.stockInStore} ${selectedStoreItem.unitOfMeasure} available.`)
      return
    }

    const paintCostPerSqftValue = selectedStoreItem.todayPaintCost || 0
    // Calculate original value then multiply by 2 for display
    const originalPaintCostPerPieceValue = (selectedStoreItem.sqft || 0) * paintCostPerSqftValue
    const paintCostPerPieceValue = originalPaintCostPerPieceValue * 2

    const newPart: PartItem = {
      partNo: selectedStoreItem.partNumber,
      partName: selectedStoreItem.partName,
      category: selectedStoreItem.category,
      storeLocation: selectedStoreItem.storeLocation,
      blankWidthMM: selectedStoreItem.blankWidthMM || 0,
      blankLengthMM: selectedStoreItem.blankLengthMM || 0,
      blankWidthInch: selectedStoreItem.blankWidthInch || 0,
      blankLengthInch: selectedStoreItem.blankLengthInch || 0,
      blankWidth: selectedStoreItem.blankWidthInch || 0,
      blankLength: selectedStoreItem.blankLengthInch || 0,
      blankSizeSqft: selectedStoreItem.sqft || 0,
      totalSqft: (selectedStoreItem.sqft || 0) * partQuantity,
      paintCostPerSqft: paintCostPerSqftValue,
      paintCostPerPiece: paintCostPerPieceValue, // ×2 for display
      gauge: selectedStoreItem.gauge || '',
      material: selectedStoreItem.material || '',
      qty: partQuantity,
      storeItemId: selectedStoreItem._id,
      totalPrice: paintCostPerPieceValue * partQuantity
    }

    const updatedParts = [...formData.parts]

    if (currentPartIndex !== null) {
      updatedParts[currentPartIndex] = newPart
    } else {
      updatedParts.push(newPart)
    }

    setFormData(prev => ({ ...prev, parts: updatedParts }))
    setIsPartModalOpen(false)
    resetPartSelection()
    toast.success(`${selectedStoreItem.partName} added to work order | Paint Cost/Piece: Rs ${paintCostPerPieceValue.toLocaleString()} (×2 applied)`)
  }

  const openPartSelection = (index?: number) => {
    if (index !== undefined) {
      const part = formData.parts[index]
      const storeItem = storeItems.find(item => item._id === part.storeItemId)
      if (storeItem) {
        setSelectedStoreItem(storeItem)
        setPartQuantity(part.qty)
        setCurrentPartIndex(index)
      }
    } else {
      resetPartSelection()
    }
    setIsPartModalOpen(true)
  }

  const removePart = (index: number) => {
    const updatedParts = formData.parts.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, parts: updatedParts }))
    toast.success('Part removed')
  }

  const updatePartQuantity = (index: number, newQuantity: number) => {
    const part = formData.parts[index]

    if (part.originalQty !== undefined) {
      if (newQuantity > part.originalQty) {
        toast.error(`Cannot increase quantity above original (${part.originalQty}). You can only decrease.`)
        return
      }
    }

    if (newQuantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    const updatedParts = [...formData.parts]
    updatedParts[index] = { 
      ...updatedParts[index], 
      qty: newQuantity,
      totalSqft: (updatedParts[index].blankSizeSqft || 0) * newQuantity,
      totalPrice: (updatedParts[index].paintCostPerPiece || 0) * newQuantity
    }
    setFormData(prev => ({ ...prev, parts: updatedParts }))
    toast.success(`Quantity updated to ${newQuantity}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.workOrderNo || !formData.gatepassNo || !formData.mwo || !formData.dateIssued) {
      toast.error('Please fill in all required fields (Work Order, Gate Pass, MWO, Date)')
      return
    }

    if (formData.parts.length === 0) {
      toast.error('Please add at least one part')
      return
    }

    setIsSubmitting(true)

    try {
      const formattedParts = formData.parts.map(part => ({
        partNo: part.partNo,
        partName: part.partName,
        category: part.category,
        storeLocation: part.storeLocation,
        blankWidth: part.blankWidthInch || part.blankWidth || 0,
        blankLength: part.blankLengthInch || part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft,
        paintCostPerSqft: part.paintCostPerSqft,
        paintCostPerPiece: part.paintCostPerPiece / 2, // Divide by 2 to store original value in backend
        gauge: part.gauge,
        material: part.material,
        qty: part.qty,
        storeItemId: part.storeItemId
      }))

      console.log('Submitting Paint Inward with parts:', formattedParts.map(p => ({
        name: p.partName,
        paintCostPerSqft: p.paintCostPerSqft,
        paintCostPerPiece: p.paintCostPerPiece, // This is original value (without ×2)
        blankSizeSqft: p.blankSizeSqft,
        qty: p.qty,
        note: 'paintCostPerPiece is original value (divided by 2) for backend storage'
      })))

      const newWorkOrder = {
        workOrderNo: formData.workOrderNo,
        gatepassNo: formData.gatepassNo,
        mwo: formData.mwo,
        dateIssued: formData.dateIssued,
        remarks: formData.remarks || undefined,
        parts: formattedParts
      }

      const response = await fetch('/api/paint-in-opr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkOrder),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to add work order')
      }

      const refreshResponse = await fetch('/api/paint-in-opr')
      const refreshData = await refreshResponse.json()
      
      // Process fetched data to multiply by 2 for display
      const processedData: ManualWorkOrder[] = (refreshData.data || refreshData).map((order: ManualWorkOrder) => ({
        ...order,
        parts: order.parts.map((part: PartItem) => ({
          ...part,
          paintCostPerPiece: (part.paintCostPerPiece || 0) * 2,
          totalPrice: ((part.paintCostPerPiece || 0) * 2) * (part.qty || 0)
        })),
        total: order.total ? order.total * 2 : undefined
      }))
      
      setManualWorkOrders(processedData)
      
      toast.success(result.message || 'Work order created successfully! Paint Cost/Piece ×2 applied for display', { duration: 3000 })
      setIsAddModalOpen(false)
      resetForm()
      
    } catch (error: unknown) {
      console.error('Error adding work order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add work order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.workOrderNo || !formData.gatepassNo || !formData.mwo || !formData.dateIssued) {
      toast.error('Please fill in all required fields (Work Order, Gate Pass, MWO, Date)')
      return
    }

    if (formData.parts.length === 0) {
      toast.error('Please add at least one part')
      return
    }

    setIsSubmitting(true)

    try {
      const formattedParts = formData.parts.map(part => ({
        partNo: part.partNo,
        partName: part.partName,
        category: part.category,
        storeLocation: part.storeLocation,
        blankWidth: part.blankWidthInch || part.blankWidth || 0,
        blankLength: part.blankLengthInch || part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft,
        paintCostPerSqft: part.paintCostPerSqft,
        paintCostPerPiece: part.paintCostPerPiece / 2, // Divide by 2 for backend storage
        gauge: part.gauge,
        material: part.material,
        qty: part.qty,
        storeItemId: part.storeItemId
      }))

      const updateData = {
        id: editingItem?._id,
        workOrderNo: formData.workOrderNo,
        gatepassNo: formData.gatepassNo,
        mwo: formData.mwo,
        dateIssued: formData.dateIssued,
        remarks: formData.remarks,
        parts: formattedParts
      }

      const response = await fetch('/api/paint-in-opr', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update work order')
      }

      const refreshResponse = await fetch('/api/paint-in-opr')
      const refreshData = await refreshResponse.json()
      
      // Process fetched data to multiply by 2 for display
      const processedData: ManualWorkOrder[] = (refreshData.data || refreshData).map((order: ManualWorkOrder) => ({
        ...order,
        parts: order.parts.map((part: PartItem) => ({
          ...part,
          paintCostPerPiece: (part.paintCostPerPiece || 0) * 2,
          totalPrice: ((part.paintCostPerPiece || 0) * 2) * (part.qty || 0)
        })),
        total: order.total ? order.total * 2 : undefined
      }))
      
      setManualWorkOrders(processedData)
      
      toast.success('Work order updated successfully! Paint Cost/Piece ×2 applied for display', { duration: 3000 })
      setIsEditModalOpen(false)
      resetForm()
      setEditingItem(null)
      
    } catch (error: unknown) {
      console.error('Error updating work order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update work order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.className} font-sans`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <main className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedUser='mechanical'>
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <Toaster position="top-center" />
        <Sidebar />
        
        <main className={`max-w-7xl mx-auto px-4 py-10 space-y-8 transition-all duration-300 ${
          isAddModalOpen || isEditModalOpen || isPartModalOpen || isMechanicalModalOpen || printFormatModal || viewModalOpen ? 'blur-sm pointer-events-none' : ''
        }`}>
          
          <div className="flex flex-col gap-6 border-b pb-6">
            <div className="space-y-2">
              <h1 className={`text-2xl sm:text-3xl pt-8 font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
                Paint Inward Management
              </h1>
              <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>
                Manage gatepasses
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-96">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <HiSearch className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search by work order, gate pass, MWO, part number, part name..."
                  className={`w-full pl-10 pr-24 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none transition ${dmSans.className}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-16 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                )}
                <button className="absolute right-1.5 top-1.5 px-3 py-1.5 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] transition">
                  Search
                </button>
              </div>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition text-sm font-medium"
              >
                + Create Work Order
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Total Work Orders</p>
              <p className="text-2xl font-bold text-gray-800">{manualWorkOrders.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Total Parts Issued</p>
              <p className="text-2xl font-bold text-gray-800">
                {manualWorkOrders.reduce((sum, op) => sum + calculateTotalQty(op.parts), 0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Total Cost (PKR)</p>
              <p className="text-2xl font-bold text-[#8B5E3C]">
                Rs {manualWorkOrders.reduce((sum, op) => sum + (op.total || calculateTotalCost(op.parts)), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Total SQFT Issued</p>
              <p className="text-2xl font-bold text-gray-800">
                {manualWorkOrders.reduce((sum, op) => sum + calculateTotalSqft(op.parts), 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isMobile ? (
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No work orders found</div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item._id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-[#8B5E3C]">WO: {item.workOrderNo}</h3>
                            <p className="text-xs text-gray-500">GP: {item.gatepassNo}</p>
                            <p className="text-xs text-gray-500">MWO: {item.mwo || 'N/A'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => openViewModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">
                              <HiEye className="inline w-4 h-4 mr-1" /> View
                            </button>
                            <button onClick={() => openPrintFormatModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">🖨️ Print</button>
                            <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                            <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}
                              className={`text-red-600 hover:text-red-800 text-sm ${deletingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              {deletingId === item._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Date Issued:</span> {formatDateTime(item.dateIssued)}</p>
                          <p><span className="font-medium">Parts:</span> {item.parts.length} items</p>
                          <p><span className="font-medium">Total Qty:</span> {calculateTotalQty(item.parts)}</p>
                          <p><span className="font-medium">Total SQFT:</span> {calculateTotalSqft(item.parts).toFixed(2)}</p>
                          <p><span className="font-medium">Total Cost (×2):</span> Rs {(item.total || calculateTotalCost(item.parts)).toLocaleString()}</p>
                          {item.remarks && <p><span className="font-medium">Remarks:</span> {item.remarks}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className={`w-full table-auto divide-y divide-gray-200 ${dmSans.className}`}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Work Order #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gate Pass #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">MWO (Doc Ref)</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date Issued</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Parts</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Qty</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total SQFT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">No work orders found</td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.workOrderNo}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{item.gatepassNo}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{item.mwo || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(item.dateIssued)}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <div className="space-y-1">
                              {item.parts.slice(0, 2).map((part, idx) => (
                                <div key={idx} className="text-xs">{part.partName} (x{part.qty})</div>
                              ))}
                              {item.parts.length > 2 && <div className="text-xs text-gray-500">+{item.parts.length - 2} more</div>}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{calculateTotalQty(item.parts)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{calculateTotalSqft(item.parts).toFixed(2)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">Rs {(item.total || calculateTotalCost(item.parts)).toLocaleString()}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 space-x-3">
                            <button onClick={() => openViewModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">
                              <HiEye className="inline w-4 h-4 mr-1" /> View
                            </button>
                            <button onClick={() => openPrintFormatModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">
                              <HiPrinter className="inline w-4 h-4 mr-1" /> Print
                            </button>
                            <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                            <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}
                              className={`text-red-600 hover:text-red-800 font-medium ${deletingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              {deletingId === item._id ? 'Deleting...' : 'Delete'}
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

        {/* View Modal */}
        {viewModalOpen && selectedOrderForView && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setViewModalOpen(false)}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Paint Inward Details</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedOrderForView.workOrderNo}</p>
                  </div>
                  <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-bold text-lg">PAINT INWARD</h3>
                      <p className="text-sm text-gray-600">QADRI PAINT - WORK ORDER</p>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-semibold">Work Order No:</span> {selectedOrderForView.workOrderNo}</div>
                        <div><span className="font-semibold">MWO (Doc Ref):</span> <span className="font-mono">{selectedOrderForView.mwo || 'N/A'}</span></div>
                        <div><span className="font-semibold">Gate Pass No:</span> <span className="font-mono">{selectedOrderForView.gatepassNo}</span></div>
                        <div><span className="font-semibold">Date Issued:</span> {formatDateTime(selectedOrderForView.dateIssued)}</div>
                        <div><span className="font-semibold">Total Cost:</span> <span className="text-green-600 font-bold">Rs {selectedOrderForView.total?.toLocaleString() || calculateTotalCost(selectedOrderForView.parts).toLocaleString()}</span></div>
                      </div>
                      
                      {selectedOrderForView.remarks && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="font-semibold text-sm">REMARKS:</p>
                          <p className="text-sm mt-1">{selectedOrderForView.remarks}</p>
                        </div>
                      )}
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 border text-left">S.No</th>
                              <th className="px-3 py-2 border text-left">Part Name</th>
                              <th className="px-3 py-2 border text-left">Part No</th>
                              <th className="px-3 py-2 border text-left">Material/Gauge</th>
                              <th className="px-3 py-2 border text-left">Dimensions (mm)</th>
                              <th className="px-3 py-2 border text-right">SQFT</th>
                              <th className="px-3 py-2 border text-right">Total SQFT</th>
                              <th className="px-3 py-2 border text-right">Paint Cost/SQFT</th>
                              <th className="px-3 py-2 border text-right">Paint Cost/Piece</th>
                              <th className="px-3 py-2 border text-right">Qty</th>
                              <th className="px-3 py-2 border text-right">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrderForView.parts.map((part, idx) => {
                              const totalSqftVal = (part.blankSizeSqft || 0) * part.qty
                              const dimensionDisplay = getDimensionDisplay(part)
                              const partTotal = (part.paintCostPerPiece || 0) * part.qty
                              return (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 border text-center">{idx + 1}</td>
                                  <td className="px-3 py-2 border">{part.partName}</td>
                                  <td className="px-3 py-2 border">{part.partNo}</td>
                                  <td className="px-3 py-2 border">{part.material}/{part.gauge}</td>
                                  <td className="px-3 py-2 border text-center">{dimensionDisplay}</td>
                                  <td className="px-3 py-2 border text-right">{part.blankSizeSqft || 0}</td>
                                  <td className="px-3 py-2 border text-right">{totalSqftVal.toFixed(2)}</td>
                                  <td className="px-3 py-2 border text-right">Rs {(part.paintCostPerSqft || 0).toLocaleString()}</td>
                                  <td className="px-3 py-2 border text-right text-purple-600">Rs {(part.paintCostPerPiece || 0).toLocaleString()}</td>
                                  <td className="px-3 py-2 border text-right font-bold">{part.qty}</td>
                                  <td className="px-3 py-2 border text-right font-bold text-green-600">Rs {partTotal.toLocaleString()}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot className="bg-green-50 font-semibold">
                            <tr>
                              <td colSpan={6} className="px-3 py-2 border text-right">GRAND TOTAL:</td>
                              <td className="px-3 py-2 border text-right">{selectedOrderForView.parts.reduce((sum, p) => sum + ((p.blankSizeSqft || 0) * p.qty), 0).toFixed(2)}</td>
                              <td colSpan={2} className="px-3 py-2 border text-right">-</td>
                              <td className="px-3 py-2 border text-right">{selectedOrderForView.parts.reduce((sum, p) => sum + p.qty, 0)}</td>
                              <td className="px-3 py-2 border text-right text-green-600 font-bold">
                                Rs {selectedOrderForView.parts.reduce((sum, p) => sum + ((p.paintCostPerPiece || 0) * p.qty), 0).toLocaleString()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      openPrintFormatModal(selectedOrderForView);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <HiPrinter className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Format Selection Modal */}
        {printFormatModal && selectedOrderForPrint && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setPrintFormatModal(false)}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Select Print Format</h2>
                  <button onClick={() => setPrintFormatModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <button onClick={() => handlePrintQadriPaintFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition">
                    <div className="font-semibold text-gray-800">🎨 Qadri Paint Format</div>
                    <div className="text-sm text-gray-500 mt-1">Complete commercial view</div>
                  </button>
                  <button onClick={() => handlePrintFloorFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition">
                    <div className="font-semibold text-gray-800">🏭 Floor Format</div>
                    <div className="text-sm text-gray-500 mt-1">Production task view - Costs hidden</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Work Order Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
              setIsAddModalOpen(false)
              setIsEditModalOpen(false)
              resetForm()
              setEditingItem(null)
            }}></div>
            
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
                    {isEditModalOpen ? 'Edit Work Order' : 'Create New Work Order'}
                  </h2>
                  <div className="flex gap-2">
                    {!isEditModalOpen && (
                      <button type="button" onClick={() => setIsMechanicalModalOpen(true)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        Load from Mechanical OP
                      </button>
                    )}
                    <button onClick={() => {
                      setIsAddModalOpen(false)
                      setIsEditModalOpen(false)
                      resetForm()
                      setEditingItem(null)
                    }} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={isEditModalOpen ? handleEditSubmit : handleSubmit} className="p-6 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Work Order Number <span className="text-red-500">*</span>
                        </label>
                        <input type="text" name="workOrderNo" value={formData.workOrderNo} onChange={handleChange} required
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none"
                          placeholder="Enter work order number (e.g., WO-001)" />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Gate Pass Number <span className="text-red-500">*</span>
                        </label>
                        <input type="text" name="gatepassNo" value={formData.gatepassNo} onChange={handleChange} required readOnly
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none bg-gray-100 cursor-not-allowed"
                          placeholder="Gate pass number" />
                        <p className="text-xs text-gray-500 mt-1">Gate pass number is auto-generated in P-IN-YYYYMMDD-RRRR format</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Document Ref No# (MWO) <span className="text-red-500">*</span>
                        </label>
                        <input type="text" name="mwo" value={formData.mwo} onChange={handleChange} required
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${isEditModalOpen ? 'bg-gray-100' : ''}`}
                          placeholder="Enter MWO reference (auto-filled from Mechanical OP)" 
                          readOnly={isEditModalOpen} />
                        <p className="text-xs text-gray-500 mt-1">Reference to the original Mechanical Work Order number</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Date Issued <span className="text-red-500">*</span>
                        </label>
                        <input type="datetime-local" name="dateIssued" value={formData.dateIssued} onChange={handleChange} required
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Remarks</label>
                        <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none"
                          placeholder="Additional notes..." />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-lg font-semibold text-gray-800 ${dmSans.className}`}>Parts List</h3>
                      <button type="button" onClick={() => openPartSelection()}
                        className="px-3 py-1.5 text-sm bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition">
                        + Add Part from Store
                      </button>
                    </div>

                    {formData.parts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                        No parts added yet. Click &quot;Add Part from Store&quot; to add items.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left">Part #</th>
                                <th className="px-3 py-2 text-left">Part Name</th>
                                <th className="px-3 py-2 text-left">Material/Gauge</th>
                                <th className="px-3 py-2 text-left">Dimensions (mm)</th>
                                <th className="px-3 py-2 text-right">SQFT</th>
                                <th className="px-3 py-2 text-right">Total SQFT</th>
                                <th className="px-3 py-2 text-right">Paint Cost/SQFT</th>
                                <th className="px-3 py-2 text-right">Paint Cost/Piece</th>
                                <th className="px-3 py-2 text-right">Qty</th>
                                <th className="px-3 py-2 text-right">Total</th>
                                <th className="px-3 py-2 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {formData.parts.map((part, idx) => {
                                const partTotal = calculatePartTotal(part)
                                const totalSqftVal = (part.blankSizeSqft || 0) * part.qty
                                const dimensionDisplay = getDimensionDisplay(part)
                                return (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">{part.partNo}</td>
                                    <td className="px-3 py-2 font-medium">{part.partName}</td>
                                    <td className="px-3 py-2">{part.material}/{part.gauge}</td>
                                    <td className="px-3 py-2">{dimensionDisplay}</td>
                                    <td className="px-3 py-2 text-right">{part.blankSizeSqft}</td>
                                    <td className="px-3 py-2 text-right">{totalSqftVal.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right">Rs {(part.paintCostPerSqft || 0).toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right text-purple-600">Rs {(part.paintCostPerPiece || 0).toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right">
                                      <div className="flex items-center gap-2 justify-end">
                                        <button type="button" onClick={() => updatePartQuantity(idx, part.qty - 1)}
                                          className="px-2 py-1 text-red-600 hover:text-red-800 border rounded" disabled={part.qty <= 1}>-</button>
                                        <span className="w-12 text-center font-medium">{part.qty}</span>
                                        <button type="button" onClick={() => updatePartQuantity(idx, part.qty + 1)}
                                          className="px-2 py-1 text-green-600 hover:text-green-800 border rounded"
                                          disabled={part.originalQty !== undefined && part.qty >= part.originalQty}>+</button>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">Rs {partTotal.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-center space-x-2">
                                      <button type="button" onClick={() => openPartSelection(idx)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                                      <button type="button" onClick={() => removePart(idx)} className="text-red-600 hover:text-red-800 text-xs">Remove</button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* GRAND TOTAL SECTION */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mt-6">
                          <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                              <h4 className="text-lg font-bold text-gray-800">Grand Total</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Total Quantity: <span className="font-semibold text-gray-900">{formData.parts.reduce((sum, p) => sum + p.qty, 0)}</span> units
                              </p>
                              <p className="text-sm text-gray-600">
                                Total SQFT: <span className="font-semibold text-gray-900">{formData.parts.reduce((sum, p) => sum + ((p.blankSizeSqft || 0) * p.qty), 0).toFixed(2)}</span> sqft
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="text-3xl font-bold text-[#8B5E3C]">
                                Rs {formData.parts.reduce((sum, p) => sum + ((p.paintCostPerPiece || 0) * p.qty), 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-white py-4 border-t">
                    <button type="button" onClick={() => {
                      setIsAddModalOpen(false)
                      setIsEditModalOpen(false)
                      resetForm()
                      setEditingItem(null)
                    }} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      className="px-6 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] transition disabled:opacity-50">
                      {isSubmitting ? (isEditModalOpen ? 'Updating...' : 'Creating...') : (isEditModalOpen ? 'Update Work Order' : 'Create Work Order')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Mechanical Operations Selection Modal */}
        {isMechanicalModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
              setIsMechanicalModalOpen(false)
              setMechanicalSearchTerm('')
            }}></div>
            
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
                    Select Work Order from Mechanical Operations
                  </h2>
                  {/* <p className="text-sm text-gray-500 ml-4">Note: Paint Cost/Piece will be multiplied by ×2 for display</p> */}
                  <button onClick={() => {
                    setIsMechanicalModalOpen(false)
                    setMechanicalSearchTerm('')
                  }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400"><HiSearch className="w-5 h-5" /></span>
                      <input type="text" placeholder="Search by work order number, gate pass, part name..."
                        className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${dmSans.className}`}
                        value={mechanicalSearchTerm} onChange={(e) => setMechanicalSearchTerm(e.target.value)} />
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Work Order #</th>
                          <th className="px-3 py-2 text-left">Gate Pass #</th>
                          <th className="px-3 py-2 text-left">Date Issued</th>
                          <th className="px-3 py-2 text-left">Parts</th>
                          <th className="px-3 py-2 text-right">Total Qty</th>
                          <th className="px-3 py-2 text-right">Paint Cost/SQFT</th>
                          <th className="px-3 py-2 text-right">Paint Cost/Piece</th>
                          <th className="px-3 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredMechanicalOps.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-3 py-8 text-center text-gray-500">No mechanical operations found</td>
                          </tr>
                        ) : (
                          filteredMechanicalOps.map((item) => {
                            const firstPartPaintCost = item.parts[0]?.todayPaintCost || 0
                            const firstPartPaintCostPerPiece = item.parts[0]?.paintCostPerPiece || 0
                            return (
                              <tr key={item._id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium">{item.workOrderNo}</td>
                                <td className="px-3 py-2">{item.gatepassNo}</td>
                                <td className="px-3 py-2">{formatDateTime(item.dateIssued)}</td>
                                <td className="px-3 py-2">{item.parts?.length || 0} items</td>
                                <td className="px-3 py-2 text-right">{item.parts?.reduce((sum, p) => sum + p.qty, 0) || 0}</td>
                                <td className="px-3 py-2 text-right font-semibold text-blue-600">Rs {firstPartPaintCost.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-semibold text-purple-600">Rs {firstPartPaintCostPerPiece.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center">
                                  <button onClick={() => selectMechanicalOp(item)} className="px-3 py-1 text-xs bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition">
                                    Select
                                  </button>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Part Selection Modal - Table with mm dimensions */}
        {isPartModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
              setIsPartModalOpen(false)
              resetPartSelection()
            }}></div>
            
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Select Part from Store Inventory</h2>
                  <button onClick={() => { setIsPartModalOpen(false); resetPartSelection() }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400"><HiSearch className="w-5 h-5" /></span>
                      <input type="text" placeholder="Search by part number, name, category, material..."
                        className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${dmSans.className}`}
                        value={partSearchTerm} onChange={(e) => setPartSearchTerm(e.target.value)} />
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Part #</th>
                          <th className="px-3 py-2 text-left">Part Name</th>
                          <th className="px-3 py-2 text-left">Material/Gauge</th>
                          <th className="px-3 py-2 text-left">Dimensions (mm)</th>
                          <th className="px-3 py-2 text-right">SQFT</th>
                          <th className="px-3 py-2 text-right">Stock</th>
                          <th className="px-3 py-2 text-right">Paint Cost/SQFT</th>
                          <th className="px-3 py-2 text-right">Paint Cost/Piece</th>
                          <th className="px-3 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredStoreItems.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-3 py-8 text-center text-gray-500">No parts found in store</td>
                          </tr>
                        ) : (
                          filteredStoreItems.map((item) => {
                            const paintCostPerSqft = item.todayPaintCost || 0
                            const originalPaintCostPerPiece = (item.sqft || 0) * paintCostPerSqft
                            const paintCostPerPiece = originalPaintCostPerPiece * 2
                            const dimensionDisplay = getDimensionDisplay(item)
                            return (
                              <tr key={item._id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono text-xs">{item.partNumber}</td>
                                <td className="px-3 py-2 font-medium">{item.partName}</td>
                                <td className="px-3 py-2">{item.material}/{item.gauge}</td>
                                <td className="px-3 py-2 text-xs">{dimensionDisplay}</td>
                                <td className="px-3 py-2 text-right">{item.sqft}</td>
                                <td className="px-3 py-2 text-right">
                                  <span className={item.stockInStore <= 0 ? 'text-red-600' : 'text-green-600'}>
                                    {item.stockInStore} {item.unitOfMeasure}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right">Rs {paintCostPerSqft.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-purple-600">Rs {paintCostPerPiece.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center">
                                  {selectedStoreItem?._id === item._id ? (
                                    <div className="flex items-center gap-2">
                                      <input type="number" value={partQuantity} onChange={(e) => setPartQuantity(Number(e.target.value))}
                                        className="w-20 px-2 py-1 border rounded text-sm text-center" min="1" max={item.stockInStore} />
                                      <button onClick={addPartToWorkOrder} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Add</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => selectStoreItem(item)} disabled={item.stockInStore <= 0}
                                      className={`px-3 py-1 text-xs rounded-md transition ${item.stockInStore > 0 ? 'bg-[#8B5E3C] text-white hover:bg-[#6d4a2f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                                      {item.stockInStore > 0 ? 'Select' : 'Out of Stock'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

export const dynamic = 'force-dynamic'