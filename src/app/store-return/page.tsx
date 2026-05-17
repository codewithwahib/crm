'use client'

import { useState, useEffect } from 'react'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Mechanical/Components/sidebar'
import { HiSearch, HiPrinter, HiPlus, HiRefresh, HiTrash } from 'react-icons/hi'
import ProtectedRoute from "@/app/Components/ProtectedRoute";
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
  blankWidth?: number
  blankLength?: number
  sqft?: number
  weight?: number
  sheetCostPerPiece?: number
  paintCostPerPiece?: number
  stockInStore: number
  minimumStockLevel: number
  unitOfMeasure: string
}

interface ReturnRecord {
  _id: string
  returnNumber: string
  returnDate: string
  partNumber: string
  partName: string
  storeLocation: string
  gauge: string
  material: string
  blankWidthMM: number
  blankLengthMM: number
  returnedQuantity: number
  returnReason: string
  returnedBy: string
  receivedBy: string
  fromDepartment: string
  originalStock: number
  newStock: number
  unitOfMeasure: string
  remarks?: string
  status: string
}

interface StoreAPIResponse {
  _id: string
  partNumber: string
  partName: string
  category: string
  storeLocation: string
  gauge?: string
  material?: string
  blankWidthMM?: number
  blankLengthMM?: number
  blankWidth?: number
  blankLength?: number
  blankWidthInch?: number
  blankLengthInch?: number
  sqft?: number
  weight?: number
  sheetCostPerPiece?: number | string
  paintCostPerPiece?: number | string
  stockInStore?: number
  minimumStockLevel?: number
  unitOfMeasure?: string
}

