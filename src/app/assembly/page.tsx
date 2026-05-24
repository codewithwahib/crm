// src/app/assembly/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DM_Sans } from 'next/font/google'
import ProtectedRoute from "@/app/Components/ProtectedRoute";
import Sidebar from '@/app/Store/Components/sidebar'
import { HiSearch, HiX, HiPrinter, HiEye } from 'react-icons/hi'
import toast, { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

// Helper function to convert inches to mm
const inchesToMM = (inches: number): number => {
  return Math.round(inches * 25.4)
}

// Helper function to get dimension from store item
const getStoreItemDimension = (item: StoreItem): string => {
  // Priority 1: blankWidthMM and blankLengthMM
  if (item.blankWidthMM && item.blankLengthMM && item.blankWidthMM > 0 && item.blankLengthMM > 0) {
    return `${item.blankWidthMM}mm x ${item.blankLengthMM}mm`
  }
  // Priority 2: blankWidthInch and blankLengthInch
  const widthInch = (item as { blankWidthInch?: number; blankWidth?: number }).blankWidthInch || item.blankWidth || 0
  const lengthInch = (item as { blankLengthInch?: number; blankLength?: number }).blankLengthInch || item.blankLength || 0
  if (widthInch > 0 && lengthInch > 0) {
    return `${inchesToMM(widthInch)}mm x ${inchesToMM(lengthInch)}mm`
  }
  // Priority 3: blankWidth and blankLength (as inches)
  if (item.blankWidth && item.blankLength && item.blankWidth > 0 && item.blankLength > 0) {
    return `${inchesToMM(item.blankWidth)}mm x ${inchesToMM(item.blankLength)}mm`
  }
  return '-'
}

// Helper function to get part dimension display
const getPartDimensionDisplay = (part: AssemblyPartItem): string => {
  if (part.blankWidthMM && part.blankLengthMM && part.blankWidthMM > 0 && part.blankLengthMM > 0) {
    return `${part.blankWidthMM}mm x ${part.blankLengthMM}mm`
  }
  if (part.blankWidth && part.blankLength && part.blankWidth > 0 && part.blankLength > 0) {
    return `${inchesToMM(part.blankWidth)}mm x ${inchesToMM(part.blankLength)}mm`
  }
  return '-'
}

interface StoreItem {
  _id: string
  partNumber: string
  partName: string
  category: string
  storeLocation: string
  gauge?: string
  material?: string
  blankWidth?: number
  blankLength?: number
  blankWidthMM?: number
  blankLengthMM?: number
  blankWidthInch?: number
  blankLengthInch?: number
  sqft?: number
  sheetCostPerPiece?: number
  paintCostPerPiece?: number
  todaySheetCost?: number
  todayPaintCost?: number
  stockInStore: number
  minimumStockLevel: number
  unitOfMeasure: string
}

interface AssemblyPartItem {
  partNo: string
  partName: string
  category: string
  storeLocation: string
  blankWidth?: number
  blankLength?: number
  blankWidthMM?: number
  blankLengthMM?: number
  blankSizeSqft: number
  sheetCost: number
  gauge: string
  material: string
  qty: number
  completedQty: number
  remainingQty: number
  storeItemId: string
}

interface AssemblyOp {
  _id: string
  _createdAt: string
  workOrderNo: string
  gatepassNo: string
  dateIssued: string
  assemblyDate?: string
  remarks?: string
  parts: AssemblyPartItem[]
  status: string
}

interface FormData {
  workOrderNo: string
  gatepassNo: string
  dateIssued: string
  assemblyDate: string
  remarks: string
  parts: AssemblyPartItem[]
  status: string
}

export default function AssemblyPage() {
  const [assemblyOps, setAssemblyOps] = useState<AssemblyOp[]>([])
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AssemblyOp | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPartIndex, setCurrentPartIndex] = useState<number | null>(null)
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  const [selectedStoreItem, setSelectedStoreItem] = useState<StoreItem | null>(null)
  const [partSearchTerm, setPartSearchTerm] = useState('')
  const [partQuantity, setPartQuantity] = useState(1)
  const [editPartIndex, setEditPartIndex] = useState<number | null>(null)
  const [isEditPartModalOpen, setIsEditPartModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<AssemblyPartItem | null>(null)
  const [editCompletedQty, setEditCompletedQty] = useState(0)
  const [printFormatModal, setPrintFormatModal] = useState(false)
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<AssemblyOp | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<AssemblyOp | null>(null)
  const [viewFormat, setViewFormat] = useState<'commercial' | 'floor'>('commercial')
  
  const [formData, setFormData] = useState<FormData>({
    workOrderNo: '',
    gatepassNo: '',
    dateIssued: '',
    assemblyDate: '',
    remarks: '',
    parts: [],
    status: 'pending'
  })

  const generateGatepassNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `A-ASM-${year}${month}${day}-${random}`
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchAssemblyOps = async () => {
    try {
      const response = await fetch('/api/assembly')
      if (!response.ok) {
        throw new Error('Failed to fetch assembly operations')
      }
      const result = await response.json()
      setAssemblyOps(result)
      return result
    } catch (err) {
      console.error('Failed to fetch assembly operations', err)
      throw err
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        const storeResponse = await fetch('/api/store/add-item')
        if (!storeResponse.ok) {
          throw new Error('Failed to fetch store items')
        }
        const storeResult = await storeResponse.json()
        
        // Process store items to ensure dimensions are properly mapped
        const processedStoreItems = (Array.isArray(storeResult) ? storeResult : []).map((item: Record<string, unknown>) => ({
          ...item,
          blankWidthMM: (item.blankWidthMM as number) || 0,
          blankLengthMM: (item.blankLengthMM as number) || 0,
          blankWidthInch: (item.blankWidthInch as number) || (item.blankWidth as number) || 0,
          blankLengthInch: (item.blankLengthInch as number) || (item.blankLength as number) || 0,
          blankWidth: (item.blankWidthInch as number) || (item.blankWidth as number) || 0,
          blankLength: (item.blankLengthInch as number) || (item.blankLength as number) || 0,
        })) as StoreItem[]
        
        setStoreItems(processedStoreItems)

        await fetchAssemblyOps()
        
      } catch (err) {
        console.error('Failed to fetch data', err)
        setError('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateTotalCost = (parts: AssemblyPartItem[]) => {
    return parts.reduce((total, part) => total + (part.sheetCost * part.qty), 0)
  }

  const calculateTotalQty = (parts: AssemblyPartItem[]) => {
    return parts.reduce((total, part) => total + part.qty, 0)
  }

  const calculateTotalCompletedQty = (parts: AssemblyPartItem[]) => {
    return parts.reduce((total, part) => total + (part.completedQty || 0), 0)
  }

  const calculateOverallStatus = (parts: AssemblyPartItem[]) => {
    if (parts.length === 0) return 'pending'
    const totalQty = parts.reduce((sum, part) => sum + part.qty, 0)
    const totalCompleted = parts.reduce((sum, part) => sum + (part.completedQty || 0), 0)
    
    if (totalCompleted === 0) return 'pending'
    if (totalCompleted >= totalQty) return 'completed'
    return 'in-progress'
  }

  const openPrintFormatModal = (order: AssemblyOp) => {
    setSelectedOrderForPrint(order)
    setPrintFormatModal(true)
  }

  const openViewModal = (order: AssemblyOp, format: 'commercial' | 'floor') => {
    setViewingOrder(order)
    setViewFormat(format)
    setIsViewModalOpen(true)
  }

  // Commercial Format Print
  const handlePrintCommercialFormat = (order: AssemblyOp) => {
    setPrintFormatModal(false)
    setTimeout(() => {
      const totalQty = calculateTotalQty(order.parts)
      const totalCost = calculateTotalCost(order.parts)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Assembly Order - ${order.workOrderNo}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
                * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
                body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
                .print-container { max-width: 1100px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
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
                @media print { 
                  body { padding: 3px; } 
                  .print-container { border: none; } 
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header-section">
                  <div class="logo-section">
                    <div class="logo-placeholder">
                      <img src="/logo.png" alt="Company Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='QADRI SPRAY TECH';">
                    </div>
                  </div>
                  <div class="title-section">
                    <div class="main-title">ASSEMBLY ORDER</div>
                    <div class="challan-type">COMMERCIAL - ASSEMBLY OPERATION</div>
                  </div>
                </div>
                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table"><tbody>
                      <tr><td class="info-label">Order Number:</td><td>${order.workOrderNo}</td><td class="info-label">Gate Pass No:</td><td>${order.gatepassNo}</td><td class="info-label">Date Issued:</td><td>${formatDateTime(order.dateIssued)}</td></tr>
                      ${order.assemblyDate ? `<tr><td class="info-label">Assembly Date:</td><td colspan="5">${formatDate(order.assemblyDate)}</td></tr>` : ''}
                    </tbody></table>
                  </div>
                  <div style="overflow-x: auto;">
                    <table class="data-table">
                      <thead><tr><th>S.No</th><th>Part Name</th><th>Part No</th><th>Material/Gauge</th><th>Dimensions (mm)</th><th>Qty</th><th>Cost/Piece</th><th>Total Cost</th></tr></thead>
                      <tbody>
                        ${order.parts.map((part, idx) => {
                          const dimensionDisplay = getPartDimensionDisplay(part)
                          return `
                          <tr>
                            <td class="center-cell">${idx + 1}</td>
                            <td>${part.partName}</td>
                            <td>${part.partNo}</td>
                            <td>${part.material}/${part.gauge}</td>
                            <td class="center-cell">${dimensionDisplay}</td>
                            <td class="center-cell">${part.qty}</td>
                            <td class="numeric-cell">Rs ${part.sheetCost.toLocaleString()}</td>
                            <td class="numeric-cell">Rs ${(part.sheetCost * part.qty).toLocaleString()}</td>
                          </tr>
                        `}).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="4" class="numeric-cell">GRAND TOTAL:</td>
                          <td class="center-cell">${totalQty}</td>
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
                    <div><div class="signature-line"></div><div class="signature-label">Store Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Mechanical Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
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

  // Floor Format Print
  const handlePrintFloorFormat = (order: AssemblyOp) => {
    setPrintFormatModal(false)
    setTimeout(() => {
      const totalQty = calculateTotalQty(order.parts)
      
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
                .print-container { max-width: 1100px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
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
                @media print { 
                  body { padding: 3px; } 
                  .print-container { border: none; } 
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header-section">
                  <div class="logo-section">
                    <div class="logo-placeholder">
                      <img src="/logo.png" alt="Company Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='QADRI SPRAY TECH';">
                    </div>
                  </div>
                  <div class="title-section">
                    <div class="main-title">ASSEMBLY ORDER</div>
                    <div class="challan-type">FLOOR TASK</div>
                  </div>
                </div>
                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table"><tbody>
                      <tr><td class="info-label">Order Number:</td><td>${order.workOrderNo}</td><td class="info-label">Gate Pass No:</td><td>${order.gatepassNo}</td><td class="info-label">Date Issued:</td><td>${formatDateTime(order.dateIssued)}</td></tr>
                      ${order.assemblyDate ? `<tr><td class="info-label">Assembly Date:</td><td colspan="5">${formatDate(order.assemblyDate)}</td></tr>` : ''}
                    </tbody></table>
                  </div>
                  <div style="overflow-x: auto;">
                    <table class="data-table">
                      <thead><tr><th>S.No</th><th>Part Name</th><th>Part No</th><th>Material/Gauge</th><th>Dimensions (mm)</th><th>Qty</th></tr></thead>
                      <tbody>
                        ${order.parts.map((part, idx) => {
                          const dimensionDisplay = getPartDimensionDisplay(part)
                          return `
                          <tr>
                            <td class="center-cell">${idx + 1}</td>
                            <td>${part.partName}</td>
                            <td>${part.partNo}</td>
                            <td>${part.material}/${part.gauge}</td>
                            <td class="center-cell">${dimensionDisplay}</td>
                            <td class="center-cell">${part.qty}</td>
                          </tr>
                        `}).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="4" class="numeric-cell">GRAND TOTAL:</td>
                          <td class="center-cell">${totalQty}</td>
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
                    <div><div class="signature-line"></div><div class="signature-label">Store Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Mechanical Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
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

  const filteredItems = assemblyOps.filter(item => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      (item.workOrderNo?.toLowerCase() || '').includes(searchLower) ||
      (item.gatepassNo?.toLowerCase() || '').includes(searchLower) ||
      (item.remarks?.toLowerCase() || '').includes(searchLower) ||
      item.parts.some(part => 
        part.partNo.toLowerCase().includes(searchLower) ||
        part.partName.toLowerCase().includes(searchLower)
      )
    )
  })

  const filteredStoreItems = storeItems.filter(item => {
    if (!partSearchTerm) return true
    const searchLower = partSearchTerm.toLowerCase()
    return (
      (item.partNumber?.toLowerCase() || '').includes(searchLower) ||
      (item.partName?.toLowerCase() || '').includes(searchLower) ||
      (item.category?.toLowerCase() || '').includes(searchLower) ||
      (item.material?.toLowerCase() || '').includes(searchLower)
    )
  })

  const handleDelete = async (id: string) => {
    const item = assemblyOps.find(item => item._id === id)
    const workOrderNo = item?.workOrderNo || 'this item'
    
    toast.custom((t) => (
      <div className={`bg-white p-6 rounded-lg shadow-xl border border-gray-200 max-w-md ${dmSans.className}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete Assembly Order <span className="font-semibold">{workOrderNo}</span>? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id)
            try {
              setDeletingId(id)
              const res = await fetch('/api/assembly', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || data.details || 'Failed to delete')
              setAssemblyOps(prev => prev.filter(item => item._id !== id))
              toast.success(`Assembly Order ${workOrderNo} deleted successfully!`, { duration: 4000 })
            } catch (err) {
              console.error('Delete error:', err)
              toast.error(err instanceof Error ? err.message : `Failed to delete ${workOrderNo}`, { duration: 4000 })
            } finally { setDeletingId(null) }
          }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition">Delete</button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      workOrderNo: '',
      gatepassNo: generateGatepassNumber(),
      dateIssued: new Date().toISOString().slice(0, 16),
      assemblyDate: '',
      remarks: '',
      parts: [],
      status: 'pending'
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

  const openEditModal = (item: AssemblyOp) => {
    setEditingItem(item)
    setFormData({
      workOrderNo: item.workOrderNo,
      gatepassNo: item.gatepassNo,
      dateIssued: item.dateIssued.slice(0, 16),
      assemblyDate: item.assemblyDate ? item.assemblyDate.slice(0, 10) : '',
      remarks: item.remarks || '',
      parts: item.parts.map(part => ({ 
        ...part, 
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankWidthMM: part.blankWidthMM || 0,
        blankLengthMM: part.blankLengthMM || 0,
        completedQty: part.completedQty || 0, 
        remainingQty: (part.qty - (part.completedQty || 0)) 
      })),
      status: item.status || 'pending'
    })
    setIsEditModalOpen(true)
  }

  const openEditPartModal = (part: AssemblyPartItem, index: number) => {
    setEditingPart(part)
    setEditPartIndex(index)
    setEditCompletedQty(part.completedQty || 0)
    setIsEditPartModalOpen(true)
  }

  const updatePartCompletion = () => {
    if (editingPart && editPartIndex !== null) {
      const newCompletedQty = Math.min(editCompletedQty, editingPart.qty)
      const newRemainingQty = editingPart.qty - newCompletedQty
      const updatedParts = [...formData.parts]
      updatedParts[editPartIndex] = { ...editingPart, completedQty: newCompletedQty, remainingQty: newRemainingQty }
      setFormData(prev => ({ ...prev, parts: updatedParts }))
      setIsEditPartModalOpen(false)
      setEditingPart(null)
      setEditPartIndex(null)
      setEditCompletedQty(0)
      toast.success(`Updated completion quantity for ${editingPart.partName}`)
    }
  }

  const selectStoreItem = (item: StoreItem) => {
    setSelectedStoreItem(item)
    setPartQuantity(1)
  }

  // Add part to assembly with stock deduction
  const addPartToAssembly = async () => {
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

    const costPerPiece = selectedStoreItem.sheetCostPerPiece || 0
    const blankWidthMM = selectedStoreItem.blankWidthMM || 0
    const blankLengthMM = selectedStoreItem.blankLengthMM || 0
    const blankWidthInch = selectedStoreItem.blankWidthInch || selectedStoreItem.blankWidth || 0
    const blankLengthInch = selectedStoreItem.blankLengthInch || selectedStoreItem.blankLength || 0

    const newPart: AssemblyPartItem = {
      partNo: selectedStoreItem.partNumber,
      partName: selectedStoreItem.partName,
      category: selectedStoreItem.category,
      storeLocation: selectedStoreItem.storeLocation,
      blankWidth: blankWidthInch,
      blankLength: blankLengthInch,
      blankWidthMM: blankWidthMM,
      blankLengthMM: blankLengthMM,
      blankSizeSqft: selectedStoreItem.sqft || 0,
      sheetCost: costPerPiece,
      gauge: selectedStoreItem.gauge || '',
      material: selectedStoreItem.material || '',
      qty: partQuantity,
      completedQty: 0,
      remainingQty: partQuantity,
      storeItemId: selectedStoreItem._id
    }

    try {
      const newStock = selectedStoreItem.stockInStore - partQuantity
      
      const stockUpdateResponse = await fetch('/api/store/add-item', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStoreItem._id,
          stockInStore: newStock
        }),
      })

      if (!stockUpdateResponse.ok) {
        throw new Error('Failed to update stock')
      }

      setStoreItems(prev => prev.map(item => 
        item._id === selectedStoreItem._id 
          ? { ...item, stockInStore: newStock }
          : item
      ))

      const updatedParts = [...formData.parts]
      if (currentPartIndex !== null) {
        updatedParts[currentPartIndex] = newPart
      } else {
        updatedParts.push(newPart)
      }
      setFormData(prev => ({ ...prev, parts: updatedParts }))
      setIsPartModalOpen(false)
      resetPartSelection()
      toast.success(`${selectedStoreItem.partName} added to assembly order. Stock updated: ${newStock} remaining`)
      
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error('Failed to update stock. Please try again.')
    }
  }

  // Remove part and restore stock
  const removePart = async (index: number) => {
    const partToRemove = formData.parts[index]
    
    try {
      const storeItem = storeItems.find(item => item._id === partToRemove.storeItemId)
      if (storeItem) {
        const newStock = storeItem.stockInStore + partToRemove.qty
        
        const stockUpdateResponse = await fetch('/api/store/add-item', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: partToRemove.storeItemId,
            stockInStore: newStock
          }),
        })

        if (stockUpdateResponse.ok) {
          setStoreItems(prev => prev.map(item => 
            item._id === partToRemove.storeItemId 
              ? { ...item, stockInStore: newStock }
              : item
          ))
          toast.success(`Stock restored: +${partToRemove.qty} ${storeItem.unitOfMeasure}`)
        }
      }
      
      const updatedParts = formData.parts.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, parts: updatedParts }))
      toast.success('Part removed')
      
    } catch (error) {
      console.error('Error restoring stock:', error)
      toast.error('Failed to restore stock. Please try again.')
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.workOrderNo || !formData.gatepassNo || !formData.dateIssued) {
      toast.error('Please fill in all required fields')
      return
    }
    if (formData.parts.length === 0) {
      toast.error('Please add at least one part')
      return
    }
    setIsSubmitting(true)
    try {
      const overallStatus = calculateOverallStatus(formData.parts)
      const newAssemblyOp = {
        workOrderNo: formData.workOrderNo,
        gatepassNo: formData.gatepassNo,
        dateIssued: formData.dateIssued,
        assemblyDate: formData.assemblyDate || undefined,
        remarks: formData.remarks || undefined,
        parts: formData.parts.map(part => ({
          partNo: part.partNo,
          partName: part.partName,
          category: part.category,
          storeLocation: part.storeLocation,
          blankWidth: part.blankWidth || 0,
          blankLength: part.blankLength || 0,
          blankWidthMM: part.blankWidthMM || 0,
          blankLengthMM: part.blankLengthMM || 0,
          blankSizeSqft: part.blankSizeSqft,
          sheetCost: part.sheetCost,
          gauge: part.gauge,
          material: part.material,
          qty: part.qty,
          completedQty: part.completedQty || 0,
          remainingQty: part.remainingQty || part.qty,
          storeItemId: part.storeItemId
        })),
        status: overallStatus
      }
      const response = await fetch('/api/assembly', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAssemblyOp) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.details || 'Failed to add assembly order')
      setAssemblyOps(prev => [result.data, ...prev])
      toast.success(result.message || 'Assembly order created successfully!', { duration: 3000 })
      setIsAddModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error adding assembly order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add assembly order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.workOrderNo || !formData.gatepassNo || !formData.dateIssued) {
      toast.error('Please fill in all required fields')
      return
    }
    if (formData.parts.length === 0) {
      toast.error('Please add at least one part')
      return
    }
    setIsSubmitting(true)
    try {
      const overallStatus = calculateOverallStatus(formData.parts)
      const partsForUpdate = formData.parts.map(part => ({
        partNo: part.partNo,
        partName: part.partName,
        category: part.category,
        storeLocation: part.storeLocation,
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankWidthMM: part.blankWidthMM || 0,
        blankLengthMM: part.blankLengthMM || 0,
        blankSizeSqft: part.blankSizeSqft,
        sheetCost: part.sheetCost,
        gauge: part.gauge,
        material: part.material,
        qty: part.qty,
        completedQty: part.completedQty || 0,
        remainingQty: part.remainingQty || (part.qty - (part.completedQty || 0)),
        storeItemId: part.storeItemId
      }))
      const updateData = { 
        id: editingItem?._id, 
        workOrderNo: formData.workOrderNo, 
        gatepassNo: formData.gatepassNo, 
        dateIssued: formData.dateIssued, 
        assemblyDate: formData.assemblyDate, 
        remarks: formData.remarks, 
        parts: partsForUpdate, 
        status: overallStatus 
      }
      const response = await fetch('/api/assembly', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.details || 'Failed to update assembly order')
      await fetchAssemblyOps()
      toast.success(result.message || 'Assembly order updated successfully!', { duration: 3000 })
      setIsEditModalOpen(false)
      resetForm()
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating assembly order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update assembly order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
      case 'in-progress': return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
      case 'on-hold': return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">On Hold</span>
      default: return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pending</span>
    }
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.className} font-sans`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8B5E3C] border-t-transparent shadow-lg"></div>
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
    <ProtectedRoute allowedUser="mechanical">
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Toaster position="top-center" />
      <Sidebar />
      <main className={`max-w-7xl mx-auto px-4 py-10 space-y-8 transition-all duration-300 ${isAddModalOpen || isEditModalOpen || isPartModalOpen || isEditPartModalOpen || printFormatModal || isViewModalOpen ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Header Section */}
        <div className="flex flex-col gap-6 border-b pb-6">
          <div className="space-y-2">
            <h1 className={`text-2xl sm:text-3xl pt-8 font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>Assembly Operations Management</h1>
            <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>Manage assembly orders, track parts issuance, and monitor completion status</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <span className="absolute left-3 top-2.5 text-gray-400"><HiSearch className="w-5 h-5" /></span>
              <input type="text" placeholder="Search by order number, gate pass, part number, part name..." className={`w-full pl-10 pr-24 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none transition ${dmSans.className}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-16 top-2.5 text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>}
              <button className="absolute right-1.5 top-1.5 px-3 py-1.5 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] transition">Search</button>
            </div>
            <button onClick={openAddModal} className="px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition text-sm font-medium">+ Create Assembly Order</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Total Orders</p><p className="text-2xl font-bold text-gray-800">{assemblyOps.length}</p></div>
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Total Parts</p><p className="text-2xl font-bold text-gray-800">{assemblyOps.reduce((sum, op) => sum + calculateTotalQty(op.parts), 0)}</p></div>
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Completed Parts</p><p className="text-2xl font-bold text-green-600">{assemblyOps.reduce((sum, op) => sum + calculateTotalCompletedQty(op.parts), 0)}</p></div>
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Total Cost (PKR)</p><p className="text-2xl font-bold text-[#8B5E3C]">Rs {assemblyOps.reduce((sum, op) => sum + calculateTotalCost(op.parts), 0).toLocaleString()}</p></div>
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Completion Rate</p><p className="text-2xl font-bold text-gray-800">{assemblyOps.length > 0 ? Math.round((assemblyOps.reduce((sum, op) => sum + calculateTotalCompletedQty(op.parts), 0) / assemblyOps.reduce((sum, op) => sum + calculateTotalQty(op.parts), 0)) * 100) : 0}%</p></div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          {isMobile ? (
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No assembly orders found</div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item._id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-[#8B5E3C]">Order: {item.workOrderNo}</h3>
                          <p className="text-xs text-gray-500">GP: {item.gatepassNo}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => openViewModal(item, 'commercial')} className="text-blue-600 hover:text-blue-800 text-sm"><HiEye className="inline w-4 h-4 mr-0.5" /> View</button>
                          <button onClick={() => openPrintFormatModal(item)} className="text-blue-600 hover:text-blue-800 text-sm"><HiPrinter className="inline w-4 h-4 mr-0.5" /> Print</button>
                          <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                          <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id} className={`text-red-600 hover:text-red-800 text-sm ${deletingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}>{deletingId === item._id ? 'Deleting...' : 'Delete'}</button>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Date Issued:</span> {formatDateTime(item.dateIssued)}</p>
                        {item.assemblyDate && <p><span className="font-medium">Assembly Date:</span> {formatDate(item.assemblyDate)}</p>}
                        <p><span className="font-medium">Parts:</span> {item.parts.length} items</p>
                        <p><span className="font-medium">Progress:</span> {calculateTotalCompletedQty(item.parts)} / {calculateTotalQty(item.parts)} completed</p>
                        <p><span className="font-medium">Total Cost:</span> Rs {calculateTotalCost(item.parts).toLocaleString()}</p>
                        <p><span className="font-medium">Status:</span> {getStatusBadge(item.status)}</p>
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
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gate Pass #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date Issued</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Assembly Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Parts</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Progress</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">No assembly orders found</td>
                  </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const totalQty = calculateTotalQty(item.parts)
                      const completedQty = calculateTotalCompletedQty(item.parts)
                      const progressPercent = totalQty > 0 ? (completedQty / totalQty) * 100 : 0
                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.workOrderNo}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{item.gatepassNo}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(item.dateIssued)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(item.assemblyDate)}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <div className="space-y-1">
                              {item.parts.slice(0, 2).map((part, idx) => (
                                <div key={idx} className="text-xs">{part.partName} (x{part.qty})</div>
                              ))}
                              {item.parts.length > 2 && <div className="text-xs text-gray-500">+{item.parts.length - 2} more</div>}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                              <span>{completedQty}/{totalQty}</span>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">Rs {calculateTotalCost(item.parts).toLocaleString()}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 space-x-3">
                            <button onClick={() => openViewModal(item, 'commercial')} className="text-blue-600 hover:text-blue-800 font-medium"><HiEye className="inline w-4 h-4 mr-0.5" /> View</button>
                            <button onClick={() => openPrintFormatModal(item)} className="text-blue-600 hover:text-blue-800 font-medium"><HiPrinter className="inline w-4 h-4 mr-0.5" /> Print</button>
                            <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                            <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id} className={`text-red-600 hover:text-red-800 font-medium ${deletingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}>{deletingId === item._id ? 'Deleting...' : 'Delete'}</button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* View Assembly Order Modal */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Assembly Order Details</h2>
                  <p className="text-sm text-gray-500 mt-1">{viewingOrder.workOrderNo}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewFormat('commercial')}
                      className={`px-3 py-1.5 text-sm rounded-md transition ${
                        viewFormat === 'commercial' 
                          ? 'bg-[#8B5E3C] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💰 Commercial
                    </button>
                    <button
                      onClick={() => setViewFormat('floor')}
                      className={`px-3 py-1.5 text-sm rounded-md transition ${
                        viewFormat === 'floor' 
                          ? 'bg-[#8B5E3C] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🏭 Floor
                    </button>
                  </div>
                  <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Commercial Format View */}
                {viewFormat === 'commercial' && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-bold text-lg">ASSEMBLY ORDER</h3>
                      <p className="text-sm text-gray-600">COMMERCIAL - ASSEMBLY OPERATION</p>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-semibold">Order No:</span> {viewingOrder.workOrderNo}</div>
                        <div><span className="font-semibold">Gate Pass No:</span> {viewingOrder.gatepassNo}</div>
                        <div><span className="font-semibold">Date Issued:</span> {formatDateTime(viewingOrder.dateIssued)}</div>
                        {viewingOrder.assemblyDate && <div><span className="font-semibold">Assembly Date:</span> {formatDate(viewingOrder.assemblyDate)}</div>}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 border text-left">S.No</th>
                              <th className="px-3 py-2 border text-left">Part Name</th>
                              <th className="px-3 py-2 border text-left">Part No</th>
                              <th className="px-3 py-2 border text-left">Material/Gauge</th>
                              <th className="px-3 py-2 border text-left">Dimensions (mm)</th>
                              <th className="px-3 py-2 border text-right">Qty</th>
                              <th className="px-3 py-2 border text-right">Cost/Piece</th>
                              <th className="px-3 py-2 border text-right">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingOrder.parts.map((part, idx) => {
                              const dimensionDisplay = getPartDimensionDisplay(part)
                              return (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 border text-center">{idx + 1}</td>
                                  <td className="px-3 py-2 border">{part.partName}</td>
                                  <td className="px-3 py-2 border">{part.partNo}</td>
                                  <td className="px-3 py-2 border">{part.material}/{part.gauge}</td>
                                  <td className="px-3 py-2 border text-center">{dimensionDisplay}</td>
                                  <td className="px-3 py-2 border text-center">{part.qty}</td>
                                  <td className="px-3 py-2 border text-right">Rs {part.sheetCost.toLocaleString()}</td>
                                  <td className="px-3 py-2 border text-right">Rs {(part.sheetCost * part.qty).toLocaleString()}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot className="bg-green-50 font-semibold">
                            <tr>
                              <td colSpan={5} className="px-3 py-2 border text-right">GRAND TOTAL:</td>
                              <td className="px-3 py-2 border text-center">{calculateTotalQty(viewingOrder.parts)}</td>
                              <td className="px-3 py-2 border text-right">-</td>
                              <td className="px-3 py-2 border text-right">Rs {calculateTotalCost(viewingOrder.parts).toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      {viewingOrder.remarks && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="font-semibold text-sm">REMARKS:</p>
                          <p className="text-sm mt-1">{viewingOrder.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Floor Format View */}
                {viewFormat === 'floor' && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-bold text-lg">ASSEMBLY ORDER</h3>
                      <p className="text-sm text-gray-600">FLOOR TASK</p>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-semibold">Order No:</span> {viewingOrder.workOrderNo}</div>
                        <div><span className="font-semibold">Gate Pass No:</span> {viewingOrder.gatepassNo}</div>
                        <div><span className="font-semibold">Date Issued:</span> {formatDateTime(viewingOrder.dateIssued)}</div>
                        {viewingOrder.assemblyDate && <div><span className="font-semibold">Assembly Date:</span> {formatDate(viewingOrder.assemblyDate)}</div>}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 border text-left">S.No</th>
                              <th className="px-3 py-2 border text-left">Part Name</th>
                              <th className="px-3 py-2 border text-left">Part No</th>
                              <th className="px-3 py-2 border text-left">Material/Gauge</th>
                              <th className="px-3 py-2 border text-left">Dimensions (mm)</th>
                              <th className="px-3 py-2 border text-right">Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingOrder.parts.map((part, idx) => {
                              const dimensionDisplay = getPartDimensionDisplay(part)
                              return (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 border text-center">{idx + 1}</td>
                                  <td className="px-3 py-2 border">{part.partName}</td>
                                  <td className="px-3 py-2 border">{part.partNo}</td>
                                  <td className="px-3 py-2 border">{part.material}/{part.gauge}</td>
                                  <td className="px-3 py-2 border text-center">{dimensionDisplay}</td>
                                  <td className="px-3 py-2 border text-center">{part.qty}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot className="bg-green-50 font-semibold">
                            <tr>
                              <td colSpan={4} className="px-3 py-2 border text-right">GRAND TOTAL:</td>
                              <td className="px-3 py-2 border text-center">{calculateTotalQty(viewingOrder.parts)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      {viewingOrder.remarks && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="font-semibold text-sm">REMARKS:</p>
                          <p className="text-sm mt-1">{viewingOrder.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
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
                <button onClick={() => setPrintFormatModal(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-6 space-y-4">
                <button onClick={() => handlePrintCommercialFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition"><div className="font-semibold text-gray-800">💰 Commercial Format</div><div className="text-sm text-gray-500 mt-1">Complete commercial view with all cost columns</div></button>
                <button onClick={() => handlePrintFloorFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition"><div className="font-semibold text-gray-800">🏭 Floor Format</div><div className="text-sm text-gray-500 mt-1">Production task view - No cost columns</div></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Assembly Order Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); setEditingItem(null); }}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>{isEditModalOpen ? 'Edit Assembly Order' : 'Create New Assembly Order'}</h2>
                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={isEditModalOpen ? handleEditSubmit : handleSubmit} className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Order Number <span className="text-red-500">*</span></label><input type="text" name="workOrderNo" value={formData.workOrderNo} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" placeholder="e.g., ASM-2024-001" /></div>
                    <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Gate Pass Number <span className="text-red-500">*</span></label><input type="text" name="gatepassNo" value={formData.gatepassNo} onChange={handleChange} required readOnly={!isEditModalOpen} className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${!isEditModalOpen ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="Auto-generated" />{!isEditModalOpen && <p className="text-xs text-gray-500 mt-1">Gate pass number is auto-generated</p>}</div>
                    <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Date Issued <span className="text-red-500">*</span></label><input type="datetime-local" name="dateIssued" value={formData.dateIssued} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" /></div>
                    <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Assembly Date</label><input type="date" name="assemblyDate" value={formData.assemblyDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" /></div>
                    <div className="md:col-span-2"><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Remarks</label><textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" placeholder="Additional notes..." /></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex justify-between items-center mb-4"><h3 className={`text-lg font-semibold text-gray-800 ${dmSans.className}`}>Parts List</h3>{!isEditModalOpen && <button type="button" onClick={() => openPartSelection()} className="px-3 py-1.5 text-sm bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition">+ Add Part from Store</button>}</div>
                  {formData.parts.length === 0 ? <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">No parts added yet. Click &quot;Add Part from Store&quot; to add items.</div> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left">Part #</th>
                            <th className="px-3 py-2 text-left">Part Name</th>
                            <th className="px-3 py-2 text-left">Category</th>
                            <th className="px-3 py-2 text-left">Material/Gauge</th>
                            <th className="px-3 py-2 text-left">Dimensions (mm)</th>
                            <th className="px-3 py-2 text-right">Cost/Piece</th>
                            <th className="px-3 py-2 text-right">Qty</th>
                            <th className="px-3 py-2 text-right">Completed</th>
                            <th className="px-3 py-2 text-right">Remaining</th>
                            <th className="px-3 py-2 text-right">Total</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {formData.parts.map((part, idx) => {
                            const dimensionDisplay = getPartDimensionDisplay(part)
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2">{part.partNo}</td>
                                <td className="px-3 py-2 font-medium">{part.partName}</td>
                                <td className="px-3 py-2 capitalize">{part.category}</td>
                                <td className="px-3 py-2">{part.material}/{part.gauge}</td>
                                <td className="px-3 py-2">{dimensionDisplay}</td>
                                <td className="px-3 py-2 text-right">Rs {part.sheetCost.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right">{part.qty}</td>
                                <td className="px-3 py-2 text-right text-green-600">{part.completedQty || 0}</td>
                                <td className="px-3 py-2 text-right text-orange-600">{part.remainingQty || part.qty}</td>
                                <td className="px-3 py-2 text-right font-medium">Rs {(part.sheetCost * part.qty).toLocaleString()}</td>
                                <td className="px-3 py-2 text-center space-x-2">
                                  {isEditModalOpen ? (
                                    <button type="button" onClick={() => openEditPartModal(part, idx)} className="text-green-600 hover:text-green-800 text-xs">Update Completion</button>
                                  ) : (
                                    <>
                                      <button type="button" onClick={() => openPartSelection(idx)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                                      <button type="button" onClick={() => removePart(idx)} className="text-red-600 hover:text-red-800 text-xs">Remove</button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot className="bg-gray-100 font-semibold">
                          <tr>
                            <td colSpan={5} className="px-3 py-2 text-right">Totals:</td>
                            <td className="px-3 py-2 text-right">-</td>
                            <td className="px-3 py-2 text-right">{formData.parts.reduce((sum, p) => sum + p.qty, 0)}</td>
                            <td className="px-3 py-2 text-right text-green-600">{formData.parts.reduce((sum, p) => sum + (p.completedQty || 0), 0)}</td>
                            <td className="px-3 py-2 text-right text-orange-600">{formData.parts.reduce((sum, p) => sum + (p.remainingQty || p.qty), 0)}</td>
                            <td className="px-3 py-2 text-right">Rs {formData.parts.reduce((sum, p) => sum + (p.sheetCost * p.qty), 0).toLocaleString()}</td>
                            <td className="px-3 py-2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-white py-4 border-t"><button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); setEditingItem(null); }} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button><button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] transition disabled:opacity-50">{isSubmitting ? (isEditModalOpen ? 'Updating...' : 'Creating...') : (isEditModalOpen ? 'Update Assembly Order' : 'Create Assembly Order')}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Part Completion Modal */}
      {isEditPartModalOpen && editingPart && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => { setIsEditPartModalOpen(false); setEditingPart(null); }}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="bg-white border-b px-6 py-4 flex justify-between items-center"><h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Update Completion Status</h2><button onClick={() => { setIsEditPartModalOpen(false); setEditingPart(null); }} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Part Name</p><p className="font-medium text-gray-800">{editingPart.partName}</p><p className="text-sm text-gray-600 mt-2">Part Number</p><p className="font-mono text-sm text-gray-800">{editingPart.partNo}</p><p className="text-sm text-gray-600 mt-2">Total Quantity Required</p><p className="font-semibold text-gray-800">{editingPart.qty} units</p><p className="text-sm text-gray-600 mt-2">Currently Completed</p><p className="font-semibold text-green-600">{editingPart.completedQty || 0} units</p><p className="text-sm text-gray-600 mt-2">Remaining</p><p className="font-semibold text-orange-600">{editingPart.remainingQty || editingPart.qty} units</p></div>
                <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Update Completed Quantity</label><input type="number" value={editCompletedQty} onChange={(e) => setEditCompletedQty(Math.min(Number(e.target.value), editingPart.qty))} min="0" max={editingPart.qty} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" /><p className="text-xs text-gray-500 mt-1">Maximum: {editingPart.qty} units</p></div>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-blue-800">After update: Completed = {editCompletedQty} | Remaining = {editingPart.qty - editCompletedQty}</p></div>
                <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => { setIsEditPartModalOpen(false); setEditingPart(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button><button type="button" onClick={updatePartCompletion} className="px-4 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] transition">Update Completion</button></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Part Selection Modal */}
      {isPartModalOpen && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => { setIsPartModalOpen(false); resetPartSelection(); }}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Select Part from Store Inventory</h2>
                <button onClick={() => { setIsPartModalOpen(false); resetPartSelection(); }} className="text-gray-400 hover:text-gray-600">
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
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-left">Material</th>
                        <th className="px-3 py-2 text-left">Dimensions (mm)</th>
                        <th className="px-3 py-2 text-right">Stock</th>
                        <th className="px-3 py-2 text-right">Cost/Piece</th>
                        <th className="px-3 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredStoreItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-gray-500">No parts found in store</td>
                        </tr>
                      ) : (
                        filteredStoreItems.map((item) => {
                          const dimensionDisplay = getStoreItemDimension(item)
                          const costPerPiece = item.sheetCostPerPiece || 0
                          return (
                            <tr key={item._id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono text-xs">{item.partNumber}</td>
                              <td className="px-3 py-2 font-medium">{item.partName}</td>
                              <td className="px-3 py-2 capitalize">{item.category}</td>
                              <td className="px-3 py-2">{item.material}/{item.gauge}</td>
                              <td className="px-3 py-2 text-xs">{dimensionDisplay}</td>
                              <td className="px-3 py-2 text-right">
                                <span className={item.stockInStore <= 0 ? 'text-red-600' : 'text-green-600'}>
                                  {item.stockInStore} {item.unitOfMeasure}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="font-medium text-[#8B5E3C]">Rs {costPerPiece.toLocaleString()}</span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {selectedStoreItem?._id === item._id ? (
                                  <div className="flex items-center gap-2">
                                    <input type="number" value={partQuantity} onChange={(e) => setPartQuantity(Number(e.target.value))} 
                                      className="w-20 px-2 py-1 border rounded text-sm text-center" min="1" max={item.stockInStore} />
                                    <button onClick={addPartToAssembly} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Add</button>
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