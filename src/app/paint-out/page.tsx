'use client'

import { useState, useEffect } from 'react'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Mechanical/Components/sidebar'
import ProtectedRoute from "@/app/Components/ProtectedRoute";
import { HiSearch, HiX, HiPrinter } from 'react-icons/hi'
import toast, { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

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
  sheetCost: number
  gauge: string
  material: string
  qty: number
  remainingQty?: number
  completedQty?: number
  storeItemId?: string
  inwardPartId?: string
}

interface ExtendedPartItem extends PartItem {
  originalQty?: number
  receivedQty?: number
}

// Paint Inward Part interface with received and remaining
interface PaintInwardPart {
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
  gauge: string
  material: string
  qty: number
  receivedQty?: number
  remainingQty?: number
  _key?: string
  storeItemId: string
}

interface PaintInwardOp {
  _id: string
  workOrderNo: string
  gatepassNo: string
  inwardChallanNo?: string
  dateIssued: string
  remarks?: string
  parts: PaintInwardPart[]
}

interface PaintOutwardOp {
  _id: string
  _createdAt: string
  workOrderNo: string
  gatepassNo: string
  inwardChallanNo?: string
  dateIssued: string
  remarks?: string
  total?: number
  parts: PartItem[]
}

interface FormData {
  workOrderNo: string
  gatepassNo: string
  inwardChallanNo: string
  dateIssued: string
  remarks: string
  parts: ExtendedPartItem[]
  selectedInwardId?: string
}

// Helper function to convert inches to mm
const inchesToMM = (inches: number): number => {
  return Number((inches * 25.4).toFixed(1))
}

// Helper function to get dimension display in mm
const getDimensionDisplay = (item: Partial<PartItem>) => {
  if (item.blankWidthMM && item.blankLengthMM && item.blankWidthMM > 0 && item.blankLengthMM > 0) {
    return `${item.blankWidthMM}mm x ${item.blankLengthMM}mm`
  }
  const width = item.blankWidthInch || item.blankWidth || 0
  const length = item.blankLengthInch || item.blankLength || 0
  return `${inchesToMM(width)}mm x ${inchesToMM(length)}mm`
}