export default function StoreReturnPage() {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [returnHistory, setReturnHistory] = useState<ReturnRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [partSearchTerm, setPartSearchTerm] = useState('')

  // Form state with all required fields
  const [formData, setFormData] = useState({
    returnNumber: '',
    returnedQuantity: 0,
    returnReason: '',
    returnedBy: '',
    receivedBy: '',
    fromDepartment: '',
    customReason: '',
    remarks: ''
  })

  // Generate return number
  const generateReturnNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `RET-${year}${month}${day}-${hours}${minutes}${seconds}`
  }

  // Fetch store items and return history
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch store items
      const storeResponse = await fetch('/api/store/add-item')
      if (!storeResponse.ok) throw new Error('Failed to fetch store items')
      const storeResult = await storeResponse.json()
      
      const itemsWithData: StoreItem[] = storeResult.map((item: StoreAPIResponse) => ({
        _id: item._id,
        partNumber: item.partNumber,
        partName: item.partName,
        category: item.category,
        storeLocation: item.storeLocation,
        gauge: item.gauge || '',
        material: item.material || '',
        sheetCostPerPiece: typeof item.sheetCostPerPiece === 'string' ? parseFloat(item.sheetCostPerPiece) : item.sheetCostPerPiece,
        paintCostPerPiece: typeof item.paintCostPerPiece === 'string' ? parseFloat(item.paintCostPerPiece) : item.paintCostPerPiece,
        weight: item.weight || 0,
        stockInStore: item.stockInStore || 0,
        minimumStockLevel: item.minimumStockLevel || 0,
        unitOfMeasure: item.unitOfMeasure || 'pcs',
        blankWidthMM: item.blankWidthMM || (item.blankWidthInch ? Math.round(item.blankWidthInch * 25.4) : item.blankWidth || 0),
        blankLengthMM: item.blankLengthMM || (item.blankLengthInch ? Math.round(item.blankLengthInch * 25.4) : item.blankLength || 0)
      }))
      
      setStoreItems(itemsWithData)

      // Fetch return history
      const historyResponse = await fetch('/api/store-return')
      if (historyResponse.ok) {
        const historyResult = await historyResponse.json()
        setReturnHistory(historyResult)
      }
    } catch (err) {
      console.error('Failed to fetch data', err)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter store items for part selection
  const filteredStoreItems = storeItems.filter(item => {
    if (!partSearchTerm) return true
    const searchLower = partSearchTerm.toLowerCase()
    return (
      item.partNumber?.toLowerCase().includes(searchLower) ||
      item.partName?.toLowerCase().includes(searchLower) ||
      item.material?.toLowerCase().includes(searchLower)
    )
  })

  // Filter return history
  const filteredHistory = returnHistory.filter(record => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      record.returnNumber?.toLowerCase().includes(searchLower) ||
      record.partNumber?.toLowerCase().includes(searchLower) ||
      record.partName?.toLowerCase().includes(searchLower) ||
      record.returnedBy?.toLowerCase().includes(searchLower) ||
      record.receivedBy?.toLowerCase().includes(searchLower) ||
      record.fromDepartment?.toLowerCase().includes(searchLower)
    )
  })

  const openModal = () => {
    setSelectedItem(null)
    setFormData({
      returnNumber: generateReturnNumber(),
      returnedQuantity: 0,
      returnReason: '',
      returnedBy: '',
      receivedBy: '',
      fromDepartment: '',
      customReason: '',
      remarks: ''
    })
    setPartSearchTerm('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setFormData({
      returnNumber: '',
      returnedQuantity: 0,
      returnReason: '',
      returnedBy: '',
      receivedBy: '',
      fromDepartment: '',
      customReason: '',
      remarks: ''
    })
    setPartSearchTerm('')
  }

  const selectPart = (item: StoreItem) => {
    setSelectedItem(item)
    setFormData(prev => ({
      ...prev,
      returnedQuantity: 0,
      returnReason: '',
      customReason: '',
      remarks: ''
    }))
  }

  const handleSubmitReturn = async () => {
    if (!selectedItem) {
      toast.error('Please select a part from the store')
      return
    }

    if (formData.returnedQuantity <= 0) {
      toast.error('Please enter a valid return quantity')
      return
    }

    if (!formData.returnedBy.trim()) {
      toast.error('Please enter who is returning the material')
      return
    }

    if (!formData.receivedBy.trim()) {
      toast.error('Please enter who is receiving the material')
      return
    }

    if (!formData.fromDepartment) {
      toast.error('Please select the department')
      return
    }

    if (!formData.returnReason) {
      toast.error('Please select a return reason')
      return
    }

    let finalReason = formData.returnReason
    if (formData.returnReason === 'Other' && !formData.customReason.trim()) {
      toast.error('Please specify the reason')
      return
    }
    if (formData.returnReason === 'Other') {
      finalReason = formData.customReason
    }

    setIsSubmitting(true)

    try {
      const oldStock = selectedItem.stockInStore
      const newStock = oldStock + formData.returnedQuantity

      const returnData = {
        returnNumber: formData.returnNumber,
        returnDate: new Date().toISOString(),
        partNumber: selectedItem.partNumber,
        partName: selectedItem.partName,
        storeLocation: selectedItem.storeLocation,
        gauge: selectedItem.gauge || '',
        material: selectedItem.material || '',
        blankWidthMM: selectedItem.blankWidthMM || 0,
        blankLengthMM: selectedItem.blankLengthMM || 0,
        returnedQuantity: formData.returnedQuantity,
        returnReason: finalReason,
        returnedBy: formData.returnedBy,
        receivedBy: formData.receivedBy,
        fromDepartment: formData.fromDepartment,
        originalStock: oldStock,
        newStock: newStock,
        unitOfMeasure: selectedItem.unitOfMeasure,
        remarks: formData.remarks,
        storeItemId: selectedItem._id
      }

      const response = await fetch('/api/store-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save return record')
      }

      toast.success(`Return #${formData.returnNumber} processed successfully! Stock increased by ${formData.returnedQuantity} units`)

      setStoreItems(prev => prev.map(item => 
        item._id === selectedItem._id 
          ? { ...item, stockInStore: newStock }
          : item
      ))

      setReturnHistory(prev => [result.data, ...prev])
      closeModal()

    } catch (err) {
      console.error('Error processing return:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to process return')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReturn = async (id: string, returnNumber: string) => {
    if (confirm(`Delete return ${returnNumber}? This will not restore the stock.`)) {
      try {
        const response = await fetch(`/api/store-return?id=${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) throw new Error('Failed to delete')
        
        setReturnHistory(prev => prev.filter(record => record._id !== id))
        toast.success('Return record deleted')
      } catch {
        toast.error('Failed to delete')
      }
    }
  }

  const handlePrintReturn = (record: ReturnRecord) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Store Return - ${record.returnNumber}</title>
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
                letter-spacing: 0.05em;
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
              .table-section {
                padding: 0;
                flex: 1;
              }
              .data-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
                font-size: 11px;
                margin-top: 10px;
                margin-bottom: 0;
              }
              .data-table th {
                background: #f0f0f0;
                padding: 8px 6px;
                text-align: center;
                font-weight: bold;
                border: 1px solid #000;
              }
              .data-table td {
                padding: 6px 6px;
                border: 1px solid #000;
                vertical-align: top;
              }
              .sno-column { width: 40px; }
              .left-cell { text-align: left; }
              .center-cell { text-align: center; }
              .right-cell { text-align: right; }
              .total-row { background: #f0f0f0; font-weight: bold; }
              .remarks-section { 
                padding: 8px 15px; 
                margin: 5px 15px; 
              }
              .remarks-label { 
                font-weight: bold; 
                font-size: 11px; 
              }
              .remarks-text { 
                font-size: 11px; 
                margin-top: 3px; 
                line-height: 1.3; 
              }
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
              .content-wrapper {
                display: flex;
                flex-direction: column;
                flex: 1;
              }
              .bottom-section {
                margin-top: auto;
              }
              .return-info-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
                font-size: 11px;
                margin-top: 10px;
                margin-bottom: 0;
              }
              .return-info-table th {
                background: #f0f0f0;
                padding: 8px 6px;
                text-align: center;
                font-weight: bold;
                border: 1px solid #000;
              }
              .return-info-table td {
                padding: 6px 6px;
                border: 1px solid #000;
                vertical-align: top;
              }
              .no-bottom-margin {
                margin-bottom: 0;
              }
              @media print {
                body { margin: 0; padding: 3px; }
                .print-container { border: none; box-shadow: none; min-height: 95vh; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="header-section">
                <div class="logo-section">
                  <div class="logo-container">
                    <div class="logo-placeholder">
                      <img src="/logo.png" alt="Company Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='COMPANY LOGO';">
                    </div>
                  </div>
                </div>
                <div class="title-section">
                  <div class="main-title">STORE RETURN</div>
                  <div class="challan-type">MATERIAL RETURN VOUCHER</div>
                </div>
              </div>

              <div class="content-wrapper">
                <div class="info-section">
                  <table class="info-table">
                    <tbody>
                      <tr>
                        <td class="info-label"></td>
                        <td></td>
                        <td class="info-label">Return Number:</td>
                        <td><strong>${record.returnNumber}</strong></td>
                      </tr>
                      <tr>
                        <td class="info-label"></td>
                        <td></td>
                        <td class="info-label">Return Date:</td>
                        <td>${new Date(record.returnDate).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Main Table with Combined Dimensions Column -->
                <div class="table-section">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th class="sno-column">S.No</th>
                        <th>Part Number</th>
                        <th>Part Name</th>
                        <th>Store Location</th>
                        <th>Material</th>
                        <th>Gauge</th>
                        <th>Dimensions (mm)</th>
                        <th>Unit</th>
                        <th>Before Return</th>
                        <th>Returned Qty</th>
                        <th>After Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="center-cell">1</td>
                        <td class="left-cell">${record.partNumber}</td>
                        <td class="left-cell">${record.partName}</td>
                        <td class="left-cell">${record.storeLocation}</td>
                        <td class="left-cell">${record.material}</td>
                        <td class="center-cell">${record.gauge}</td>
                        <td class="center-cell">${record.blankWidthMM || 0} x ${record.blankLengthMM || 0}</td>
                        <td class="center-cell">${record.unitOfMeasure}</td>
                        <td class="right-cell">${record.originalStock}</td>
                        <td class="right-cell" style="color: #16a34a; font-weight: bold;">+${record.returnedQuantity}</td>
                        <td class="right-cell" style="color: #22c55e; font-weight: bold;">${record.newStock}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="total-row">
                        <td colspan="8" class="right-cell"><strong>Total:</strong></td>
                        <td class="right-cell">${record.originalStock}</td>
                        <td class="right-cell">+${record.returnedQuantity}</td>
                        <td class="right-cell">${record.newStock}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Return Information Table -->
                <div style="padding: 0 15px;">
                  <table class="return-info-table">
                    <thead>
                      <tr>
                        <th colspan="2">RETURN INFORMATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="width: 50%;"><strong>Return Reason:</strong> ${record.returnReason}</td>
                        <td style="width: 50%;"><strong>From Department:</strong> ${record.fromDepartment}</td>
                      </tr>
                      <tr>
                        <td><strong>Returned By:</strong> ${record.returnedBy}</td>
                        <td><strong>Received By:</strong> ${record.receivedBy}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- REMARKS SECTION - NO BOX, JUST HEADING AND TEXT AT BOTTOM -->
              ${record.remarks ? `
              <div class="remarks-section">
                <div class="remarks-label">REMARKS:</div>
                <div class="remarks-text">${record.remarks}</div>
              </div>
              ` : ''}

              <div class="bottom-section">
                <div class="signature-section">
                  <div class="signature-grid">
                    <div><div class="signature-line"></div><div class="signature-label">Returned By</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Received By</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Store Incharge</div></div>
                    <div><div class="signature-line"></div><div class="signature-label">Manager</div></div>
                  </div>
                </div>

                <div class="datetime-footer">
                  Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
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
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white ${dmSans.className}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8B5E3C] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedUser="mechanical">
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${dmSans.variable} font-sans`}>
      <Toaster position="top-center" />
      <Sidebar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
                Store Return Management
              </h1>
              <p className="text-gray-600 mt-1">Process material returns from production - Stock will INCREASE</p>
            </div>
            <button
              onClick={openModal}
              className="px-5 py-2.5 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#6d4a2f] transition flex items-center gap-2 shadow-sm"
            >
              <HiPlus className="w-5 h-5" /> New Return
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total Items in Store</p>
            <p className="text-2xl font-bold text-gray-800">{storeItems.length}</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total Stock (Units)</p>
            <p className="text-2xl font-bold text-gray-800">{storeItems.reduce((sum, i) => sum + i.stockInStore, 0)}</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total Returns</p>
            <p className="text-2xl font-bold text-orange-600">{returnHistory.length}</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Items Returned</p>
            <p className="text-2xl font-bold text-green-600">{returnHistory.reduce((sum, r) => sum + r.returnedQuantity, 0)}</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Stock Increased By</p>
            <p className="text-2xl font-bold text-green-600">+{returnHistory.reduce((sum, r) => sum + r.returnedQuantity, 0)}</p>
          </div>
        </div>

        {/* Return History Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className={`text-lg font-semibold text-gray-800 ${dmSans.className}`}>
              Return History
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <HiSearch className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search returns..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2"
              >
                <HiRefresh className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Return #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Part #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Part Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Material</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Dimensions (mm)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Returned Qty</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Returned By</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Received By</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Reason</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
                      No return records found. Click &quot;New Return&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{record.returnNumber}</td>
                      <td className="px-4 py-3 text-xs">{new Date(record.returnDate).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium">{record.partNumber}</td>
                      <td className="px-4 py-3">{record.partName}</td>
                      <td className="px-4 py-3">{record.storeLocation}</td>
                      <td className="px-4 py-3">{record.material}/{record.gauge}</td>
                      <td className="px-4 py-3 text-xs">{record.blankWidthMM} x {record.blankLengthMM}</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">+{record.returnedQuantity}</td>
                      <td className="px-4 py-3">{record.returnedBy}</td>
                      <td className="px-4 py-3">{record.receivedBy}</td>
                      <td className="px-4 py-3">{record.fromDepartment}</td>
                      <td className="px-4 py-3">{record.returnReason}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => handlePrintReturn(record)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Print"
                        >
                          <HiPrinter className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteReturn(record._id, record.returnNumber)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete"
                        >
                          <HiTrash className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredHistory.length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-right font-semibold text-gray-700">Total Returned:</td>
                    <td className="px-6 py-4 font-bold text-green-600">+{filteredHistory.reduce((sum, r) => sum + r.returnedQuantity, 0)}</td>
                    <td colSpan={5}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>

      {/* Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
                  New Stock Return
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Return Number - Auto-generated */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                    Return Number <span className="text-red-500">*</span>
                  </label>
                  <div className="text-lg font-mono font-bold text-[#8B5E3C] bg-white px-3 py-2 rounded border border-gray-200">
                    {formData.returnNumber}
                  </div>
                </div>

                {/* Part Selection Section */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                    Select Part from Store <span className="text-red-500">*</span>
                  </label>
                  
                  {!selectedItem ? (
                    <>
                      <div className="relative mb-3">
                        <span className="absolute left-3 top-2.5 text-gray-400">
                          <HiSearch className="w-5 h-5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search by part number, name, or material..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none"
                          value={partSearchTerm}
                          onChange={(e) => setPartSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="border rounded-lg max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left">Part #</th>
                              <th className="px-3 py-2 text-left">Part Name</th>
                              <th className="px-3 py-2 text-left">Location</th>
                              <th className="px-3 py-2 text-left">Material/Gauge</th>
                              <th className="px-3 py-2 text-left">Dimensions (mm)</th>
                              <th className="px-3 py-2 text-right">Stock</th>
                              <th className="px-3 py-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {filteredStoreItems.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                                  No parts found
                                </td>
                              </tr>
                            ) : (
                              filteredStoreItems.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium">{item.partNumber}</td>
                                  <td className="px-3 py-2">{item.partName}</td>
                                  <td className="px-3 py-2">{item.storeLocation}</td>
                                  <td className="px-3 py-2">{item.material}/{item.gauge}</td>
                                  <td className="px-3 py-2 text-xs">{item.blankWidthMM || 0} x {item.blankLengthMM || 0}</td>
                                  <td className="px-3 py-2 text-right">
                                    <span className={item.stockInStore <= item.minimumStockLevel ? 'text-red-600' : 'text-green-600'}>
                                      {item.stockInStore} {item.unitOfMeasure}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      onClick={() => selectPart(item)}
                                      className="px-3 py-1 text-xs rounded bg-[#8B5E3C] text-white hover:bg-[#6d4a2f]"
                                    >
                                      Select
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Selected Item Details */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div><span className="text-gray-500 font-medium">Part Number:</span> <span className="font-mono">{selectedItem.partNumber}</span></div>
                              <div><span className="text-gray-500 font-medium">Part Name:</span> {selectedItem.partName}</div>
                              <div><span className="text-gray-500 font-medium">Store Location:</span> {selectedItem.storeLocation}</div>
                              <div><span className="text-gray-500 font-medium">Gauge:</span> {selectedItem.gauge || '-'}</div>
                              <div><span className="text-gray-500 font-medium">Material:</span> {selectedItem.material || '-'}</div>
                              <div><span className="text-gray-500 font-medium">Blank Width (mm):</span> {selectedItem.blankWidthMM || 0} mm</div>
                              <div><span className="text-gray-500 font-medium">Blank Length (mm):</span> {selectedItem.blankLengthMM || 0} mm</div>
                              <div><span className="text-gray-500 font-medium">Unit of Measure:</span> {selectedItem.unitOfMeasure}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedItem(null)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Change
                          </button>
                        </div>
                      </div>

                      {/* Current Stock */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-blue-800">📦 Original Stock (Before Return)</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">
                              {selectedItem.stockInStore} <span className="text-lg">{selectedItem.unitOfMeasure}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-blue-600">Minimum Stock Level</p>
                            <p className="text-lg font-semibold text-blue-600">{selectedItem.minimumStockLevel} {selectedItem.unitOfMeasure}</p>
                          </div>
                        </div>
                      </div>

                      {/* Return Quantity */}
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Return Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.returnedQuantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, returnedQuantity: Number(e.target.value) }))}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder="Enter quantity to return"
                        />
                        <p className="text-xs text-green-600 mt-1">✅ This quantity will be ADDED to current stock</p>
                      </div>
                      
                      {/* Returned By */}
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Returned By (Person returning material) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.returnedBy}
                          onChange={(e) => setFormData(prev => ({ ...prev, returnedBy: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder="Enter name of person returning material"
                        />
                      </div>

                      {/* Received By */}
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Received By (Store/Receiving person) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.receivedBy}
                          onChange={(e) => setFormData(prev => ({ ...prev, receivedBy: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder="Enter name of person receiving in store"
                        />
                      </div>

                      {/* From Department */}
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          From Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.fromDepartment}
                          onChange={(e) => setFormData(prev => ({ ...prev, fromDepartment: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        >
                          <option value="">Select Department</option>
                          <option value="Production">Production</option>
                          <option value="Quality Control">Quality Control</option>
                          <option value="Assembly">Assembly</option>
                          <option value="Packaging">Packaging</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      {/* Return Reason */}
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Return Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.returnReason}
                          onChange={(e) => setFormData(prev => ({ ...prev, returnReason: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        >
                          <option value="">Select Reason</option>
                          <option value="Production Defect">Production Defect</option>
                          <option value="Quality Issue">Quality Issue</option>
                          <option value="Wrong Item Issued">Wrong Item Issued</option>
                          <option value="Excess from Production">Excess from Production</option>
                          <option value="Damaged During Production">Damaged During Production</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      {formData.returnReason === 'Other' && (
                        <div>
                          <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                            Specify Reason <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.customReason}
                            onChange={(e) => setFormData(prev => ({ ...prev, customReason: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Please specify the reason"
                          />
                        </div>
                      )}

                      {/* Remarks */}
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>
                          Remarks (Optional)
                        </label>
                        <textarea
                          value={formData.remarks}
                          onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder="Additional notes..."
                        />
                      </div>
                      
                      {/* Preview after return */}
                      {formData.returnedQuantity > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-sm font-semibold text-green-800 mb-2">📊 After Return Preview:</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-green-200">
                              <span className="text-green-700">Original Stock (Before Return):</span>
                              <span className="font-semibold text-gray-800">{selectedItem.stockInStore} {selectedItem.unitOfMeasure}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-green-200">
                              <span className="text-green-700">Return Quantity (Adding to Stock):</span>
                              <span className="font-bold text-green-600">+ {formData.returnedQuantity} {selectedItem.unitOfMeasure}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-green-800 font-semibold">🔄 New Stock (After Return):</span>
                              <span className="font-bold text-xl text-green-700">{selectedItem.stockInStore + formData.returnedQuantity} {selectedItem.unitOfMeasure}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                {selectedItem && (
                  <button
                    onClick={handleSubmitReturn}
                    disabled={isSubmitting || formData.returnedQuantity <= 0 || !formData.returnedBy.trim() || !formData.receivedBy.trim() || !formData.fromDepartment || !formData.returnReason}
                    className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      'Submit Return'
                    )}
                  </button>
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