// src/app/mechanical-wo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Mechanical/Components/sidebar'
import { HiSearch, HiX, HiPrinter, HiEye } from 'react-icons/hi'
import toast, { Toaster } from 'react-hot-toast'
import ProtectedRoute from "@/app/Components/ProtectedRoute"

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
  weight?: number
  sheetCostPerPiece?: number
  paintCostPerPiece?: number
  todaySheetCost?: number
  todayPaintCost?: number
  stockInStore: number
  minimumStockLevel: number
  unitOfMeasure: string
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
  weight?: number
  sheetCost: number
  paintCostPerPiece?: number
  todayPaintCost?: number
  gauge: string
  material: string
  qty: number
  completedQty: number
  remainingQty: number
  storeItemId: string
}

interface MechanicalOp {
  _id: string
  _createdAt: string
  workOrderNo: string
  gatepassNo: string
  dateIssued: string
  remarks?: string
  parts: PartItem[]
  overallStatus?: string
}

interface FormData {
  workOrderNo: string
  gatepassNo: string
  dateIssued: string
  remarks: string
  parts: PartItem[]
}

// Helper function to convert inches to mm
const inchesToMM = (inches: number): number => {
  return Number((inches * 25.4).toFixed(1))
}

export default function MechanicalOpList() {
  const [mechanicalOps, setMechanicalOps] = useState<MechanicalOp[]>([])
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [globalPaintCost, setGlobalPaintCost] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  // const [setIsMobile] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MechanicalOp | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPartIndex, setCurrentPartIndex] = useState<number | null>(null)
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  const [selectedStoreItem, setSelectedStoreItem] = useState<StoreItem | null>(null)
  const [partSearchTerm, setPartSearchTerm] = useState('')
  const [partQuantity, setPartQuantity] = useState(1)
  const [editPartIndex, setEditPartIndex] = useState<number | null>(null)
  const [isEditPartModalOpen, setIsEditPartModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<PartItem | null>(null)
  const [editCompletedQty, setEditCompletedQty] = useState(0)
  const [printFormatModal, setPrintFormatModal] = useState(false)
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<MechanicalOp | null>(null)
  
  // New state for View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedOrderForView, setSelectedOrderForView] = useState<MechanicalOp | null>(null)
  const [viewFormat, setViewFormat] = useState<'floor' | 'commercial' | 'completion'>('floor')
  
  const [formData, setFormData] = useState<FormData>({
    workOrderNo: '',
    gatepassNo: '',
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
    return `M-WO-${year}${month}${day}-${random}`
  }

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth < 768)
  //   }
    
  //   handleResize()
  //   window.addEventListener('resize', handleResize)
  //   return () => window.removeEventListener('resize', handleResize)
  // }, [])

  const fetchMechanicalOps = async () => {
    try {
      const mechanicalResponse = await fetch('/api/mechanical-op')
      if (!mechanicalResponse.ok) {
        throw new Error('Failed to fetch mechanical operations')
      }
      const mechanicalResult = await mechanicalResponse.json()
      setMechanicalOps(mechanicalResult)
      return mechanicalResult
    } catch (err) {
      console.error('Failed to fetch mechanical operations', err)
      throw err
    }
  }

  const fetchTodayPaintCost = async () => {
    try {
      const costQuery = `*[_type == "cost"][0] {
        paintSection {
          todayPaintCost
        }
      }`
      const costResult = await client.fetch(costQuery)
      const paintCost = costResult?.paintSection?.todayPaintCost || 0
      setGlobalPaintCost(paintCost)
      return paintCost
    } catch (err) {
      console.error('Failed to fetch paint cost:', err)
      return 0
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        await fetchTodayPaintCost()
        
        const storeResponse = await fetch('/api/store/add-item')
        if (!storeResponse.ok) {
          throw new Error('Failed to fetch store items')
        }
        const storeResult = await storeResponse.json()
        
        const storeItemsWithDimensions = storeResult.map((item: StoreItem) => ({
          ...item,
          weight: item.weight || 0,
          sqft: item.sqft || 0,
          blankWidthMM: item.blankWidthMM || 0,
          blankLengthMM: item.blankLengthMM || 0,
          blankWidthInch: item.blankWidthInch || (item.blankWidth || 0),
          blankLengthInch: item.blankLengthInch || (item.blankLength || 0),
          blankWidth: item.blankWidthInch || item.blankWidth || 0,
          blankLength: item.blankLengthInch || item.blankLength || 0,
          sheetCostPerPiece: item.sheetCostPerPiece || 0
        }))
        
        setStoreItems(Array.isArray(storeItemsWithDimensions) ? storeItemsWithDimensions : [])

        await fetchMechanicalOps()
        
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

  const calculateTotalCost = (parts: PartItem[]) => {
    return parts.reduce((total, part) => total + (part.sheetCost * part.qty), 0)
  }

  const calculateTotalQty = (parts: PartItem[]) => {
    return parts.reduce((total, part) => total + part.qty, 0)
  }

  const calculateTotalCompletedQty = (parts: PartItem[]) => {
    return parts.reduce((total, part) => total + (part.completedQty || 0), 0)
  }

  const calculateTotalWeight = (parts: PartItem[]) => {
    return parts.reduce((total, part) => total + ((part.weight || 0) * part.qty), 0)
  }

  const calculateTotalSqft = (parts: PartItem[]) => {
    return parts.reduce((total, part) => total + ((part.blankSizeSqft || 0) * part.qty), 0)
  }

  const calculateOverallStatus = (parts: PartItem[]) => {
    if (parts.length === 0) return 'not-started'
    const totalQty = parts.reduce((sum, part) => sum + part.qty, 0)
    const totalCompleted = parts.reduce((sum, part) => sum + (part.completedQty || 0), 0)
    
    if (totalCompleted === 0) return 'not-started'
    if (totalCompleted >= totalQty) return 'completed'
    return 'in-progress'
  }

  const filteredItems = mechanicalOps.filter(item => {
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

  const openPrintFormatModal = (order: MechanicalOp) => {
    setSelectedOrderForPrint(order)
    setPrintFormatModal(true)
  }

  // Open View Modal
  const openViewModal = (order: MechanicalOp, format: 'floor' | 'commercial' | 'completion') => {
    setSelectedOrderForView(order)
    setViewFormat(format)
    setViewModalOpen(true)
  }

  // Helper function to get dimension display for screen (shows mm if available)
  const getDimensionDisplay = (part: PartItem) => {
    if (part.blankWidthMM && part.blankLengthMM && part.blankWidthMM > 0 && part.blankLengthMM > 0) {
      return `${part.blankWidthMM}mm x ${part.blankLengthMM}mm`
    }
    return `${part.blankWidthInch || part.blankWidth || 0}" x ${part.blankLengthInch || part.blankLength || 0}"`
  }

  // Helper function to get dimension display for print (always converts to mm)
  const getPrintDimensionDisplay = (part: PartItem) => {
    let widthMM = part.blankWidthMM || 0
    let lengthMM = part.blankLengthMM || 0
    
    if (widthMM === 0 && (part.blankWidthInch || part.blankWidth)) {
      widthMM = inchesToMM(part.blankWidthInch || part.blankWidth || 0)
    }
    if (lengthMM === 0 && (part.blankLengthInch || part.blankLength)) {
      lengthMM = inchesToMM(part.blankLengthInch || part.blankLength || 0)
    }
    
    return `${widthMM}mm x ${lengthMM}mm`
  }

  // Complete all parts in the order
  const completeAllParts = () => {
    const updatedParts = formData.parts.map(part => ({
      ...part,
      completedQty: part.qty,
      remainingQty: 0
    }))
    
    setFormData(prev => ({ ...prev, parts: updatedParts }))
    toast.success('All parts marked as completed!')
  }

  // Floor Format Print
  const handlePrintFloorFormat = (order: MechanicalOp) => {
    setPrintFormatModal(false)
    setTimeout(() => {
      const totalQty = calculateTotalQty(order.parts)
      const totalWeight = calculateTotalWeight(order.parts)
      const totalSqft = calculateTotalSqft(order.parts)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Floor Format - ${order.workOrderNo}</title>
              <style>
                * { font-family: 'DM Sans', sans-serif !important; margin: 0; padding: 0; box-sizing: border-box; }
                body { margin: 0; padding: 8px; font-size: 12px; background: white; }
                .print-container { max-width: 1200px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
                .header-section { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 2px solid #000; }
                .logo-section { width: 250px; }
                .logo-placeholder { width: 250px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #000; text-transform: uppercase; }
                .logo-image { max-width: 100%; max-height: 80px; object-fit: contain; }
                .title-section { text-align: right; }
                .main-title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
                .challan-type { font-size: 16px; font-weight: bold; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; }
                .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 3px 8px; }
                .info-label { font-weight: bold; }
                .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; margin-top: 10px; margin-bottom: 0; }
                .data-table th { background: #f0f0f0; padding: 6px 4px; border: 1px solid #000; text-align: center; font-weight: bold; }
                .data-table td { padding: 4px 4px; border: 1px solid #000; }
                .numeric-cell { text-align: right; }
                .center-cell { text-align: center; }
                .total-row { background: #e8f5e8; font-weight: bold; }
                .remarks-section { padding: 8px 15px; margin: 5px 15px; }
                .remarks-label { font-weight: bold; font-size: 11px; }
                .remarks-text { font-size: 11px; margin-top: 3px; line-height: 1.3; }
                .content-wrapper { flex: 1; }
                .signature-section { padding: 10px 15px; margin-top: auto; border-top: 1px solid #000; }
                .signature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px; }
                .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
                .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
                .datetime-footer { padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; text-align: left; }
                @media print { body { padding: 3px; } .print-container { border: none; } }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header-section">
                  <div class="logo-section">
                    <div class="logo-placeholder">
                      <img src="/logo.png" alt="Company Logo" class="logo-image" onerror="this.style.display='none';this.parentNode.innerHTML='QADRI SPRAY TECH'" />
                    </div>
                  </div>
                  <div class="title-section">
                    <div class="main-title">FLOOR WORK ORDER</div>
                    <div class="challan-type">PRODUCTION TASK</div>
                  </div>
                </div>
                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table"><tbody><tr>
                      <td class="info-label">Work Order No:</td>
                      <td>${order.workOrderNo}</td>
                      <td class="info-label">Gate Pass No:</td>
                      <td>${order.gatepassNo}</td>
                      <td class="info-label">Date Issued:</td>
                      <td>${formatDateTime(order.dateIssued)}</td>
                    </tr></tbody></table>
                  </div>
                  <div style="overflow-x: auto;">
                    <table class="data-table">
                      <thead><tr>
                        <th>S.No</th><th>Part Name</th><th>Part No</th><th>Dimensions</th>
                        <th>SQFT/Piece</th><th>Weight/Piece(kg)</th>
                        <th>Total SQFT</th><th>Total Weight(kg)</th><th>Qty</th>
                      </tr></thead>
                      <tbody>
                        ${order.parts.map((part, idx) => {
                          const totalPartWeight = (part.weight || 0) * part.qty
                          const totalPartSqft = (part.blankSizeSqft || 0) * part.qty
                          const dimensionDisplay = getPrintDimensionDisplay(part)
                          return `<tr>
                            <td class="center-cell">${idx + 1}</td>
                            <td>${part.partName}</td>
                            <td>${part.partNo}</td>
                            <td class="center-cell">${dimensionDisplay}</td>
                            <td class="numeric-cell">${(part.blankSizeSqft || 0).toFixed(2)}</td>
                            <td class="numeric-cell">${(part.weight || 0).toFixed(3)}</td>
                            <td class="numeric-cell">${totalPartSqft.toFixed(2)}</td>
                            <td class="numeric-cell">${totalPartWeight.toFixed(3)}</td>
                            <td class="center-cell">${part.qty}</td>
                          </tr>`
                        }).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="4" class="numeric-cell">GRAND TOTAL:</td>
                          <td class="numeric-cell">${totalSqft.toFixed(2)}</td>
                          <td class="numeric-cell">${totalWeight.toFixed(3)}</td>
                          <td class="numeric-cell">-</td>
                          <td class="numeric-cell">-</td>
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

  // Commercial Format Print
  const handlePrintCommercialFormat = (order: MechanicalOp) => {
    setPrintFormatModal(false)
    setTimeout(() => {
      const totalQty = calculateTotalQty(order.parts)
      const totalCost = calculateTotalCost(order.parts)
      const totalWeight = calculateTotalWeight(order.parts)
      const totalSqft = calculateTotalSqft(order.parts)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Commercial Format - ${order.workOrderNo}</title>
              <style>
                * { font-family: 'DM Sans', sans-serif !important; margin: 0; padding: 0; box-sizing: border-box; }
                body { margin: 0; padding: 8px; font-size: 12px; background: white; }
                .print-container { max-width: 1300px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
                .header-section { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 2px solid #000; }
                .logo-section { width: 250px; }
                .logo-placeholder { width: 250px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #000; text-transform: uppercase; }
                .logo-image { max-width: 100%; max-height: 80px; object-fit: contain; }
                .title-section { text-align: right; }
                .main-title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
                .challan-type { font-size: 16px; font-weight: bold; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; }
                .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 3px 8px; }
                .info-label { font-weight: bold; }
                .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; margin-top: 10px; margin-bottom: 0; }
                .data-table th { background: #f0f0f0; padding: 6px 4px; border: 1px solid #000; text-align: center; font-weight: bold; }
                .data-table td { padding: 4px 4px; border: 1px solid #000; }
                .numeric-cell { text-align: right; }
                .center-cell { text-align: center; }
                .total-row { background: #e8f5e8; font-weight: bold; }
                .remarks-section { padding: 8px 15px; margin: 5px 15px; }
                .remarks-label { font-weight: bold; font-size: 11px; }
                .remarks-text { font-size: 11px; margin-top: 3px; line-height: 1.3; }
                .content-wrapper { flex: 1; }
                .signature-section { padding: 10px 15px; margin-top: auto; border-top: 1px solid #000; }
                .signature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px; }
                .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
                .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
                .datetime-footer { padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; text-align: left; }
                @media print { body { padding: 3px; } .print-container { border: none; } }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header-section">
                  <div class="logo-section">
                    <div class="logo-placeholder">
                      <img src="/logo.png" alt="Company Logo" class="logo-image" onerror="this.style.display='none';this.parentNode.innerHTML='QADRI SPRAY TECH'" />
                    </div>
                  </div>
                  <div class="title-section">
                    <div class="main-title">COMMERCIAL WORK ORDER</div>
                    <div class="challan-type">MECHANICAL OPERATION</div>
                  </div>
                </div>
                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table"><tbody><tr>
                      <td class="info-label">Work Order No:</td>
                      <td>${order.workOrderNo}</td>
                      <td class="info-label">Gate Pass No:</td>
                      <td>${order.gatepassNo}</td>
                      <td class="info-label">Date Issued:</td>
                      <td>${formatDateTime(order.dateIssued)}</td>
                    </tr></tbody></table>
                  </div>
                  <div style="overflow-x: auto;">
                    <table class="data-table">
                      <thead><tr>
                        <th>S.No</th><th>Part Name</th><th>Part No</th><th>Dimensions</th>
                        <th>SQFT</th><th>Weight/Piece</th>
                        <th>Total SQFT</th><th>Total Weight</th>
                        <th>Qty</th><th>Sheet Cost/Piece</th><th>Total Cost</th>
                      </tr></thead>
                      <tbody>
                        ${order.parts.map((part, idx) => {
                          const totalPartWeight = (part.weight || 0) * part.qty
                          const totalPartSqft = (part.blankSizeSqft || 0) * part.qty
                          const dimensionDisplay = getPrintDimensionDisplay(part)
                          return `<tr>
                            <td class="center-cell">${idx + 1}</td>
                            <td>${part.partName}</td>
                            <td>${part.partNo}</td>
                            <td class="center-cell">${dimensionDisplay}</td>
                            <td class="numeric-cell">${(part.blankSizeSqft || 0).toFixed(2)}</td>
                            <td class="numeric-cell">${(part.weight || 0).toFixed(3)}</td>
                            <td class="numeric-cell">${totalPartSqft.toFixed(2)}</td>
                            <td class="numeric-cell">${totalPartWeight.toFixed(3)}</td>
                            <td class="center-cell">${part.qty}</td>
                            <td class="numeric-cell">Rs ${part.sheetCost.toLocaleString()}</td>
                            <td class="numeric-cell">Rs ${(part.sheetCost * part.qty).toLocaleString()}</td>
                          </tr>`
                        }).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="4" class="numeric-cell">GRAND TOTAL:</td>
                          <td class="numeric-cell">${totalSqft.toFixed(2)}</td>
                          <td class="numeric-cell">${totalWeight.toFixed(3)}</td>
                          <td class="numeric-cell">-</td>
                          <td class="numeric-cell">-</td>
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

  // Completion Format Print
  const handlePrintCompletionFormat = (order: MechanicalOp) => {
    setPrintFormatModal(false)
    setTimeout(() => {
      const totalQty = calculateTotalQty(order.parts)
      const completedQty = calculateTotalCompletedQty(order.parts)
      const totalWeight = calculateTotalWeight(order.parts)
      const totalSqft = calculateTotalSqft(order.parts)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Completion Format - ${order.workOrderNo}</title>
              <style>
                * { font-family: 'DM Sans', sans-serif !important; margin: 0; padding: 0; box-sizing: border-box; }
                body { margin: 0; padding: 8px; font-size: 12px; background: white; }
                .print-container { max-width: 1300px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; }
                .header-section { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 2px solid #000; }
                .logo-section { width: 250px; }
                .logo-placeholder { width: 250px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #000; text-transform: uppercase; }
                .logo-image { max-width: 100%; max-height: 80px; object-fit: contain; }
                .title-section { text-align: right; }
                .main-title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
                .challan-type { font-size: 16px; font-weight: bold; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; background: #fff3cd; }
                .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 3px 8px; }
                .info-label { font-weight: bold; }
                .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; margin-top: 10px; margin-bottom: 0; }
                .data-table th { background: #f0f0f0; padding: 6px 4px; border: 1px solid #000; text-align: center; font-weight: bold; }
                .data-table td { padding: 4px 4px; border: 1px solid #000; }
                .numeric-cell { text-align: right; }
                .center-cell { text-align: center; }
                .tick-cell { text-align: center; font-size: 16px; font-weight: bold; }
                .completed-row { background: #d4edda; }
                .total-row { background: #fff3cd; font-weight: bold; }
                .remarks-section { padding: 8px 15px; margin: 5px 15px; }
                .remarks-label { font-weight: bold; font-size: 11px; }
                .remarks-text { font-size: 11px; margin-top: 3px; line-height: 1.3; }
                .content-wrapper { flex: 1; }
                .signature-section { padding: 10px 15px; margin-top: auto; border-top: 1px solid #000; }
                .signature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px; }
                .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
                .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
                .datetime-footer { padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; text-align: left; }
                @media print { body { padding: 3px; } .print-container { border: none; } }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header-section">
                  <div class="logo-section">
                    <div class="logo-placeholder">
                      <img src="/logo.png" alt="Company Logo" class="logo-image" onerror="this.style.display='none';this.parentNode.innerHTML='QADRI SPRAY TECH'" />
                    </div>
                  </div>
                  <div class="title-section">
                    <div class="main-title">COMPLETION REPORT</div>
                    <div class="challan-type">PRODUCTION STATUS</div>
                  </div>
                </div>
                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table"><tbody><tr>
                      <td class="info-label">Work Order No:</td>
                      <td>${order.workOrderNo}</td>
                      <td class="info-label">Gate Pass No:</td>
                      <td>${order.gatepassNo}</td>
                      <td class="info-label">Date Issued:</td>
                      <td>${formatDateTime(order.dateIssued)}</td>
                    <tr></tbody></table>
                  </div>
                  <div style="overflow-x: auto;">
                    <table class="data-table">
                      <thead><tr>
                        <th>S.No</th><th>Part Name</th><th>Part No</th><th>Dimensions</th>
                        <th>SQFT</th><th>Weight/Piece</th>
                        <th>Total SQFT</th><th>Total Weight</th>
                        <th>Qty</th><th>Completed</th><th>Remaining</th><th>Status ✓</th>
                      </tr></thead>
                      <tbody>
                        ${order.parts.map((part, idx) => {
                          const totalPartWeight = (part.weight || 0) * part.qty
                          const totalPartSqft = (part.blankSizeSqft || 0) * part.qty
                          const isCompleted = (part.completedQty || 0) >= part.qty
                          const dimensionDisplay = getPrintDimensionDisplay(part)
                          return `<tr class="${isCompleted ? 'completed-row' : ''}">
                            <td class="center-cell">${idx + 1}</td>
                            <td>${part.partName}</td>
                            <td>${part.partNo}</td>
                            <td class="center-cell">${dimensionDisplay}</td>
                            <td class="numeric-cell">${(part.blankSizeSqft || 0).toFixed(2)}</td>
                            <td class="numeric-cell">${(part.weight || 0).toFixed(3)}</td>
                            <td class="numeric-cell">${totalPartSqft.toFixed(2)}</td>
                            <td class="numeric-cell">${totalPartWeight.toFixed(3)}</td>
                            <td class="center-cell">${part.qty}</td>
                            <td class="center-cell">${part.completedQty || 0}</td>
                            <td class="center-cell">${part.remainingQty || part.qty}</td>
                            <td class="tick-cell">${isCompleted ? '✓' : '□'}</td>
                          </tr>`
                        }).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="4" class="numeric-cell">GRAND TOTAL:</td>
                          <td class="numeric-cell">${totalSqft.toFixed(2)}</td>
                          <td class="numeric-cell">${totalWeight.toFixed(3)}</td>
                          <td class="numeric-cell">-</td>
                          <td class="numeric-cell">-</td>
                          <td class="center-cell">${totalQty}</td>
                          <td class="center-cell">${completedQty}</td>
                          <td class="center-cell">${totalQty - completedQty}</td>
                          <td class="tick-cell"></td>
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

  const handleDelete = async (id: string) => {
    const item = mechanicalOps.find(item => item._id === id)
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
              const res = await fetch('/api/mechanical-op', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
              })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || data.details || 'Failed to delete')
              setMechanicalOps(prev => prev.filter(item => item._id !== id))
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

  const openEditModal = (item: MechanicalOp) => {
    setEditingItem(item)
    setFormData({
      workOrderNo: item.workOrderNo,
      gatepassNo: item.gatepassNo,
      dateIssued: item.dateIssued.slice(0, 16),
      remarks: item.remarks || '',
      parts: item.parts.map(part => ({
        ...part,
        completedQty: part.completedQty || 0,
        remainingQty: (part.qty - (part.completedQty || 0))
      }))
    })
    setIsEditModalOpen(true)
  }

  const openEditPartModal = (part: PartItem, index: number) => {
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
      updatedParts[editPartIndex] = {
        ...editingPart,
        completedQty: newCompletedQty,
        remainingQty: newRemainingQty
      }
      
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

  // UPDATED: Removed stock check for adding parts - allow zero quantity
  const addPartToWorkOrder = () => {
    if (!selectedStoreItem) {
      toast.error('Please select a part first')
      return
    }

    if (partQuantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    const costPerPiece = selectedStoreItem.sheetCostPerPiece || 0
    const currentPaintCost = globalPaintCost
    const paintCostPerPieceValue = (selectedStoreItem.sqft || 0) * currentPaintCost

    const newPart: PartItem = {
      partNo: selectedStoreItem.partNumber,
      partName: selectedStoreItem.partName,
      category: selectedStoreItem.category,
      storeLocation: selectedStoreItem.storeLocation,
      blankWidthMM: selectedStoreItem.blankWidthMM || 0,
      blankLengthMM: selectedStoreItem.blankLengthMM || 0,
      blankWidthInch: selectedStoreItem.blankWidthInch || (selectedStoreItem.blankWidth || 0),
      blankLengthInch: selectedStoreItem.blankLengthInch || (selectedStoreItem.blankLength || 0),
      blankWidth: selectedStoreItem.blankWidthInch || selectedStoreItem.blankWidth || 0,
      blankLength: selectedStoreItem.blankLengthInch || selectedStoreItem.blankLength || 0,
      blankSizeSqft: selectedStoreItem.sqft || 0,
      weight: selectedStoreItem.weight || 0,
      sheetCost: costPerPiece,
      paintCostPerPiece: paintCostPerPieceValue,
      todayPaintCost: currentPaintCost,
      gauge: selectedStoreItem.gauge || '',
      material: selectedStoreItem.material || '',
      qty: partQuantity,
      completedQty: 0,
      remainingQty: partQuantity,
      storeItemId: selectedStoreItem._id
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
    
    toast.success(`${selectedStoreItem.partName} added to work order with quantity ${partQuantity}`)
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
      
      const newMechanicalOp = {
        workOrderNo: formData.workOrderNo,
        gatepassNo: formData.gatepassNo,
        dateIssued: formData.dateIssued,
        remarks: formData.remarks || undefined,
        parts: formData.parts.map(part => ({
          partNo: part.partNo,
          partName: part.partName,
          category: part.category,
          storeLocation: part.storeLocation,
          blankWidthMM: part.blankWidthMM || 0,
          blankLengthMM: part.blankLengthMM || 0,
          blankWidthInch: part.blankWidthInch || 0,
          blankLengthInch: part.blankLengthInch || 0,
          blankWidth: part.blankWidthInch || part.blankWidth || 0,
          blankLength: part.blankLengthInch || part.blankLength || 0,
          blankSizeSqft: part.blankSizeSqft,
          weight: part.weight || 0,
          sheetCost: part.sheetCost,
          paintCostPerPiece: part.paintCostPerPiece,
          todayPaintCost: part.todayPaintCost,
          gauge: part.gauge,
          material: part.material,
          qty: part.qty,
          completedQty: part.completedQty || 0,
          remainingQty: part.remainingQty || part.qty,
          storeItemId: part.storeItemId
        })),
        overallStatus
      }

      const response = await fetch('/api/mechanical-op', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMechanicalOp),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to add work order')
      }
      
      setMechanicalOps(prev => [result.data, ...prev])
      toast.success(result.message || 'Work order created successfully!', { duration: 3000 })
      setIsAddModalOpen(false)
      resetForm()
      
    } catch (error) {
      console.error('Error adding work order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add work order. Please try again.')
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
        blankWidthMM: part.blankWidthMM || 0,
        blankLengthMM: part.blankLengthMM || 0,
        blankWidthInch: part.blankWidthInch || 0,
        blankLengthInch: part.blankLengthInch || 0,
        blankWidth: part.blankWidthInch || part.blankWidth || 0,
        blankLength: part.blankLengthInch || part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft,
        weight: part.weight || 0,
        sheetCost: part.sheetCost,
        paintCostPerPiece: part.paintCostPerPiece,
        todayPaintCost: part.todayPaintCost,
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
        remarks: formData.remarks,
        parts: partsForUpdate,
        overallStatus
      }

      const response = await fetch('/api/mechanical-op', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to update work order')
      }

      await fetchMechanicalOps()
      
      toast.success(result.message || 'Work order updated successfully!', { duration: 3000 })
      setIsEditModalOpen(false)
      resetForm()
      setEditingItem(null)
      
    } catch (error) {
      console.error('Error updating work order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update work order.')
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
    <ProtectedRoute allowedUser="mechanical">
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <Toaster position="top-center" />
        <Sidebar />
        
        <main className={`max-w-7xl mx-auto px-4 py-10 space-y-8 transition-all duration-300 ${
          isAddModalOpen || isEditModalOpen || isPartModalOpen || isEditPartModalOpen || printFormatModal || viewModalOpen ? 'blur-sm pointer-events-none' : ''
        }`}>
          
          <div className="flex flex-col gap-6 border-b pb-6">
            <div className="space-y-2">
              <h1 className={`text-2xl sm:text-3xl pt-8 font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
                Mechanical Operations Management
              </h1>
              <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>
                Manage work orders, gate passes, parts issuance, and track completion status
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-96">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <HiSearch className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search by work order, gate pass, part number, part name..."
                  className={`w-full pl-10 pr-24 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none transition ${dmSans.className} text-sm`}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Total Work Orders</p>
              <p className="text-2xl font-bold text-gray-800">{mechanicalOps.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Total Parts</p>
              <p className="text-2xl font-bold text-gray-800">
                {mechanicalOps.reduce((sum, op) => sum + calculateTotalQty(op.parts), 0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {mechanicalOps.reduce((sum, op) => sum + calculateTotalCompletedQty(op.parts), 0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold text-[#8B5E3C]">
                Rs {mechanicalOps.reduce((sum, op) => sum + calculateTotalCost(op.parts), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {mechanicalOps.length > 0 
                  ? Math.round((mechanicalOps.reduce((sum, op) => sum + calculateTotalCompletedQty(op.parts), 0) / 
                      mechanicalOps.reduce((sum, op) => sum + calculateTotalQty(op.parts), 0)) * 100)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Main Table - Desktop view only for simplicity */}
          <div className="overflow-x-auto">
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <table className={`w-full table-auto divide-y divide-gray-200 ${dmSans.className} text-xs`}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">WO #</th>
                    <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Gate Pass #</th>
                    <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Date</th>
                    <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Parts</th>
                    <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Progress</th>
                    <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">Cost</th>
                    <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">Wt(kg)</th>
                    <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">SQFT</th>
                    <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Status</th>
                    <th className="px-2 py-2 text-center text-[11px] font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-4 text-center text-sm text-gray-500">No work orders found</td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const totalQty = calculateTotalQty(item.parts)
                      const completedQty = calculateTotalCompletedQty(item.parts)
                      const progressPercent = totalQty > 0 ? (completedQty / totalQty) * 100 : 0
                      const status = calculateOverallStatus(item.parts)
                      
                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-2 py-2 whitespace-nowrap text-[11px] font-medium text-gray-900">{item.workOrderNo}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700">{item.gatepassNo}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700">{formatDateTime(item.dateIssued)}</td>
                          <td className="px-2 py-2 text-[11px] text-gray-700">
                            <div className="space-y-0.5">
                              {item.parts.slice(0, 2).map((part, idx) => (
                                <div key={idx} className="text-[10px]">{part.partName} (x{part.qty})</div>
                              ))}
                              {item.parts.length > 2 && <div className="text-[10px] text-gray-500">+{item.parts.length - 2} more</div>}
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700">
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px]">{completedQty}/{totalQty}</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">Rs {calculateTotalCost(item.parts).toLocaleString()}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">{calculateTotalWeight(item.parts).toFixed(2)}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">{calculateTotalSqft(item.parts).toFixed(2)}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-[11px]">
                            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                              status === 'completed' ? 'bg-green-100 text-green-800' :
                              status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {status === 'completed' ? 'Done' : status === 'in-progress' ? 'Progress' : 'Start'}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-[11px] space-x-1 text-center">
                            <button onClick={() => openViewModal(item, 'floor')} className="text-blue-600 hover:text-blue-800 font-medium text-[10px]">
                              <HiEye className="inline w-3 h-3 mr-0.5" /> View
                            </button>
                            <button onClick={() => openPrintFormatModal(item)} className="text-blue-600 hover:text-blue-800 font-medium text-[10px]">
                              <HiPrinter className="inline w-3 h-3 mr-0.5" /> Print
                            </button>
                            <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-medium text-[10px] ml-1">Edit</button>
                            <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}
                              className={`text-red-600 hover:text-red-800 font-medium text-[10px] ml-1 ${deletingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              {deletingId === item._id ? 'Del' : 'Delete'}
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
        </main>

        {/* View Modal */}
        {viewModalOpen && selectedOrderForView && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setViewModalOpen(false)}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Work Order Details</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedOrderForView.workOrderNo}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <button onClick={() => setViewFormat('floor')} className={`px-3 py-1.5 text-sm rounded-md transition ${viewFormat === 'floor' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>🏭 Floor</button>
                      <button onClick={() => setViewFormat('commercial')} className={`px-3 py-1.5 text-sm rounded-md transition ${viewFormat === 'commercial' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>💰 Commercial</button>
                      <button onClick={() => setViewFormat('completion')} className={`px-3 py-1.5 text-sm rounded-md transition ${viewFormat === 'completion' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>✅ Completion</button>
                    </div>
                    <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Floor Format View */}
                  {viewFormat === 'floor' && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b">
                        <h3 className="font-bold text-lg">FLOOR WORK ORDER</h3>
                        <p className="text-sm text-gray-600">PRODUCTION TASK</p>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div><span className="font-semibold">Work Order No:</span> {selectedOrderForView.workOrderNo}</div>
                          <div><span className="font-semibold">Gate Pass No:</span> {selectedOrderForView.gatepassNo}</div>
                          <div><span className="font-semibold">Date Issued:</span> {formatDateTime(selectedOrderForView.dateIssued)}</div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 border text-left">S.No</th>
                                <th className="px-3 py-2 border text-left">Part Name</th>
                                <th className="px-3 py-2 border text-left">Part No</th>
                                <th className="px-3 py-2 border text-left">Dimensions</th>
                                <th className="px-3 py-2 border text-right">SQFT/Piece</th>
                                <th className="px-3 py-2 border text-right">Weight/Piece(kg)</th>
                                <th className="px-3 py-2 border text-right">Total SQFT</th>
                                <th className="px-3 py-2 border text-right">Total Weight(kg)</th>
                                <th className="px-3 py-2 border text-right">Qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedOrderForView.parts.map((part, idx) => {
                                const totalPartWeight = (part.weight || 0) * part.qty
                                const totalPartSqft = (part.blankSizeSqft || 0) * part.qty
                                const dimensionDisplay = getPrintDimensionDisplay(part)
                                return (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 border text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border">{part.partName}</td>
                                    <td className="px-3 py-2 border">{part.partNo}</td>
                                    <td className="px-3 py-2 border text-center">{dimensionDisplay}</td>
                                    <td className="px-3 py-2 border text-right">{(part.blankSizeSqft || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 border text-right">{(part.weight || 0).toFixed(3)}</td>
                                    <td className="px-3 py-2 border text-right">{totalPartSqft.toFixed(2)}</td>
                                    <td className="px-3 py-2 border text-right">{totalPartWeight.toFixed(3)}</td>
                                    <td className="px-3 py-2 border text-center">{part.qty}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                            <tfoot className="bg-green-50 font-semibold">
                              <tr><td colSpan={4} className="px-3 py-2 border text-right">GRAND TOTAL:</td><td className="px-3 py-2 border text-right">{calculateTotalSqft(selectedOrderForView.parts).toFixed(2)}</td><td className="px-3 py-2 border text-right">{calculateTotalWeight(selectedOrderForView.parts).toFixed(3)}</td><td className="px-3 py-2 border text-right">-</td><td className="px-3 py-2 border text-right">-</td><td className="px-3 py-2 border text-center">{calculateTotalQty(selectedOrderForView.parts)}</td></tr>
                            </tfoot>
                          </table>
                        </div>
                        {selectedOrderForView.remarks && <div className="bg-gray-50 p-3 rounded"><p className="font-semibold text-sm">REMARKS:</p><p className="text-sm mt-1">{selectedOrderForView.remarks}</p></div>}
                      </div>
                    </div>
                  )}

                  {/* Commercial Format View */}
                  {viewFormat === 'commercial' && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b">
                        <h3 className="font-bold text-lg">COMMERCIAL WORK ORDER</h3>
                        <p className="text-sm text-gray-600">MECHANICAL OPERATION</p>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div><span className="font-semibold">Work Order No:</span> {selectedOrderForView.workOrderNo}</div>
                          <div><span className="font-semibold">Gate Pass No:</span> {selectedOrderForView.gatepassNo}</div>
                          <div><span className="font-semibold">Date Issued:</span> {formatDateTime(selectedOrderForView.dateIssued)}</div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                              <tr><th className="px-3 py-2 border text-left">S.No</th><th className="px-3 py-2 border text-left">Part Name</th><th className="px-3 py-2 border text-left">Part No</th><th className="px-3 py-2 border text-left">Dimensions</th><th className="px-3 py-2 border text-right">SQFT</th><th className="px-3 py-2 border text-right">Weight/Piece</th><th className="px-3 py-2 border text-right">Total SQFT</th><th className="px-3 py-2 border text-right">Total Weight</th><th className="px-3 py-2 border text-right">Qty</th><th className="px-3 py-2 border text-right">Sheet Cost/Piece</th><th className="px-3 py-2 border text-right">Total Cost</th></tr>
                            </thead>
                            <tbody>
                              {selectedOrderForView.parts.map((part, idx) => {
                                const totalPartWeight = (part.weight || 0) * part.qty
                                const totalPartSqft = (part.blankSizeSqft || 0) * part.qty
                                const dimensionDisplay = getPrintDimensionDisplay(part)
                                return (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 border text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border">{part.partName}</td>
                                    <td className="px-3 py-2 border">{part.partNo}</td>
                                    <td className="px-3 py-2 border text-center">{dimensionDisplay}</td>
                                    <td className="px-3 py-2 border text-right">{(part.blankSizeSqft || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 border text-right">{(part.weight || 0).toFixed(3)}</td>
                                    <td className="px-3 py-2 border text-right">{totalPartSqft.toFixed(2)}</td>
                                    <td className="px-3 py-2 border text-right">{totalPartWeight.toFixed(3)}</td>
                                    <td className="px-3 py-2 border text-center">{part.qty}</td>
                                    <td className="px-3 py-2 border text-right">Rs {part.sheetCost.toLocaleString()}</td>
                                    <td className="px-3 py-2 border text-right">Rs {(part.sheetCost * part.qty).toLocaleString()}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                            <tfoot className="bg-green-50 font-semibold">
                              <tr><td colSpan={4} className="px-3 py-2 border text-right">GRAND TOTAL:</td><td className="px-3 py-2 border text-right">{calculateTotalSqft(selectedOrderForView.parts).toFixed(2)}</td><td className="px-3 py-2 border text-right">{calculateTotalWeight(selectedOrderForView.parts).toFixed(3)}</td><td className="px-3 py-2 border text-right">-</td><td className="px-3 py-2 border text-right">-</td><td className="px-3 py-2 border text-center">{calculateTotalQty(selectedOrderForView.parts)}</td><td className="px-3 py-2 border text-right">-</td><td className="px-3 py-2 border text-right">Rs {calculateTotalCost(selectedOrderForView.parts).toLocaleString()}</td></tr>
                            </tfoot>
                          </table>
                        </div>
                        {selectedOrderForView.remarks && <div className="bg-gray-50 p-3 rounded"><p className="font-semibold text-sm">REMARKS:</p><p className="text-sm mt-1">{selectedOrderForView.remarks}</p></div>}
                      </div>
                    </div>
                  )}

                  {/* Completion Format View */}
                  {viewFormat === 'completion' && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b">
                        <h3 className="font-bold text-lg">COMPLETION REPORT</h3>
                        <p className="text-sm text-gray-600">PRODUCTION STATUS</p>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div><span className="font-semibold">Work Order No:</span> {selectedOrderForView.workOrderNo}</div>
                          <div><span className="font-semibold">Gate Pass No:</span> {selectedOrderForView.gatepassNo}</div>
                          <div><span className="font-semibold">Date Issued:</span> {formatDateTime(selectedOrderForView.dateIssued)}</div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                              <tr><th className="px-3 py-2 border text-left">S.No</th><th className="px-3 py-2 border text-left">Part Name</th><th className="px-3 py-2 border text-left">Part No</th><th className="px-3 py-2 border text-left">Dimensions</th><th className="px-3 py-2 border text-right">SQFT</th><th className="px-3 py-2 border text-right">Weight/Piece</th><th className="px-3 py-2 border text-right">Total SQFT</th><th className="px-3 py-2 border text-right">Total Weight</th><th className="px-3 py-2 border text-right">Qty</th><th className="px-3 py-2 border text-right">Completed</th><th className="px-3 py-2 border text-right">Remaining</th><th className="px-3 py-2 border text-center">Status ✓</th></tr>
                            </thead>
                            <tbody>
                              {selectedOrderForView.parts.map((part, idx) => {
                                const totalPartWeight = (part.weight || 0) * part.qty
                                const totalPartSqft = (part.blankSizeSqft || 0) * part.qty
                                const isCompleted = (part.completedQty || 0) >= part.qty
                                const dimensionDisplay = getPrintDimensionDisplay(part)
                                return (
                                  <tr key={idx} className={`hover:bg-gray-50 ${isCompleted ? 'bg-green-50' : ''}`}>
                                    <td className="px-3 py-2 border text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border">{part.partName}</td>
                                    <td className="px-3 py-2 border">{part.partNo}</td>
                                    <td className="px-3 py-2 border text-center">{dimensionDisplay}</td>
                                    <td className="px-3 py-2 border text-right">{(part.blankSizeSqft || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 border text-right">{(part.weight || 0).toFixed(3)}</td>
                                    <td className="px-3 py-2 border text-right">{totalPartSqft.toFixed(2)}</td>
                                    <td className="px-3 py-2 border text-right">{totalPartWeight.toFixed(3)}</td>
                                    <td className="px-3 py-2 border text-center">{part.qty}</td>
                                    <td className="px-3 py-2 border text-center text-green-600">{part.completedQty || 0}</td>
                                    <td className="px-3 py-2 border text-center text-orange-600">{part.remainingQty || part.qty}</td>
                                    <td className="px-3 py-2 border text-center text-xl">{isCompleted ? '✓' : '□'}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                            <tfoot className="bg-yellow-50 font-semibold">
                              <tr><td colSpan={4} className="px-3 py-2 border text-right">GRAND TOTAL:</td><td className="px-3 py-2 border text-right">{calculateTotalSqft(selectedOrderForView.parts).toFixed(2)}</td><td className="px-3 py-2 border text-right">{calculateTotalWeight(selectedOrderForView.parts).toFixed(3)}</td><td className="px-3 py-2 border text-right">-</td><td className="px-3 py-2 border text-right">-</td><td className="px-3 py-2 border text-center">{calculateTotalQty(selectedOrderForView.parts)}</td><td className="px-3 py-2 border text-center">{calculateTotalCompletedQty(selectedOrderForView.parts)}</td><td className="px-3 py-2 border text-center">{calculateTotalQty(selectedOrderForView.parts) - calculateTotalCompletedQty(selectedOrderForView.parts)}</td><td className="px-3 py-2 border text-center"></td></tr>
                            </tfoot>
                          </table>
                        </div>
                        {selectedOrderForView.remarks && <div className="bg-gray-50 p-3 rounded"><p className="font-semibold text-sm">REMARKS:</p><p className="text-sm mt-1">{selectedOrderForView.remarks}</p></div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                  <button onClick={() => setViewModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Close</button>
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
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <button onClick={() => handlePrintFloorFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition"><div className="font-semibold text-gray-800">🏭 Floor Format</div><div className="text-sm text-gray-500 mt-1">Production task view - Clean layout with no cost columns</div></button>
                  <button onClick={() => handlePrintCommercialFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition"><div className="font-semibold text-gray-800">💰 Commercial Format</div><div className="text-sm text-gray-500 mt-1">Complete commercial view with all cost columns</div></button>
                  <button onClick={() => handlePrintCompletionFormat(selectedOrderForPrint)} className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition"><div className="font-semibold text-gray-800">✅ Completion Format</div><div className="text-sm text-gray-500 mt-1">Status report with tick marks for completed items</div></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Work Order Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); setEditingItem(null); }}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>{isEditModalOpen ? 'Edit Work Order' : 'Create New Work Order'}</h2>
                  <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={isEditModalOpen ? handleEditSubmit : handleSubmit} className="p-6 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Work Order Number <span className="text-red-500">*</span></label><input type="text" name="workOrderNo" value={formData.workOrderNo} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" placeholder="e.g., WO-2024-001" /></div>
                      <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Gate Pass Number <span className="text-red-500">*</span></label><input type="text" name="gatepassNo" value={formData.gatepassNo} onChange={handleChange} required readOnly={!isEditModalOpen} className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${!isEditModalOpen ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="Auto-generated" />{!isEditModalOpen && <p className="text-xs text-gray-500 mt-1">Gate pass number is auto-generated</p>}</div>
                      <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Date Issued <span className="text-red-500">*</span></label><input type="datetime-local" name="dateIssued" value={formData.dateIssued} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" /></div>
                      <div><label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Remarks</label><textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" placeholder="Additional notes..." /></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-lg font-semibold text-gray-800 ${dmSans.className}`}>Parts List</h3>
                      <div className="flex gap-2">
                        {isEditModalOpen && <button type="button" onClick={completeAllParts} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition">✓ Complete Order</button>}
                        {!isEditModalOpen && <button type="button" onClick={() => openPartSelection()} className="px-3 py-1.5 text-sm bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition">+ Add Part from Store</button>}
                      </div>
                    </div>
                    {formData.parts.length === 0 ? <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">No parts added yet. Click &quot;Add Part from Store&quot; to add items.</div> : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100"><tr><th className="px-3 py-2 text-left">Part #</th><th className="px-3 py-2 text-left">Part Name</th><th className="px-3 py-2 text-left">Dimensions (mm)</th><th className="px-3 py-2 text-right">SQFT</th><th className="px-3 py-2 text-right">Weight(kg)</th><th className="px-3 py-2 text-right">Total SQFT</th><th className="px-3 py-2 text-right">Total Weight(kg)</th><th className="px-3 py-2 text-left">Material/Gauge</th><th className="px-3 py-2 text-right">Sheet Cost/Piece</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Completed</th><th className="px-3 py-2 text-right">Remaining</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-center">Actions</th></tr></thead>
                          <tbody className="divide-y">
                            {formData.parts.map((part, idx) => {
                              const totalPartWeight = (part.weight || 0) * part.qty
                              const totalPartSqft = (part.blankSizeSqft || 0) * part.qty
                              const dimensionDisplay = getDimensionDisplay(part)
                              return (<tr key={idx} className="hover:bg-gray-50"><td className="px-3 py-2 font-mono text-xs">{part.partNo}</td><td className="px-3 py-2 font-medium">{part.partName}</td><td className="px-3 py-2 text-xs">{dimensionDisplay}</td><td className="px-3 py-2 text-right">{part.blankSizeSqft || 0}</td><td className="px-3 py-2 text-right">{(part.weight || 0).toFixed(3)}</td><td className="px-3 py-2 text-right">{totalPartSqft.toFixed(2)}</td><td className="px-3 py-2 text-right">{totalPartWeight.toFixed(3)}</td><td className="px-3 py-2">{part.material}/{part.gauge}</td><td className="px-3 py-2 text-right">Rs {part.sheetCost.toLocaleString()}</td><td className="px-3 py-2 text-right">{part.qty}</td><td className="px-3 py-2 text-right text-green-600">{part.completedQty || 0}</td><td className="px-3 py-2 text-right text-orange-600">{part.remainingQty || part.qty}</td><td className="px-3 py-2 text-right font-medium">Rs {(part.sheetCost * part.qty).toLocaleString()}</td><td className="px-3 py-2 text-center space-x-2">{isEditModalOpen ? <button type="button" onClick={() => openEditPartModal(part, idx)} className="text-green-600 hover:text-green-800 text-xs">Update Completion</button> : <><button type="button" onClick={() => openPartSelection(idx)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button><button type="button" onClick={() => removePart(idx)} className="text-red-600 hover:text-red-800 text-xs">Remove</button></>}</td></tr>)
                            })}
                            <tr className="bg-gray-100 font-semibold"><td colSpan={3} className="px-3 py-2 text-right">Totals:</td><td className="px-3 py-2 text-right">{formData.parts.reduce((sum, p) => sum + (p.blankSizeSqft || 0), 0).toFixed(2)}</td><td className="px-3 py-2 text-right">{formData.parts.reduce((sum, p) => sum + (p.weight || 0), 0).toFixed(3)}</td><td className="px-3 py-2 text-right">{formData.parts.reduce((sum, p) => sum + ((p.blankSizeSqft || 0) * p.qty), 0).toFixed(2)}</td><td className="px-3 py-2 text-right">{formData.parts.reduce((sum, p) => sum + ((p.weight || 0) * p.qty), 0).toFixed(3)}</td><td className="px-3 py-2"></td><td className="px-3 py-2 text-right"></td><td className="px-3 py-2 text-right">{formData.parts.reduce((sum, p) => sum + p.qty, 0)}</td><td className="px-3 py-2 text-right text-green-600">{formData.parts.reduce((sum, p) => sum + (p.completedQty || 0), 0)}</td><td className="px-3 py-2 text-right text-orange-600">{formData.parts.reduce((sum, p) => sum + (p.remainingQty || p.qty), 0)}</td><td className="px-3 py-2 text-right">Rs {formData.parts.reduce((sum, p) => sum + (p.sheetCost * p.qty), 0).toLocaleString()}</td><td className="px-3 py-2"></td></tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-white py-4 border-t">
                    <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); setEditingItem(null); }} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] transition disabled:opacity-50">{isSubmitting ? (isEditModalOpen ? 'Updating...' : 'Creating...') : (isEditModalOpen ? 'Update Work Order' : 'Create Work Order')}</button>
                  </div>
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
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Part Name</p><p className="font-medium text-gray-800">{editingPart.partName}</p><p className="text-sm text-gray-600 mt-2">Part Number</p><p className="font-mono text-sm text-gray-800">{editingPart.partNo}</p><p className="text-sm text-gray-600 mt-2">Dimensions</p><p className="text-sm text-gray-800">{getDimensionDisplay(editingPart)}</p><p className="text-sm text-gray-600 mt-2">SQFT / Weight per Piece</p><p className="text-sm text-gray-800">{editingPart.blankSizeSqft || 0} sqft / {(editingPart.weight || 0).toFixed(3)} kg</p><p className="text-sm text-gray-600 mt-2">Total Quantity Required</p><p className="font-semibold text-gray-800">{editingPart.qty} units</p><p className="text-sm text-gray-600 mt-2">Currently Completed</p><p className="font-semibold text-green-600">{editingPart.completedQty || 0} units</p><p className="text-sm text-gray-600 mt-2">Remaining</p><p className="font-semibold text-orange-600">{editingPart.remainingQty || editingPart.qty} units</p></div>
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
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center"><h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Select Part from Store Inventory</h2><button onClick={() => { setIsPartModalOpen(false); resetPartSelection(); }} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
                <div className="p-6">
                  <div className="mb-4"><div className="relative"><span className="absolute left-3 top-2.5 text-gray-400"><HiSearch className="w-5 h-5" /></span><input type="text" placeholder="Search by part number, name, category, material..." className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none ${dmSans.className}`} value={partSearchTerm} onChange={(e) => setPartSearchTerm(e.target.value)} /></div></div>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0"><tr><th className="px-3 py-2 text-left">Part #</th><th className="px-3 py-2 text-left">Part Name</th><th className="px-3 py-2 text-left">Dimensions (mm)</th><th className="px-3 py-2 text-right">SQFT/Piece</th><th className="px-3 py-2 text-right">Weight/Piece(kg)</th><th className="px-3 py-2 text-left">Material/Gauge</th><th className="px-3 py-2 text-right">Stock</th><th className="px-3 py-2 text-right">Sheet Cost/Piece</th><th className="px-3 py-2 text-center">Action</th></tr></thead>
                      <tbody className="divide-y">
                        {filteredStoreItems.length === 0 ? <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-500">No parts found in store</td></tr> : filteredStoreItems.map((item) => { const dimensionDisplay = `${item.blankWidthMM || 0}mm x ${item.blankLengthMM || 0}mm`; const stockStatus = item.stockInStore <= 0 ? 'Out of Stock' : `${item.stockInStore} ${item.unitOfMeasure}`; const stockColor = item.stockInStore <= 0 ? 'text-red-600' : 'text-green-600'; return (<tr key={item._id} className="hover:bg-gray-50"><td className="px-3 py-2 font-mono text-xs">{item.partNumber}</td><td className="px-3 py-2 font-medium">{item.partName}</td><td className="px-3 py-2 text-xs">{dimensionDisplay}</td><td className="px-3 py-2 text-right">{item.sqft || 0}</td><td className="px-3 py-2 text-right">{(item.weight || 0).toFixed(3)}</td><td className="px-3 py-2">{item.material}/{item.gauge}</td><td className="px-3 py-2 text-right"><span className={stockColor}>{stockStatus}</span></td><td className="px-3 py-2 text-right"><span className="font-medium text-[#8B5E3C]">Rs {item.sheetCostPerPiece?.toLocaleString() || '0'}</span></td><td className="px-3 py-2 text-center">{selectedStoreItem?._id === item._id ? <div className="flex items-center gap-2"><input type="number" value={partQuantity} onChange={(e) => setPartQuantity(Number(e.target.value))} className="w-20 px-2 py-1 border rounded text-sm text-center" min="1" /><button onClick={addPartToWorkOrder} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Add</button></div> : <button onClick={() => selectStoreItem(item)} className="px-3 py-1 text-xs rounded-md transition bg-[#8B5E3C] text-white hover:bg-[#6d4a2f]">Select</button>}</td></tr>) })}
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