export default function PaintOutwardOpList() {
  const [paintOutwardOps, setPaintOutwardOps] = useState<PaintOutwardOp[]>([])
  const [paintInwardOps, setPaintInwardOps] = useState<PaintInwardOp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PaintOutwardOp | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false)
  const [inwardSearchTerm, setInwardSearchTerm] = useState('')
  const [isLoadingInward, setIsLoadingInward] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    workOrderNo: '',
    gatepassNo: '',
    inwardChallanNo: '',
    dateIssued: '',
    remarks: '',
    parts: [],
    selectedInwardId: ''
  })

  const generateGatepassNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `P-OUT-${year}${month}${day}-${random}`
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await fetchPaintOutwardOps()
      await fetchPaintInwardOps()
      setIsLoading(false)
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

  const calculateTotalQty = (parts: PartItem[]) => {
    if (!parts || parts.length === 0) return 0
    return parts.reduce((total, part) => total + (part.qty || 0), 0)
  }

  const calculateTotalSqft = (parts: PartItem[]) => {
    if (!parts || parts.length === 0) return 0
    return parts.reduce((total, part) => total + ((part.blankSizeSqft || 0) * (part.qty || 0)), 0)
  }

  const filteredItems = paintOutwardOps.filter(item => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      (item.workOrderNo?.toLowerCase() || '').includes(searchLower) ||
      (item.gatepassNo?.toLowerCase() || '').includes(searchLower) ||
      (item.inwardChallanNo?.toLowerCase() || '').includes(searchLower) ||
      item.parts?.some(part => 
        part.partNo?.toLowerCase().includes(searchLower) ||
        part.partName?.toLowerCase().includes(searchLower)
      )
    )
  })

  const filteredInwardOps = paintInwardOps.filter(item => {
    if (!inwardSearchTerm) return true
    const searchLower = inwardSearchTerm.toLowerCase()
    return (
      (item.workOrderNo?.toLowerCase() || '').includes(searchLower) ||
      (item.gatepassNo?.toLowerCase() || '').includes(searchLower) ||
      (item.inwardChallanNo?.toLowerCase() || '').includes(searchLower) ||
      item.parts?.some(part => 
        part.partNo?.toLowerCase().includes(searchLower) ||
        part.partName?.toLowerCase().includes(searchLower)
      )
    )
  })

  const handlePrintOutward = (order: PaintOutwardOp) => {
    setTimeout(() => {
      const totalQty = calculateTotalQty(order.parts)
      const totalSqft = calculateTotalSqft(order.parts)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Paint Outward - ${order.workOrderNo}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
                * {
                  font-family: 'DM Sans', sans-serif !important;
                  letter-spacing: 0.05em;
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  margin: 0; 
                  padding: 8px; 
                  color: #000;
                  background: white;
                  font-size: 12px;
                  line-height: 1.2;
                }
                .print-container { 
                  max-width: 1100px; 
                  margin: 0 auto;
                  border: 1px solid #000;
                  display: flex;
                  flex-direction: column;
                  min-height: 95vh;
                }
                .header-section {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  padding: 5px 15px 10px 15px;
                  border-bottom: 2px solid #000;
                  background: #fff;
                }
                .logo-section {
                  flex: 1;
                  margin-top: -3px;
                }
                .logo-placeholder {
                  width: 250px;
                  height: 100px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 11px;
                  color: #000;
                  background: #fff;
                  font-weight: 600;
                  text-transform: uppercase;
                }
                .logo-img {
                  width: 250px;
                  height: 100px;
                  object-fit: contain;
                }
                .title-section {
                  flex: 2;
                  text-align: right;
                  margin-top: -3px;
                }
                .main-title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 2px;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                }
                .challan-type {
                  font-size: 16px;
                  font-weight: bold;
                  margin-top: 3px;
                  padding: 4px 12px;
                  border: 2px solid #000;
                  display: inline-block;
                  text-transform: uppercase;
                }
                .info-section {
                  padding: 8px 15px;
                  border-bottom: 1px solid #000;
                }
                .info-table {
                  width: 100%;
                  border-collapse: collapse;
                }
                .info-table td {
                  padding: 3px 8px;
                  vertical-align: top;
                }
                .info-label {
                  font-weight: bold;
                  white-space: nowrap;
                }
                .data-table {
                  width: 100%;
                  border-collapse: collapse;
                  border: 1px solid #000;
                  font-size: 10px;
                  margin-top: 10px;
                  margin-bottom: 0;
                }
                .data-table th {
                  background: #f0f0f0;
                  padding: 6px 4px;
                  text-align: center;
                  font-weight: bold;
                  border: 1px solid #000;
                }
                .data-table td {
                  padding: 4px 4px;
                  border: 1px solid #000;
                  vertical-align: top;
                }
                .center-cell { text-align: center; }
                .numeric-cell { text-align: right; }
                .total-row { background: #e8f5e8 !important; font-weight: bold; }
                .remarks-section { padding: 8px 15px; margin: 5px 15px; }
                .remarks-label { font-weight: bold; font-size: 11px; }
                .remarks-text { font-size: 11px; margin-top: 3px; line-height: 1.3; }
                .content-wrapper { flex: 1; }
                .signature-section { 
                  padding: 10px 15px 5px 15px; 
                  margin-top: auto; 
                  border-top: 1px solid #000; 
                }
                .signature-grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr 1fr 1fr; 
                  gap: 12px; 
                  margin-top: 5px; 
                }
                .signature-line { 
                  border-top: 1px solid #000; 
                  margin-top: 20px; 
                  padding-top: 3px; 
                }
                .signature-label { 
                  font-weight: bold; 
                  text-align: center; 
                  font-size: 11px; 
                }
                .datetime-footer { 
                  text-align: left; 
                  padding: 5px 15px; 
                  border-top: 1px solid #000; 
                  background: #f9f9f9; 
                  font-size: 11px; 
                  font-weight: bold; 
                }
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
                      <img src="${window.location.origin}/logo.png" alt="Company Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='COMPANY LOGO';">
                    </div>
                  </div>
                  <div class="title-section">
                    <div class="main-title">PAINT OUTWARD</div>
                    <div class="challan-type">WORK ORDER</div>
                  </div>
                </div>

                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table">
                      <tbody>
                        <tr>
                          <td class="info-label">M/S Qadri Spray Tech</td>
                          <td></td>
                          <td class="info-label">Work Order No:</td>            
                          <td>${order.workOrderNo}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td class="info-label">Gate Pass No:</td>
                          <td>${order.gatepassNo}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td class="info-label">Inward Challan No:</td>
                          <td>${order.inwardChallanNo || '-'}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td class="info-label">Date Issued:</td>
                          <td>${formatDateTime(order.dateIssued)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style="overflow-x: auto;">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Part Name</th>
                          <th>Part No</th>
                          <th>Material/Gauge</th>
                          <th>Dimensions (mm)</th>
                          <th>SQFT</th>
                          <th>Total SQFT</th>
                          <th>Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${order.parts.map((part, idx) => {
                          const totalSqftForPart = (part.blankSizeSqft || 0) * part.qty
                          const dimensionDisplay = getDimensionDisplay(part)
                          return `
                            <tr>
                              <td class="center-cell">${idx + 1}</td>
                              <td>${part.partName}</td>
                              <td>${part.partNo}</td>
                              <td>${part.material}/${part.gauge}</td>
                              <td class="center-cell">${dimensionDisplay}</td>
                              <td class="numeric-cell">${part.blankSizeSqft || 0}</td>
                              <td class="numeric-cell">${totalSqftForPart.toFixed(2)}</td>
                              <td class="center-cell">${part.qty}</td>
                            </tr>
                          `
                        }).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="5" class="numeric-cell">GRAND TOTAL:</td>
                          <td class="numeric-cell">${totalSqft.toFixed(2)}</td>
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
                    <div><div class="signature-line"></div><div class="signature-label">Painting Dept.</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Received By</div></div>
                  </div>
                </div>

                <div class="datetime-footer">
                  Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
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

  const fetchPaintInwardOps = async () => {
    try {
      setIsLoadingInward(true)
      const inwardResponse = await fetch('/api/paint-in-opr')
      
      if (!inwardResponse.ok) {
        throw new Error(`HTTP error! status: ${inwardResponse.status}`)
      }
      
      const inwardResult = await inwardResponse.json()
      
      let inwardData = []
      if (inwardResult.success && inwardResult.data) {
        inwardData = inwardResult.data
      } else if (Array.isArray(inwardResult)) {
        inwardData = inwardResult
      } else {
        inwardData = []
      }
      
      // Process inward data to ensure receivedQty, remainingQty, and mm dimensions are set
      const processedInwardData = inwardData.map((item: PaintInwardOp) => ({
        ...item,
        parts: item.parts.map((part: PaintInwardPart) => ({
          ...part,
          receivedQty: part.receivedQty || 0,
          remainingQty: part.remainingQty !== undefined ? part.remainingQty : part.qty - (part.receivedQty || 0),
          blankWidthMM: part.blankWidthMM || 0,
          blankLengthMM: part.blankLengthMM || 0,
          blankWidthInch: part.blankWidthInch || part.blankWidth || 0,
          blankLengthInch: part.blankLengthInch || part.blankLength || 0,
          blankWidth: part.blankWidthInch || part.blankWidth || 0,
          blankLength: part.blankLengthInch || part.blankLength || 0
        }))
      }))
      
      console.log('Processed inward data - sample part:', processedInwardData[0]?.parts[0])
      
      setPaintInwardOps(processedInwardData)
    } catch (err) {
      console.error('Failed to fetch paint inward operations:', err)
      toast.error('Failed to load paint inward operations')
    } finally {
      setIsLoadingInward(false)
    }
  }

  const fetchPaintOutwardOps = async () => {
    try {
      const outwardResponse = await fetch('/api/paint-out-opr')
      
      if (!outwardResponse.ok) {
        throw new Error(`HTTP error! status: ${outwardResponse.status}`)
      }
      
      const outwardResult = await outwardResponse.json()
      
      let outwardData = []
      if (outwardResult.success && outwardResult.data) {
        outwardData = outwardResult.data
      } else if (Array.isArray(outwardResult)) {
        outwardData = outwardResult
      } else {
        outwardData = []
      }
      
      setPaintOutwardOps(outwardData)
    } catch (err) {
      console.error('Failed to fetch paint outward operations:', err)
      toast.error('Failed to load paint outward operations')
    }
  }

  const handleDelete = async (id: string) => {
    const item = paintOutwardOps.find(item => item._id === id)
    const workOrderNo = item?.workOrderNo || 'this item'
    
    toast.custom((t) => (
      <div className={`bg-white p-6 rounded-lg shadow-xl border border-gray-200 max-w-md ${dmSans.className}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete Paint Outward Operation <span className="font-semibold">{workOrderNo}</span>? 
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                setDeletingId(id)
                const res = await fetch(`/api/paint-out-opr?id=${id}`, {
                  method: 'DELETE',
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to delete')
                setPaintOutwardOps(prev => prev.filter(item => item._id !== id))
                toast.success(`Paint Outward Operation ${workOrderNo} deleted successfully!`, { duration: 4000 })
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to delete')
              } finally {
                setDeletingId(null)
              }
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
          >
            Delete
          </button>
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
      inwardChallanNo: '',
      dateIssued: new Date().toISOString().slice(0, 16),
      remarks: '',
      parts: [],
      selectedInwardId: ''
    })
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (item: PaintOutwardOp) => {
    setEditingItem(item)
    setFormData({
      workOrderNo: item.workOrderNo,
      gatepassNo: item.gatepassNo,
      inwardChallanNo: item.inwardChallanNo || '',
      dateIssued: item.dateIssued,
      remarks: item.remarks || '',
      parts: item.parts.map(part => ({
        ...part,
        originalQty: part.qty
      })),
      selectedInwardId: ''
    })
    setIsEditModalOpen(true)
  }

  // Select Paint Inward Operation and load its parts with received/remaining info
  const selectPaintInwardOp = (item: PaintInwardOp) => {
    if (!item.parts || item.parts.length === 0) {
      toast.error('This paint inward operation has no parts')
      return
    }
    
    // Calculate totals for display
    const totalInwardQty = item.parts.reduce((sum, p) => sum + p.qty, 0)
    const totalReceivedQty = item.parts.reduce((sum, p) => sum + (p.receivedQty || 0), 0)
    const totalRemainingQty = totalInwardQty - totalReceivedQty
    
    if (totalRemainingQty <= 0) {
      toast.error('All parts in this inward operation have been fully received')
      return
    }
    
    // Map inward parts to outward parts with remaining quantities and mm dimensions
    const outwardParts = item.parts.map(part => {
      const remainingQty = part.remainingQty !== undefined && part.remainingQty > 0 
        ? part.remainingQty 
        : part.qty - (part.receivedQty || 0)
      
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
        blankSizeSqft: part.blankSizeSqft || 0,
        sheetCost: part.sheetCost || 0,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: remainingQty,
        remainingQty: remainingQty,
        completedQty: 0,
        originalQty: remainingQty,
        inwardPartId: part._key,
        storeItemId: part.storeItemId,
        receivedQty: 0  // Start with 0 received for this outward operation
      }
    })
    
    setFormData({
      workOrderNo: item.workOrderNo,
      gatepassNo: generateGatepassNumber(),
      inwardChallanNo: item.inwardChallanNo || '',
      dateIssued: new Date().toISOString().slice(0, 16),
      remarks: item.remarks || '',
      parts: outwardParts,
      selectedInwardId: item._id
    })
    
    setIsInwardModalOpen(false)
    setInwardSearchTerm('')
    toast.success(`Paint inward operation "${item.workOrderNo}" loaded! Remaining quantity: ${totalRemainingQty}`)
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

    // Prepare the parts for submission: use receivedQty as outward quantity
    const cleanParts = formData.parts.map(({ originalQty: _originalQty, ...part }) => ({
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
      blankSizeSqft: part.blankSizeSqft || 0,
      sheetCost: part.sheetCost || 0,
      gauge: part.gauge || '',
      material: part.material || '',
      qty: part.receivedQty || 0,
      remainingQty: part.remainingQty,
      completedQty: part.completedQty,
      inwardPartId: part.inwardPartId,
      storeItemId: part.storeItemId,
      receivedQty: part.receivedQty || 0
    }))

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/paint-out-opr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workOrderNo: formData.workOrderNo,
          gatepassNo: formData.gatepassNo,
          inwardChallanNo: formData.inwardChallanNo,
          dateIssued: formData.dateIssued,
          remarks: formData.remarks,
          parts: cleanParts,
          inwardOrderId: formData.selectedInwardId
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add')
      }

      await fetchPaintOutwardOps()
      await fetchPaintInwardOps()
      
      toast.success('Paint outward operation created successfully!')
      setIsAddModalOpen(false)
      resetForm()
      
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add')
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

    const cleanParts = formData.parts.map(({ originalQty: _originalQty, receivedQty: _receivedQty, ...part }) => ({
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
      blankSizeSqft: part.blankSizeSqft || 0,
      sheetCost: part.sheetCost || 0,
      gauge: part.gauge || '',
      material: part.material || '',
      qty: part.qty,
      remainingQty: part.remainingQty || part.qty,
      completedQty: part.completedQty || 0,
      storeItemId: part.storeItemId
    }))

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/paint-out-opr', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem?._id,
          workOrderNo: formData.workOrderNo,
          gatepassNo: formData.gatepassNo,
          inwardChallanNo: formData.inwardChallanNo,
          dateIssued: formData.dateIssued,
          remarks: formData.remarks,
          parts: cleanParts
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update')
      }

      await fetchPaintOutwardOps()
      await fetchPaintInwardOps()
      
      toast.success('Paint outward operation updated successfully!')
      setIsEditModalOpen(false)
      resetForm()
      setEditingItem(null)
      
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white ${dmSans.className}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedUser='mechanical'>
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Toaster position="top-center" />
      <Sidebar />
      
      <main className={`max-w-7xl mx-auto px-4 py-10 space-y-8 transition-all duration-300 ${
        isAddModalOpen || isEditModalOpen || isInwardModalOpen ? 'blur-sm pointer-events-none' : ''
      }`}>
        
        <div className="flex flex-col gap-6 border-b pb-6">
          <div className="space-y-2">
            <h1 className={`text-2xl sm:text-3xl pt-8 font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
              Paint Outward Operation Management
            </h1>
            <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>
              Manage paint outward operations, gate passes, and track outward quantities
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <HiSearch className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Search by work order, gate pass, inward challan, part number, part name..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none transition ${dmSans.className}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <HiX className="w-5 h-5" />
                </button>
              )}
            </div>
            <button onClick={openAddModal} className="px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition text-sm font-medium">
              + Create Paint Outward
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <p className="text-sm text-gray-500">Total Outward Ops</p>
            <p className="text-2xl font-bold text-gray-800">{paintOutwardOps.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <p className="text-sm text-gray-500">Total Outward Qty</p>
            <p className="text-2xl font-bold text-gray-800">
              {paintOutwardOps.reduce((sum, op) => sum + calculateTotalQty(op.parts), 0)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <p className="text-sm text-gray-500">Total SQFT Outward</p>
            <p className="text-2xl font-bold text-[#8B5E3C]">
              {paintOutwardOps.reduce((sum, op) => sum + calculateTotalSqft(op.parts), 0).toFixed(2)} sqft
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{paintOutwardOps.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <table className={`w-full table-auto divide-y divide-gray-200 ${dmSans.className}`}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Work Order #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gate Pass #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Inward Challan #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date Issued</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Parts</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total SQFT</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No paint outward operations found</td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.workOrderNo || '-'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{item.gatepassNo || '-'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{item.inwardChallanNo || '-'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(item.dateIssued)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="space-y-1">
                          {item.parts && item.parts.slice(0, 2).map((part, idx) => (
                            <div key={idx} className="text-xs">{part.partName}</div>
                          ))}
                          {item.parts && item.parts.length > 2 && <div className="text-xs text-gray-500">+{item.parts.length - 2} more</div>}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{calculateTotalQty(item.parts)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{calculateTotalSqft(item.parts).toFixed(2)} sqft</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm space-x-3">
                        <button onClick={() => handlePrintOutward(item)} className="text-blue-600 hover:text-blue-800 font-medium">
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
        </div>
      </main>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
            setIsAddModalOpen(false)
            resetForm()
          }}></div>
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
                  Create New Paint Outward Operation
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      fetchPaintInwardOps()
                      setIsInwardModalOpen(true)
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Load from Paint Inward
                  </button>
                  <button onClick={() => {
                    setIsAddModalOpen(false)
                    resetForm()
                  }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Basic Information</h3>
                  
                  {formData.selectedInwardId && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">Inward Order Summary</p>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <p className="text-gray-500">Total Inward Qty</p>
                          <p className="font-semibold">{formData.parts.reduce((sum, p) => sum + (p.originalQty || p.qty), 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Received Qty</p>
                          <p className="font-semibold text-green-600">{formData.parts.reduce((sum, p) => sum + (p.receivedQty || 0), 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Remaining Qty</p>
                          <p className="font-semibold text-orange-600">{formData.parts.reduce((sum, p) => sum + ((p.originalQty || p.qty) - (p.receivedQty || 0)), 0)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                        Work Order Number <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="workOrderNo" value={formData.workOrderNo} onChange={handleChange} required 
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed" placeholder="Auto-loaded from inward" readOnly />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                        Gate Pass Number <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="gatepassNo" value={formData.gatepassNo} onChange={handleChange} required readOnly
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed" />
                      <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                        Inward Challan Number
                      </label>
                      <input type="text" name="inwardChallanNo" value={formData.inwardChallanNo} onChange={handleChange} readOnly
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                        Date Issued <span className="text-red-500">*</span>
                      </label>
                      <input type="datetime-local" name="dateIssued" value={formData.dateIssued} onChange={handleChange} required
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Remarks</label>
                      <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold text-gray-800 ${dmSans.className}`}>Parts List</h3>
                  </div>

                  {formData.parts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      No parts loaded. Click &quot;Load from Paint Inward&quot; to load parts.
                    </div>
                  ) : (
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
                            <th className="px-3 py-2 text-right">Inward Qty</th>
                            <th className="px-3 py-2 text-right">Received</th>
                            <th className="px-3 py-2 text-right">Remaining</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {formData.parts.map((part, idx) => {
                            const totalSqftForPart = (part.blankSizeSqft || 0) * (part.receivedQty || 0)
                            const inwardQty = part.originalQty || part.qty
                            const receivedQty = part.receivedQty || 0
                            const remainingQty = inwardQty - receivedQty
                            const dimensionDisplay = getDimensionDisplay(part)
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2">{part.partNo}</td>
                                <td className="px-3 py-2 font-medium">{part.partName}</td>
                                <td className="px-3 py-2">{part.material}/{part.gauge}</td>
                                <td className="px-3 py-2">{dimensionDisplay}</td>
                                <td className="px-3 py-2 text-right">{part.blankSizeSqft || 0}</td>
                                <td className="px-3 py-2 text-right">{totalSqftForPart.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right">{inwardQty}</td>
                                <td className="px-3 py-2 text-right">
                                  <div className="flex items-center gap-1 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newReceived = Math.max(0, receivedQty - 1)
                                        const updatedParts = [...formData.parts]
                                        updatedParts[idx] = {
                                          ...updatedParts[idx],
                                          receivedQty: newReceived,
                                          remainingQty: inwardQty - newReceived,
                                        }
                                        setFormData(prev => ({ ...prev, parts: updatedParts }))
                                      }}
                                      disabled={receivedQty <= 0}
                                      className={`px-2 py-1 text-sm rounded-md transition ${
                                        receivedQty > 0
                                          ? 'bg-red-500 text-white hover:bg-red-600'
                                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      -
                                    </button>
                                    <span className="w-10 text-center font-medium">{receivedQty}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newReceived = Math.min(inwardQty, receivedQty + 1)
                                        const updatedParts = [...formData.parts]
                                        updatedParts[idx] = {
                                          ...updatedParts[idx],
                                          receivedQty: newReceived,
                                          remainingQty: inwardQty - newReceived,
                                        }
                                        setFormData(prev => ({ ...prev, parts: updatedParts }))
                                      }}
                                      disabled={receivedQty >= inwardQty}
                                      className={`px-2 py-1 text-sm rounded-md transition ${
                                        receivedQty < inwardQty
                                          ? 'bg-green-500 text-white hover:bg-green-600'
                                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-right text-orange-600">{remainingQty}</td>
                                <td className="px-3 py-2 text-center">
                                  <button type="button" onClick={() => removePart(idx)} className="text-red-600 hover:text-red-800 text-xs">
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                          <tr className="bg-gray-100 font-semibold">
                            <td colSpan={6} className="px-3 py-2 text-right">Grand Total:</td>
                            <td className="px-3 py-2 text-right">{formData.parts.reduce((sum, p) => sum + (p.originalQty || p.qty), 0)}</td>
                            <td className="px-3 py-2 text-right text-green-600">{formData.parts.reduce((sum, p) => sum + (p.receivedQty || 0), 0)}</td>
                            <td className="px-3 py-2 text-right text-orange-600">{formData.parts.reduce((sum, p) => sum + ((p.originalQty || p.qty) - (p.receivedQty || 0)), 0)}</td>
                            <td className="px-3 py-2"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button type="button" onClick={() => { setIsAddModalOpen(false); resetForm(); }} 
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] transition disabled:opacity-50">
                    {isSubmitting ? 'Creating...' : 'Create Paint Outward'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
            setIsEditModalOpen(false)
            resetForm()
            setEditingItem(null)
          }}></div>
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Edit Paint Outward Operation</h2>
                <button onClick={() => { setIsEditModalOpen(false); resetForm(); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Work Order Number *</label>
                      <input type="text" name="workOrderNo" value={formData.workOrderNo} onChange={handleChange} required
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Gate Pass Number *</label>
                      <input type="text" name="gatepassNo" value={formData.gatepassNo} onChange={handleChange} required
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Inward Challan Number</label>
                      <input type="text" name="inwardChallanNo" value={formData.inwardChallanNo} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Date Issued *</label>
                      <input type="datetime-local" name="dateIssued" value={formData.dateIssued} onChange={handleChange} required
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Remarks</label>
                      <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold text-gray-800 ${dmSans.className}`}>Parts List</h3>
                  </div>

                  {formData.parts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">No parts added.</div>
                  ) : (
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
                            <th className="px-3 py-2 text-right">Qty</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {formData.parts.map((part, idx) => {
                            const totalSqftForPart = (part.blankSizeSqft || 0) * part.qty
                            const dimensionDisplay = getDimensionDisplay(part)
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2">{part.partNo}</td>
                                <td className="px-3 py-2 font-medium">{part.partName}</td>
                                <td className="px-3 py-2">{part.material}/{part.gauge}</td>
                                <td className="px-3 py-2">{dimensionDisplay}</td>
                                <td className="px-3 py-2 text-right">{part.blankSizeSqft || 0}</td>
                                <td className="px-3 py-2 text-right">{totalSqftForPart.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right">{part.qty}</td>
                                <td className="px-3 py-2 text-center">
                                  <button type="button" onClick={() => removePart(idx)} className="text-red-600 hover:text-red-800 text-xs">Remove</button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button type="button" onClick={() => { setIsEditModalOpen(false); resetForm(); setEditingItem(null); }} 
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] transition disabled:opacity-50">
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Paint Inward Operation Selection Modal */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => {
            setIsInwardModalOpen(false)
            setInwardSearchTerm('')
          }}></div>
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Select Paint Inward Operation</h2>
                <div className="text-sm text-gray-500">Shows operations with remaining quantity</div>
                <button onClick={() => { setIsInwardModalOpen(false); setInwardSearchTerm(''); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400"><HiSearch className="w-5 h-5" /></span>
                    <input type="text" placeholder="Search by work order number, gate pass, inward challan, part name..."
                      className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none ${dmSans.className}`}
                      value={inwardSearchTerm} onChange={(e) => setInwardSearchTerm(e.target.value)} />
                  </div>
                </div>

                {isLoadingInward ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8B5E3C] border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading paint inward operations...</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Work Order #</th>
                          <th className="px-3 py-2 text-left">Gate Pass #</th>
                          <th className="px-3 py-2 text-left">Inward Challan #</th>
                          <th className="px-3 py-2 text-left">Date Issued</th>
                          <th className="px-3 py-2 text-left">Parts</th>
                          <th className="px-3 py-2 text-right">Total Qty</th>
                          <th className="px-3 py-2 text-right">Received</th>
                          <th className="px-3 py-2 text-right">Remaining</th>
                          <th className="px-3 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredInwardOps.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                              {paintInwardOps.length === 0 ? 'No paint inward operations found. Please create one first.' : 'No matching operations found'}
                            </td>
                          </tr>
                        ) : (
                          filteredInwardOps.map((item) => {
                            const totalQty = item.parts?.reduce((sum, p) => sum + p.qty, 0) || 0
                            const receivedQty = item.parts?.reduce((sum, p) => sum + (p.receivedQty || 0), 0) || 0
                            const remainingQty = totalQty - receivedQty
                            const hasRemaining = remainingQty > 0
                            
                            return (
                              <tr key={item._id} className={`hover:bg-gray-50 ${!hasRemaining ? 'opacity-50 bg-gray-50' : ''}`}>
                                <td className="px-3 py-2 font-medium">{item.workOrderNo}</td>
                                <td className="px-3 py-2">{item.gatepassNo}</td>
                                <td className="px-3 py-2">{item.inwardChallanNo || '-'}</td>
                                <td className="px-3 py-2">{formatDateTime(item.dateIssued)}</td>
                                <td className="px-3 py-2">{item.parts?.length || 0} items</td>
                                <td className="px-3 py-2 text-right font-bold">{totalQty}</td>
                                <td className="px-3 py-2 text-right text-green-600 font-bold">{receivedQty}</td>
                                <td className="px-3 py-2 text-right text-orange-600 font-bold">{remainingQty}</td>
                                <td className="px-3 py-2 text-center">
                                  <button onClick={() => hasRemaining && selectPaintInwardOp(item)} disabled={!hasRemaining}
                                    className={`px-3 py-1 text-xs rounded-md transition ${hasRemaining ? 'bg-[#8B5E3C] text-white hover:bg-[#6d4a2f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                                    {hasRemaining ? 'Select' : 'Fully Received'}
                                  </button>
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
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}

export const dynamic = 'force-dynamic'