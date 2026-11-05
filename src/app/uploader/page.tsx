'use client'

import { useState, useEffect, useRef } from 'react'
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Mechanical/Components/sidebar'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import {
  HiUpload,
  HiDownload,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiDocumentText,
  HiTable,
} from 'react-icons/hi'
import toast, { Toaster } from 'react-hot-toast'
import * as XLSX from 'xlsx'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

// Gauge (SWG) to thickness in mm conversion
const GAUGE_TO_THICKNESS: Record<string, number> = {
  '10G': 2.313,
  '12G': 1.834,
  '14G': 1.454,
  '16G': 1.159,
  '18G': 0.918,
  '20G': 0.725,
  '22G': 0.759,
  '24G': 0.607,
  '26G': 0.455,
  '28G': 0.378,
}

// Map SWG number to gauge string
const SWG_TO_GAUGE: Record<string, string> = {
  '10': '10G',
  '12': '12G',
  '14': '14G',
  '16': '16G',
  '18': '18G',
  '20': '20G',
  '22': '22G',
  '24': '24G',
  '26': '26G',
  '28': '28G',
}

interface SheetPriceEntry {
  material: string
  gauge: string
  pricePerKg: number
}

interface LivePrices {
  paintPrice: number
  paintEffectiveDate: string
  sheetPrices: SheetPriceEntry[]
  sheetEffectiveDate: string
  _id: string
}

interface ParsedRow {
  srNo: string
  partNumber: string
  partName: string
  swg: string
  gauge: string
  lengthMM: number
  widthMM: number
  sqft: number
  weight: number
  sheetCost: number
  paintCost: number
  valid: boolean
  error?: string
}

export default function CSVExcelUploaderPage() {
  const [livePrices, setLivePrices] = useState<LivePrices | null>(null)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [csvText, setCsvText] = useState('')
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [fileName, setFileName] = useState<string>('')
  const [sheetInfo, setSheetInfo] = useState<string>('') // e.g. "Master List"
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch live prices on mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const costQuery = `*[_type == "cost"][0] {
          _id,
          paintSection { todayPaintCost, paintEffectiveDate },
          sheetSection { sheetPrices[] { material, gauge, pricePerKg }, sheetEffectiveDate }
        }`
        const costResult = await client.fetch(costQuery)
        if (costResult) {
          setLivePrices({
            paintPrice: costResult.paintSection?.todayPaintCost || 0,
            paintEffectiveDate: costResult.paintSection?.paintEffectiveDate,
            sheetPrices: costResult.sheetSection?.sheetPrices || [],
            sheetEffectiveDate: costResult.sheetSection?.sheetEffectiveDate,
            _id: costResult._id,
          })
        }
      } catch (err) {
        console.error('Failed to fetch prices', err)
        toast.error('Failed to load market prices')
      } finally {
        setIsLoadingPrices(false)
      }
    }
    fetchPrices()
  }, [])

  const getSheetPrice = (gauge: string, material: string = 'MS') => {
    const entry = livePrices?.sheetPrices?.find(
      (p) => p.material === material && p.gauge === gauge
    )
    return entry?.pricePerKg || 0
  }

  const calcSqft = (lengthMM: number, widthMM: number) => {
    if (!lengthMM || !widthMM) return 0
    return Number(((lengthMM * widthMM) / 92903).toFixed(4))
  }

  const calcWeight = (sqft: number, gauge: string) => {
    const thickness = GAUGE_TO_THICKNESS[gauge] || 0
    if (!thickness || !sqft) return 0
    return Number((sqft * thickness).toFixed(4))
  }

  const calcSheetCost = (weight: number, gauge: string, material = 'MS') => {
    const price = getSheetPrice(gauge, material)
    return Number((price * weight).toFixed(2))
  }

  const calcPaintCost = (sqft: number) => {
    const price = livePrices?.paintPrice || 0
    return Number((price * sqft * 2).toFixed(2))
  }

  // ============================================================
  // CORE: Convert raw row arrays into ParsedRow[] (shared by CSV & Excel)
  // ============================================================
  const rowsToParsed = (rawRows: (string | number)[][]): ParsedRow[] => {
    const rows: ParsedRow[] = []
    if (!rawRows.length) return rows

    // Detect header row (first non-empty row containing "part" or "sr")
    let startIndex = 0
    const firstRowStr = rawRows[0].map((c) => String(c ?? '').toLowerCase()).join(' ')
    if (
      firstRowStr.includes('part no') ||
      firstRowStr.includes('part number') ||
      firstRowStr.includes('sr') ||
      firstRowStr.includes('swg') ||
      firstRowStr.includes('part description')
    ) {
      startIndex = 1
    }

    for (let i = startIndex; i < rawRows.length; i++) {
      const raw = rawRows[i]
      if (!raw || raw.every((c) => String(c ?? '').trim() === '')) continue

      const cells = raw.map((c) => String(c ?? '').trim())

      // Expected: Sr# | Part No | Part Description | SWG | Length(mm) | Width(mm)
      let srNo = ''
      let partNumber = ''
      let partName = ''
      let swg = ''
      let lengthMM = 0
      let widthMM = 0

      if (cells.length >= 6) {
        srNo = cells[0]
        partNumber = cells[1]
        partName = cells[2]
        swg = cells[3]
        lengthMM = parseFloat(cells[4]) || 0
        widthMM = parseFloat(cells[5]) || 0
      } else if (cells.length === 5) {
        partNumber = cells[0]
        partName = cells[1]
        swg = cells[2]
        lengthMM = parseFloat(cells[3]) || 0
        widthMM = parseFloat(cells[4]) || 0
      } else if (cells.length === 4) {
        partNumber = cells[0]
        partName = cells[1]
        swg = cells[2]
        lengthMM = parseFloat(cells[3]) || 0
        widthMM = 0
      } else {
        rows.push({
          srNo: '',
          partNumber: cells[0] || '',
          partName: cells[1] || '',
          swg: cells[2] || '',
          gauge: '',
          lengthMM: 0,
          widthMM: 0,
          sqft: 0,
          weight: 0,
          sheetCost: 0,
          paintCost: 0,
          valid: false,
          error: 'Insufficient columns',
        })
        continue
      }

      // Normalize SWG -> gauge
      const swgClean = String(swg).replace(/[^0-9]/g, '')
      const gauge =
        SWG_TO_GAUGE[swgClean] || (String(swg).toUpperCase().endsWith('G') ? String(swg).toUpperCase() : `${swgClean}G`)

      const valid =
        !!partNumber &&
        !!partName &&
        !!gauge &&
        lengthMM > 0 &&
        widthMM > 0 &&
        !!GAUGE_TO_THICKNESS[gauge]

      const sqft = calcSqft(lengthMM, widthMM)
      const weight = calcWeight(sqft, gauge)
      const sheetCost = calcSheetCost(weight, gauge, 'MS')
      const paintCost = calcPaintCost(sqft)

      rows.push({
        srNo,
        partNumber,
        partName,
        swg: swgClean,
        gauge,
        lengthMM,
        widthMM,
        sqft,
        weight,
        sheetCost,
        paintCost,
        valid,
        error: valid
          ? undefined
          : !partNumber
          ? 'Missing Part No'
          : !partName
          ? 'Missing Part Description'
          : !GAUGE_TO_THICKNESS[gauge]
          ? `Unknown gauge: ${gauge}`
          : 'Invalid dimensions',
      })
    }

    return rows
  }

  // ============================================================
  // Parse CSV / TSV text
  // ============================================================
  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
    if (!lines.length) return []

    const firstLine = lines[0] || ''
    const delimiter = firstLine.includes('\t') ? '\t' : ','

    const rawRows: (string | number)[][] = lines.map((line) => {
      let parts = line.split(delimiter).map((p) => p.trim())
      if (parts.length < 4) {
        // fallback to whitespace split
        parts = line.split(/\t|\s{2,}/).map((p) => p.trim())
      }
      return parts
    })

    return rowsToParsed(rawRows)
  }

  // ============================================================
  // Parse Excel (.xlsx / .xls) via SheetJS
  // Picks "Master List" sheet if present; otherwise first sheet
  // ============================================================
  const parseExcel = (file: File): Promise<{ rows: ParsedRow[]; sheetName: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })

          // Prefer "Master List" sheet (case-insensitive)
          let sheetName =
            workbook.SheetNames.find((n) => n.toLowerCase().includes('master')) ||
            workbook.SheetNames[0]

          if (!sheetName) {
            reject(new Error('No sheets found in workbook'))
            return
          }

          const sheet = workbook.Sheets[sheetName]
          // header:1 → array of arrays (one per row)
          const rawRows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
            header: 1,
            defval: '',
            blankrows: false,
          })

          const rows = rowsToParsed(rawRows)
          resolve({ rows, sheetName })
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  // ============================================================
  // Handlers
  // ============================================================
  const handleTextChange = (text: string) => {
    setCsvText(text)
    setSheetInfo('')
    if (text.trim()) {
      setParsedRows(parseCSV(text))
    } else {
      setParsedRows([])
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    const lower = file.name.toLowerCase()

    // Excel path
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      try {
        const { rows, sheetName } = await parseExcel(file)
        setParsedRows(rows)
        setSheetInfo(sheetName)
        // clear pasted text since we're using a file
        setCsvText('')
        toast.success(`Loaded ${rows.length} rows from "${sheetName}" in ${file.name}`)
      } catch (err) {
        console.error('Excel parse error', err)
        toast.error('Failed to parse Excel file')
      }
      e.target.value = ''
      return
    }

    // CSV / TSV / TXT path
    if (lower.endsWith('.csv') || lower.endsWith('.tsv') || lower.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = String(ev.target?.result || '')
        setCsvText(text)
        setSheetInfo('')
        const rows = parseCSV(text)
        setParsedRows(rows)
        toast.success(`Loaded ${rows.length} rows from ${file.name}`)
      }
      reader.readAsText(file)
      e.target.value = ''
      return
    }

    toast.error('Unsupported file type. Please upload .xlsx, .xls, .csv, .tsv or .txt')
    e.target.value = ''
  }

  const handleClear = () => {
    setCsvText('')
    setParsedRows([])
    setFileName('')
    setSheetInfo('')
  }

  const handleUploadAll = async () => {
    const validRows = parsedRows.filter((r) => r.valid)
    if (validRows.length === 0) {
      toast.error('No valid rows to upload')
      return
    }

    setIsUploading(true)
    setUploadProgress({ current: 0, total: validRows.length })

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      setUploadProgress({ current: i + 1, total: validRows.length })

      try {
        const currentPricePerKg = getSheetPrice(row.gauge, 'MS')
        const currentPaintPrice = livePrices?.paintPrice || 0

        const payload = {
          partNumber: row.partNumber,
          partName: row.partName,
          category: 'raw',
          storeLocation: 'Default',
          gauge: row.gauge,
          material: 'MS',
          blankWidthMM: row.widthMM,
          blankLengthMM: row.lengthMM,
          blankWidthInch: 0,
          blankLengthInch: 0,
          sqft: row.sqft,
          weight: row.weight,
          todaySheetPricePerKg: currentPricePerKg,
          todayPaintCost: currentPaintPrice,
          sheetCostPerPiece: row.sheetCost,
          paintCostPerPiece: row.paintCost,
          stockInStore: 10,
          minimumStockLevel: 10,
          unitOfMeasure: 'Pieces',
        }

        const res = await fetch('/api/store/add-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          console.error('Upload failed for', row.partNumber, errData)
          failCount++
        } else {
          successCount++
        }
      } catch (err) {
        console.error('Upload error for', row.partNumber, err)
        failCount++
      }
    }

    setIsUploading(false)
    setUploadProgress({ current: 0, total: 0 })

    if (successCount > 0) {
      toast.success(
        `Successfully uploaded ${successCount} items!${
          failCount > 0 ? ` ${failCount} failed.` : ''
        }`,
        { duration: 6000 }
      )
    } else {
      toast.error(`Upload failed for all ${validRows.length} items.`)
    }

    if (successCount > 0 && failCount === 0) {
      handleClear()
    }
  }

  // Download sample CSV template
  const downloadTemplate = () => {
    const header = 'Sr. #,Part No,Part Description,SWG,Length (mm),Width (mm)\n'
    const sample = `1,UP FR W80,PANEL UPPER - FRONT,14,782,162
2,UP BK W80,PANEL UPPER - BACK,14,782,162
3,LR FR W80,PANEL LOWER - FRONT,14,782,184
4,LR BK W80,PANEL LOWER - BACK,14,782,184
5,FRM HD 21/80,FRAMEWORK,14,2100,125
6,SC H21,SAFETY BARRIER CHANNEL,16,1900,117`
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'store_inventory_template.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV template downloaded')
  }

  // Download a real Excel template (Master List format)
  const downloadExcelTemplate = () => {
    const data = [
      ['Sr. #', 'Part No', 'Part Description', 'SWG', 'Length (mm)', 'Width (mm)'],
      [1, 'UP FR W80', 'PANEL UPPER - FRONT', 14, 782, 162],
      [2, 'UP BK W80', 'PANEL UPPER - BACK', 14, 782, 162],
      [3, 'LR FR W80', 'PANEL LOWER - FRONT', 14, 782, 184],
      [4, 'LR BK W80', 'PANEL LOWER - BACK', 14, 782, 184],
      [5, 'FRM HD 21/80', 'FRAMEWORK', 14, 2100, 125],
      [6, 'SC H21', 'SAFETY BARRIER CHANNEL', 16, 1900, 117],
    ]
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Master List')
    XLSX.writeFile(wb, 'store_inventory_template.xlsx')
    toast.success('Excel template downloaded')
  }

  const validCount = parsedRows.filter((r) => r.valid).length
  const invalidCount = parsedRows.length - validCount

  if (isLoadingPrices) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white ${dmSans.className}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedUser="mechanical">
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <Toaster position="top-center" />
        <Sidebar />

        <main className="max-w-7xl mx-auto px-4 py-10 space-y-6">
          {/* Header */}
          <div className="border-b pb-6 space-y-2">
            <h1 className={`text-2xl sm:text-3xl pt-8 font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
              CSV / Excel Bulk Uploader — Store Inventory
            </h1>
            <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>
              Upload parts in bulk using Excel (.xlsx / .xls) or CSV / TSV. Compatible with{' '}
              <span className="font-semibold">All_Panels_Master_List.xlsx</span> →{' '}
              <span className="font-semibold">Master List</span> sheet.
            </p>
          </div>

          {/* Market price snapshot */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Current Market Prices (used for calculations)
            </h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-500">Paint (per sqft, ×2 both sides): </span>
                <span className="font-bold text-blue-700">
                  Rs {(livePrices?.paintPrice || 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Material prices configured: </span>
                <span className="font-bold text-green-700">
                  {livePrices?.sheetPrices?.length || 0} entries
                </span>
              </div>
            </div>
            {(!livePrices?.sheetPrices || livePrices.sheetPrices.length === 0) && (
              <p className="text-xs text-red-600 mt-2">
                ⚠ No material prices configured. Sheet cost will be 0. Update costs from the inventory page.
              </p>
            )}
          </div>

          {/* Upload controls */}
          <div className="bg-gray-50 rounded-lg p-6 border space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition text-sm font-medium"
              >
                <HiUpload className="w-4 h-4" /> Choose Excel / CSV File
              </button>
              <button
                onClick={downloadExcelTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
              >
                <HiTable className="w-4 h-4" /> Download Excel Template
              </button>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#8B5E3C] border border-[#8B5E3C] rounded-md hover:bg-[#8B5E3C] hover:text-white transition text-sm font-medium"
              >
                <HiDownload className="w-4 h-4" /> Download CSV Template
              </button>
              {(csvText || parsedRows.length > 0) && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition text-sm font-medium"
                >
                  <HiTrash className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
            {fileName && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <HiDocumentText className="w-4 h-4" /> Loaded:{' '}
                <span className="font-medium">{fileName}</span>
                {sheetInfo && (
                  <span className="text-xs text-gray-500">
                    (sheet: <span className="font-mono">{sheetInfo}</span>)
                  </span>
                )}
              </p>
            )}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 text-xs text-amber-800">
              <p className="font-semibold mb-1">📌 Excel support</p>
              <p>
                For <span className="font-mono">All_Panels_Master_List.xlsx</span>, the uploader automatically picks the{' '}
                <strong>Master List</strong> sheet (falls back to first sheet). The <em>Unique Parts</em> sheet with
                formula columns is <strong>not</strong> required — just use the Master List sheet directly.
              </p>
            </div>
          </div>

          {/* Paste area (CSV / TSV only) */}
          <div className="bg-white rounded-lg p-6 border space-y-3">
            <label className={`block text-sm font-medium text-gray-700 ${dmSans.className}`}>
              Or paste CSV / TSV text directly (Excel files must be selected above)
            </label>
            <textarea
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none font-mono text-xs"
              placeholder={`Sr. #,Part No,Part Description,SWG,Length (mm),Width (mm)
1,UP FR W80,PANEL UPPER - FRONT,14,782,162
2,UP BK W80,PANEL UPPER - BACK,14,782,162
3,LR FR W80,PANEL LOWER - FRONT,14,782,184`}
            />
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-xs text-blue-800 space-y-1">
              <p className="font-semibold">Expected columns (CSV, TSV or Excel):</p>
              <p>
                <span className="font-mono">Sr. #</span> (optional),{' '}
                <span className="font-mono">Part No</span>,{' '}
                <span className="font-mono">Part Description</span>,{' '}
                <span className="font-mono">SWG</span> (e.g. 14, 16, 22),{' '}
                <span className="font-mono">Length (mm)</span>,{' '}
                <span className="font-mono">Width (mm)</span>
              </p>
              <p className="text-blue-600">
                Each row is auto-calculated: SQFT = L×W/92903, Weight = SQFT×Thickness, Sheet Cost = Weight×Price/kg,
                Paint Cost = SQFT×Paint×2. Stock &amp; MOQ default to <strong>10</strong>.
              </p>
            </div>
          </div>

          {/* Preview table */}
          {parsedRows.length > 0 && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h3 className={`text-lg font-semibold text-gray-800 ${dmSans.className}`}>
                    Preview ({parsedRows.length} rows)
                  </h3>
                  <div className="flex gap-4 text-sm mt-1">
                    <span className="text-green-600 flex items-center gap-1">
                      <HiCheckCircle className="w-4 h-4" /> Valid: {validCount}
                    </span>
                    {invalidCount > 0 && (
                      <span className="text-red-600 flex items-center gap-1">
                        <HiXCircle className="w-4 h-4" /> Invalid: {invalidCount}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading || validCount === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isUploading
                    ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                    : `Upload ${validCount} Valid Items →`}
                </button>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className={`w-full text-xs ${dmSans.className}`}>
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left">#</th>
                      <th className="px-2 py-2 text-left">Part No</th>
                      <th className="px-2 py-2 text-left">Description</th>
                      <th className="px-2 py-2 text-center">SWG</th>
                      <th className="px-2 py-2 text-center">Gauge</th>
                      <th className="px-2 py-2 text-right">L(mm)</th>
                      <th className="px-2 py-2 text-right">W(mm)</th>
                      <th className="px-2 py-2 text-right">SQFT</th>
                      <th className="px-2 py-2 text-right">Wt(kg)</th>
                      <th className="px-2 py-2 text-right">Sheet Rs</th>
                      <th className="px-2 py-2 text-right">Paint Rs</th>
                      <th className="px-2 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.valid ? 'hover:bg-gray-50' : 'bg-red-50'}>
                        <td className="px-2 py-1.5">{idx + 1}</td>
                        <td className="px-2 py-1.5 font-medium">{row.partNumber || '—'}</td>
                        <td className="px-2 py-1.5">{row.partName || '—'}</td>
                        <td className="px-2 py-1.5 text-center">{row.swg || '—'}</td>
                        <td className="px-2 py-1.5 text-center">{row.gauge || '—'}</td>
                        <td className="px-2 py-1.5 text-right">{row.lengthMM || '—'}</td>
                        <td className="px-2 py-1.5 text-right">{row.widthMM || '—'}</td>
                        <td className="px-2 py-1.5 text-right">{row.sqft.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right">{row.weight.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right">{row.sheetCost.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right">{row.paintCost.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-center">
                          {row.valid ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-[10px] font-semibold">
                              <HiCheckCircle className="w-3 h-3" /> OK
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-red-600 text-[10px] font-semibold"
                              title={row.error}
                            >
                              <HiXCircle className="w-3 h-3" /> {row.error || 'Invalid'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {parsedRows.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-12 border-2 border-dashed border-gray-300 text-center">
              <HiUpload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">No data loaded yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Choose an Excel / CSV / TSV file or paste data above to preview rows.
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

export const dynamic = 'force-dynamic'