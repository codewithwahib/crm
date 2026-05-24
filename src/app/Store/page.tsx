// app/Execution/store-inventory/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
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

interface ReturnOrder {
  returnNumber: string
  quantity: number
  returnDate: string
  reason: string
  status: string
  returnBy: string
}

interface Gatepass {
  gatepassNumber: string
  quantity: number
  date: string
  purpose: string
  issuedTo: string
  authorizedBy: string
  remarks?: string
}

interface StoreItem {
  _id: string
  _createdAt: string
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
  sqft?: number
  weight?: number
  sheetCostPerPiece?: number | string
  paintCostPerPiece?: number | string
  stockInStore: number
  minimumStockLevel: number
  unitOfMeasure: string
  returnStockOrders?: ReturnOrder[]
  gatepasses?: Gatepass[]
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

interface FormData {
  partNumber: string
  partName: string
  category: string
  storeLocation: string
  gauge: string
  material: string
  blankWidthMM: number | ''
  blankLengthMM: number | ''
  blankWidthInch: number | ''
  blankLengthInch: number | ''
  sqft: number | ''
  weight: number | ''
  sheetCostPerPiece: number | ''
  paintCostPerPiece: number | ''
  stockInHand: number | ''
  minOrderQty: number | ''
  unitOfMeasure: string
}

interface CostFormData {
  paintPrice: number | ''
  sheetPrices: SheetPriceEntry[]
}

interface ReturnFormData {
  returnQuantity: number
  returnReason: string
  returnedBy: string
}

// Material density values in kg per cubic mm (kg/mm³)
const MATERIAL_DENSITIES: Record<string, number> = {
  'GI': 0.00000785,
  'MS': 0.00000785,
  'Aluminum': 0.00000270,
  'StainlessSteel': 0.00000800,
  'Copper': 0.00000896,
  'Brass': 0.00000873,
}

// Gauge to thickness in mm conversion
const GAUGE_TO_THICKNESS: Record<string, number> = {
  '10G': 3.416,
  '12G': 2.642,
  '14G': 1.897,
  '16G': 1.519,
  '18G': 1.214,
  '20G': 0.912,
  '22G': 0.759,
  '24G': 0.607,
  '26G': 0.455,
  '28G': 0.378,
}

export default function StoreInventoryList() {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [livePrices, setLivePrices] = useState<LivePrices | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCostModalOpen, setIsCostModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null)
  const [returnItem, setReturnItem] = useState<StoreItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCostSubmitting, setIsCostSubmitting] = useState(false)
  const [isReturnSubmitting, setIsReturnSubmitting] = useState(false)
  const [costFormData, setCostFormData] = useState<CostFormData>({
    paintPrice: '',
    sheetPrices: []
  })
  const [returnFormData, setReturnFormData] = useState<ReturnFormData>({
    returnQuantity: 0,
    returnReason: '',
    returnedBy: ''
  })
  const [formData, setFormData] = useState<FormData>({
    partNumber: '',
    partName: '',
    category: 'raw',
    storeLocation: '',
    gauge: '',
    material: 'GI',
    blankWidthMM: '',
    blankLengthMM: '',
    blankWidthInch: '',
    blankLengthInch: '',
    sqft: '',
    weight: '',
    sheetCostPerPiece: '',
    paintCostPerPiece: '',
    stockInHand: '',
    minOrderQty: '',
    unitOfMeasure: 'Pieces'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeResponse = await fetch('/api/store/add-item')
        if (!storeResponse.ok) {
          throw new Error('Failed to fetch items')
        }
        const storeResult = await storeResponse.json()
        
        const itemsWithNumberCosts = storeResult.map((item: StoreItem) => ({
          ...item,
          sheetCostPerPiece: typeof item.sheetCostPerPiece === 'string' ? parseFloat(item.sheetCostPerPiece) : item.sheetCostPerPiece,
          paintCostPerPiece: typeof item.paintCostPerPiece === 'string' ? parseFloat(item.paintCostPerPiece) : item.paintCostPerPiece,
          weight: item.weight || 0
        }))
        
        setStoreItems(Array.isArray(itemsWithNumberCosts) ? itemsWithNumberCosts : [])

        const costQuery = `*[_type == "cost"][0] {
          _id,
          paintSection {
            todayPaintCost,
            paintEffectiveDate
          },
          sheetSection {
            sheetPrices[] {
              material,
              gauge,
              pricePerKg
            },
            sheetEffectiveDate
          }
        }`
        
        const costResult = await client.fetch(costQuery)
        
        if (costResult) {
          const sheetPricesArray = costResult.sheetSection?.sheetPrices || []
          
          setLivePrices({
            paintPrice: costResult.paintSection?.todayPaintCost || 0,
            paintEffectiveDate: costResult.paintSection?.paintEffectiveDate,
            sheetPrices: sheetPricesArray,
            sheetEffectiveDate: costResult.sheetSection?.sheetEffectiveDate,
            _id: costResult._id
          })
          
          setCostFormData({
            paintPrice: costResult.paintSection?.todayPaintCost || '',
            sheetPrices: sheetPricesArray
          })
        }
        
      } catch (err) {
        console.error('Failed to fetch data', err)
        setError('Failed to load store inventory')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' }
    if (stock <= minStock) return { text: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const getSafeCostValue = (cost: number | string | undefined): number => {
    if (cost === undefined || cost === null) return 0
    if (typeof cost === 'number') return cost
    if (typeof cost === 'string') {
      const parsed = parseFloat(cost)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const filteredItems = storeItems.filter(item => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      (item.partNumber?.toLowerCase() || '').includes(searchLower) ||
      (item.partName?.toLowerCase() || '').includes(searchLower) ||
      (item.category?.toLowerCase() || '').includes(searchLower) ||
      (item.storeLocation?.toLowerCase() || '').includes(searchLower) ||
      (item.material?.toLowerCase() || '').includes(searchLower)
    )
  })

  // Convert mm to inches
  const mmToInches = (mm: number | ''): number => {
    if (mm === '' || !mm) return 0
    return Number((mm / 25.4).toFixed(2))
  }

  // Calculate square feet from inches dimensions
  const calculateSqftFromInches = (widthInch: number | '', lengthInch: number | '') => {
    if (widthInch === '' || lengthInch === '' || !widthInch || !lengthInch) return 0
    const sqftValue = (widthInch * lengthInch) / 144
    return Number(sqftValue.toFixed(2))
  }

  // Calculate weight based on material, gauge, width (mm), length (mm)
  const calculateWeight = (widthMM: number | '', lengthMM: number | '', gauge: string, material: string): number => {
    if (widthMM === '' || lengthMM === '' || !widthMM || !lengthMM || !gauge || !material) return 0
    
    const thickness = GAUGE_TO_THICKNESS[gauge] || 0
    const density = MATERIAL_DENSITIES[material] || MATERIAL_DENSITIES['MS']
    
    if (thickness === 0 || density === 0) return 0
    
    const volume = widthMM * lengthMM * thickness
    const weight = volume * density
    
    return Number(weight.toFixed(3))
  }

  // Calculate sheet cost based on weight and price per kg
  const calculateSheetCost = (weight: number | '') => {
    if (weight === '' || !weight || weight === 0) return 0
    if (!formData.gauge || !formData.material) return 0
    
    const priceEntry = livePrices?.sheetPrices?.find(
      p => p.material === formData.material && p.gauge === formData.gauge
    )
    const pricePerKg = priceEntry?.pricePerKg || 0
    return Number((pricePerKg * weight).toFixed(2))
  }

  const calculatePaintCost = (sqft: number | '') => {
    if (sqft === '' || !sqft) return 0
    const pricePerSqft = livePrices?.paintPrice || 0
    return Number((pricePerSqft * sqft).toFixed(2))
  }

  // Handle mm input and auto-convert to inches, then calculate everything
  const handleMMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const mmValue = value === '' ? '' : Number(value)
    
    setFormData(prev => {
      const updated = { ...prev, [name]: mmValue }
      
      const widthInch = mmToInches(name === 'blankWidthMM' ? mmValue : updated.blankWidthMM)
      const lengthInch = mmToInches(name === 'blankLengthMM' ? mmValue : updated.blankLengthMM)
      
      updated.blankWidthInch = widthInch
      updated.blankLengthInch = lengthInch
      
      const newSqft = calculateSqftFromInches(widthInch, lengthInch)
      updated.sqft = newSqft
      
      let newWeight = 0
      if (updated.gauge && updated.material) {
        newWeight = calculateWeight(
          name === 'blankWidthMM' ? mmValue : updated.blankWidthMM,
          name === 'blankLengthMM' ? mmValue : updated.blankLengthMM,
          updated.gauge,
          updated.material
        )
        updated.weight = newWeight
      }
      
      updated.sheetCostPerPiece = calculateSheetCost(newWeight)
      updated.paintCostPerPiece = calculatePaintCost(newSqft)
      
      return updated
    })
  }

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      
      let newWeight = 0
      if (updated.blankWidthMM && updated.blankLengthMM && updated.gauge) {
        newWeight = calculateWeight(
          updated.blankWidthMM,
          updated.blankLengthMM,
          updated.gauge,
          value
        )
        updated.weight = newWeight
      }
      
      updated.sheetCostPerPiece = calculateSheetCost(newWeight)
      
      return updated
    })
  }

  const handleGaugeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      
      let newWeight = 0
      if (updated.blankWidthMM && updated.blankLengthMM && updated.material) {
        newWeight = calculateWeight(
          updated.blankWidthMM,
          updated.blankLengthMM,
          value,
          updated.material
        )
        updated.weight = newWeight
      }
      
      updated.sheetCostPerPiece = calculateSheetCost(newWeight)
      
      return updated
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'blankWidthMM' || name === 'blankLengthMM') {
      handleMMChange(e as React.ChangeEvent<HTMLInputElement>)
    } else if (name === 'material') {
      handleMaterialChange(e as React.ChangeEvent<HTMLSelectElement>)
    } else if (name === 'gauge') {
      handleGaugeChange(e as React.ChangeEvent<HTMLSelectElement>)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleReturnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReturnFormData(prev => ({ ...prev, [name]: name === 'returnQuantity' ? Number(value) : value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }))
  }

  const handlePaintPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCostFormData(prev => ({ ...prev, paintPrice: value === '' ? '' : Number(value) }))
  }

  const handleSheetPriceChange = (index: number, field: keyof SheetPriceEntry, value: string | number) => {
    const updatedSheetPrices = [...costFormData.sheetPrices]
    updatedSheetPrices[index] = { ...updatedSheetPrices[index], [field]: field === 'pricePerKg' ? Number(value) : value }
    setCostFormData(prev => ({ ...prev, sheetPrices: updatedSheetPrices }))
  }

  const addSheetPriceRow = () => {
    setCostFormData(prev => ({ ...prev, sheetPrices: [...prev.sheetPrices, { material: 'GI', gauge: '20G', pricePerKg: 0 }] }))
  }

  const removeSheetPriceRow = (index: number) => {
    const updatedSheetPrices = costFormData.sheetPrices.filter((_, i) => i !== index)
    setCostFormData(prev => ({ ...prev, sheetPrices: updatedSheetPrices }))
  }

  const resetForm = () => {
    setFormData({
      partNumber: '', partName: '', category: 'raw', storeLocation: '', gauge: '', material: 'GI',
      blankWidthMM: '', blankLengthMM: '', blankWidthInch: '', blankLengthInch: '',
      sqft: '', weight: '', sheetCostPerPiece: '', paintCostPerPiece: '',
      stockInHand: '', minOrderQty: '', unitOfMeasure: 'Pieces'
    })
  }

  const resetCostForm = () => {
    setCostFormData({ paintPrice: livePrices?.paintPrice || '', sheetPrices: livePrices?.sheetPrices || [] })
  }

  const openAddModal = () => { resetForm(); setIsAddModalOpen(true) }
  const openCostModal = () => { resetCostForm(); setIsCostModalOpen(true) }

  const openEditModal = (item: StoreItem) => {
    setEditingItem(item)
    setFormData({
      partNumber: item.partNumber || '', partName: item.partName || '', category: item.category || 'raw',
      storeLocation: item.storeLocation || '', gauge: item.gauge || '', material: item.material || 'GI',
      blankWidthMM: item.blankWidthMM || '', blankLengthMM: item.blankLengthMM || '',
      blankWidthInch: item.blankWidthInch || '', blankLengthInch: item.blankLengthInch || '',
      sqft: item.sqft || '', weight: item.weight || '',
      sheetCostPerPiece: getSafeCostValue(item.sheetCostPerPiece), paintCostPerPiece: getSafeCostValue(item.paintCostPerPiece),
      stockInHand: item.stockInStore || '', minOrderQty: item.minimumStockLevel || '', unitOfMeasure: item.unitOfMeasure || 'Pieces'
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const item = storeItems.find(item => item._id === id)
    const partName = item?.partName || 'this item'
    
    toast.custom((t) => (
      <div className={`bg-white p-6 rounded-lg shadow-xl border border-gray-200 max-w-md ${dmSans.className}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete <span className="font-semibold">{partName}</span>? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id)
            try {
              setDeletingId(id)
              const res = await fetch('/api/store/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || data.details || 'Failed to delete')
              setStoreItems(prev => prev.filter(item => item._id !== id))
              toast.success(`${partName} deleted successfully!`, { duration: 4000 })
            } catch (err) { toast.error(err instanceof Error ? err.message : `Failed to delete ${partName}`) }
            finally { setDeletingId(null) }
          }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.partNumber || !formData.partName || !formData.storeLocation) { toast.error('Please fill in all required fields'); return }
    if (formData.stockInHand === '' || formData.minOrderQty === '') { toast.error('Please enter stock information'); return }
    setIsSubmitting(true)
    try {
      const currentPricePerKg = livePrices?.sheetPrices?.find(p => p.material === formData.material && p.gauge === formData.gauge)?.pricePerKg || 0
      const currentPaintPrice = livePrices?.paintPrice || 0
      const sqftValue = formData.sqft === '' ? 0 : Number(formData.sqft)
      const weightValue = formData.weight === '' ? 0 : Number(formData.weight)
      const calculatedSheetCost = currentPricePerKg * weightValue
      const calculatedPaintCost = currentPaintPrice * sqftValue
      
      const blankWidthInches = formData.blankWidthInch === '' ? 0 : Number(formData.blankWidthInch)
      const blankLengthInches = formData.blankLengthInch === '' ? 0 : Number(formData.blankLengthInch)
      
      let calculatedWeight = formData.weight === '' ? 0 : Number(formData.weight)
      if (calculatedWeight === 0 && formData.blankWidthMM && formData.blankLengthMM && formData.gauge && formData.material) {
        calculatedWeight = calculateWeight(
          formData.blankWidthMM,
          formData.blankLengthMM,
          formData.gauge,
          formData.material
        )
      }
      
      const newStoreItem = {
        partNumber: formData.partNumber, partName: formData.partName, category: formData.category,
        storeLocation: formData.storeLocation, gauge: formData.gauge || '', material: formData.material,
        blankWidthMM: formData.blankWidthMM === '' ? 0 : Number(formData.blankWidthMM),
        blankLengthMM: formData.blankLengthMM === '' ? 0 : Number(formData.blankLengthMM),
        blankWidthInch: blankWidthInches,
        blankLengthInch: blankLengthInches,
        sqft: sqftValue,
        weight: calculatedWeight,
        todaySheetPricePerKg: currentPricePerKg, 
        todayPaintCost: currentPaintPrice,
        sheetCostPerPiece: Math.round(calculatedSheetCost * 100) / 100, 
        paintCostPerPiece: Math.round(calculatedPaintCost * 100) / 100,
        stockInStore: Number(formData.stockInHand), 
        minimumStockLevel: Number(formData.minOrderQty), 
        unitOfMeasure: formData.unitOfMeasure
      }
      const response = await fetch('/api/store/add-item', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newStoreItem) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.details || 'Failed to add item')
      setStoreItems(prev => [result.data, ...prev])
      toast.success('Item added successfully!', { duration: 3000 })
      setIsAddModalOpen(false); resetForm()
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to add item') }
    finally { setIsSubmitting(false) }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.partNumber || !formData.partName || !formData.storeLocation) { toast.error('Please fill in all required fields'); return }
    if (formData.stockInHand === '' || formData.minOrderQty === '') { toast.error('Please enter stock information'); return }
    setIsSubmitting(true)
    try {
      const blankWidthInches = formData.blankWidthInch === '' ? 0 : Number(formData.blankWidthInch)
      const blankLengthInches = formData.blankLengthInch === '' ? 0 : Number(formData.blankLengthInch)
      
      const updateData = {
        id: editingItem?._id, partNumber: formData.partNumber, partName: formData.partName, category: formData.category,
        storeLocation: formData.storeLocation, gauge: formData.gauge || '', material: formData.material,
        blankWidthMM: formData.blankWidthMM === '' ? 0 : Number(formData.blankWidthMM),
        blankLengthMM: formData.blankLengthMM === '' ? 0 : Number(formData.blankLengthMM),
        blankWidthInch: blankWidthInches,
        blankLengthInch: blankLengthInches,
        sqft: formData.sqft === '' ? 0 : Number(formData.sqft),
        weight: formData.weight === '' ? 0 : Number(formData.weight),
        sheetCostPerPiece: formData.sheetCostPerPiece === '' ? 0 : Number(formData.sheetCostPerPiece),
        paintCostPerPiece: formData.paintCostPerPiece === '' ? 0 : Number(formData.paintCostPerPiece),
        stockInStore: Number(formData.stockInHand), 
        minimumStockLevel: Number(formData.minOrderQty), 
        unitOfMeasure: formData.unitOfMeasure
      }
      const response = await fetch('/api/store/edit', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update item')
      setStoreItems(prev => prev.map(item => item._id === editingItem?._id ? { ...item, ...updateData } : item))
      toast.success('Item updated successfully!', { duration: 3000 })
      setIsEditModalOpen(false); resetForm(); setEditingItem(null)
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to update item') }
    finally { setIsSubmitting(false) }
  }

  const handleCostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (costFormData.paintPrice === '') { toast.error('Please enter paint price'); return }
    setIsCostSubmitting(true)
    try {
      const costData = { 
        paintPrice: Number(costFormData.paintPrice), 
        sheetPrices: costFormData.sheetPrices.filter(sp => sp.pricePerKg > 0), 
        effectiveDate: new Date().toISOString() 
      }
      const response = await fetch('/api/store/costs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(costData) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update costs')
      setLivePrices({ 
        paintPrice: costData.paintPrice, 
        paintEffectiveDate: costData.effectiveDate, 
        sheetPrices: costData.sheetPrices, 
        sheetEffectiveDate: costData.effectiveDate, 
        _id: result.data._id 
      })
      toast.success('Costs updated successfully!', { duration: 3000 })
      setIsCostModalOpen(false)
      const storeResponse = await fetch('/api/store/add-item')
      if (storeResponse.ok) {
        const storeResult = await storeResponse.json()
        const itemsWithNumberCosts = storeResult.map((item: StoreItem) => ({ 
          ...item, 
          sheetCostPerPiece: typeof item.sheetCostPerPiece === 'string' ? parseFloat(item.sheetCostPerPiece) : item.sheetCostPerPiece, 
          paintCostPerPiece: typeof item.paintCostPerPiece === 'string' ? parseFloat(item.paintCostPerPiece) : item.paintCostPerPiece, 
          weight: item.weight || 0 
        }))
        setStoreItems(Array.isArray(itemsWithNumberCosts) ? itemsWithNumberCosts : [])
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to update costs') }
    finally { setIsCostSubmitting(false) }
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!returnItem) return
    
    if (returnFormData.returnQuantity <= 0) {
      toast.error('Please enter a valid return quantity')
      return
    }
    
    if (returnFormData.returnQuantity > returnItem.stockInStore) {
      toast.error(`Return quantity cannot exceed current stock (${returnItem.stockInStore})`)
      return
    }
    
    if (!returnFormData.returnReason) {
      toast.error('Please provide a reason for return')
      return
    }
    
    if (!returnFormData.returnedBy) {
      toast.error('Please enter who is returning the stock')
      return
    }
    
    setIsReturnSubmitting(true)
    
    try {
      const newStock = returnItem.stockInStore + returnFormData.returnQuantity
      
      const updateData = {
        id: returnItem._id,
        stockInStore: newStock
      }
      
      const response = await fetch('/api/store/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update stock')
      }
      
      setStoreItems(prev => prev.map(item => 
        item._id === returnItem._id 
          ? { ...item, stockInStore: newStock }
          : item
      ))
      
      handlePrintReturnPass(returnItem, returnFormData)
      
      toast.success(`Successfully returned ${returnFormData.returnQuantity} ${returnItem.unitOfMeasure}! Stock increased to ${newStock}`)
      setIsReturnModalOpen(false)
      setReturnItem(null)
      
    } catch (error) {
      console.error('Error processing return:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process return')
    } finally {
      setIsReturnSubmitting(false)
    }
  }

  // Print function for Store Pass
  const handlePrintStorePass = (item: StoreItem) => {
    setTimeout(() => {
      const stockStatus = getStockStatus(item.stockInStore, item.minimumStockLevel)
      const sheetCost = getSafeCostValue(item.sheetCostPerPiece)
      const paintCost = getSafeCostValue(item.paintCostPerPiece)
      const totalCost = sheetCost + paintCost
      
      const widthDisplay = `${item.blankWidthMM || 0} mm`
      const lengthDisplay = `${item.blankLengthMM || 0} mm`
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Store Pass - ${item.partNumber}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
                * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; }
                body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
                .print-container { max-width: 1100px; margin: 0 auto; border: 1px solid #000; padding: 0; position: relative; min-height: 95vh; display: flex; flex-direction: column; }
                .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding: 5px 15px 10px 15px; border-bottom: 2px solid #000; background: #fff; }
                .logo-placeholder { width: 250px; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #000; font-weight: 600; text-transform: uppercase; }
                .title-section { flex: 2; text-align: right; margin-top: -3px; }
                .main-title { font-size: 24px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.1em; }
                .challan-type { font-size: 16px; font-weight: bold; margin-top: 3px; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; }
                .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 3px 8px; vertical-align: top; }
                .info-label { font-weight: bold; white-space: nowrap; }
                .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; }
                .data-table th { background: #f0f0f0; padding: 6px 4px; text-align: center; font-weight: bold; border: 1px solid #000; }
                .data-table td { padding: 4px 4px; border: 1px solid #000; }
                .numeric-cell { text-align: right; }
                .center-cell { text-align: center; }
                .total-row { background: #e8f5e8 !important; font-weight: bold; }
                .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
                .status-instock { background: #d4edda; color: #155724; }
                .status-lowstock { background: #fff3cd; color: #856404; }
                .status-outofstock { background: #f8d7da; color: #721c24; }
                .signature-section { padding: 10px 15px 5px 15px; margin-top: auto; margin-bottom: 10px; }
                .signature-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-top: 5px; }
                .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
                .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
                .datetime-footer { text-align: left; padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; font-weight: bold; margin-top: auto; }
                .content-wrapper { display: flex; flex-direction: column; flex: 1; }
                @media print { body { padding: 3px; } .print-container { border: none; } }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header-section">
                  <div class="logo-section"><div class="logo-placeholder"><img src="/logo.png" alt="Logo" style="width:250px;height:100px;object-fit:contain" onerror="this.style.display='none';this.parentNode.innerHTML='STORE INVENTORY'"></div></div>
                  <div class="title-section"><div class="main-title">STORE PASS</div><div class="challan-type">INVENTORY CARD</div></div>
                </div>
                <div class="content-wrapper">
                  <div class="info-section">
                    <table class="info-table"><tbody>
                      <tr><td class="info-label">M/S Qadri Spray Tech</td><td></td><td class="info-label">Part Number:</td><td>${item.partNumber}</td></tr>
                      <tr><td class="info-label">Date:</td><td>${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</td><td class="info-label">Part Name:</td><td>${item.partName}</td></tr>
                      <tr><td class="info-label">Store Location:</td><td>${item.storeLocation}</td><td class="info-label">Material/Gauge:</td><td>${item.material || 'N/A'}/${item.gauge || 'N/A'}</td></tr>
                    </tbody></table>
                  </div>
                  <div class="table-section">
                    <table class="data-table"><thead><tr><th>S.No</th><th>Description</th><th>Width (mm)</th><th>Length (mm)</th><th>SQFT</th><th>Weight(kg)</th><th>Sheet Cost</th><th>Paint Cost</th><th>Total Cost</th></tr></thead>
                    <tbody><tr><td class="center-cell">1</td><td>${item.partName}</td>
                    <td class="numeric-cell">${widthDisplay}</td>
                    <td class="numeric-cell">${lengthDisplay}</td>
                    <td class="numeric-cell">${(item.sqft || 0).toFixed(2)}</td>
                    <td class="numeric-cell">${(item.weight || 0).toFixed(3)}</td>
                    <td class="numeric-cell">Rs ${sheetCost.toFixed(2)}</td>
                    <td class="numeric-cell">Rs ${paintCost.toFixed(2)}</td>
                    <td class="numeric-cell">Rs ${totalCost.toFixed(2)}</td></tr></tbody>
                    <tfoot><tr class="total-row"><td colspan="5" style="text-align:right">Stock Status:</td><td colspan="4"><span class="status-badge status-${stockStatus.text === 'In Stock' ? 'instock' : stockStatus.text === 'Low Stock' ? 'lowstock' : 'outofstock'}">${stockStatus.text}</span></td></tr>
                    <tr class="total-row"><td colspan="5" style="text-align:right">Current Stock:</td><td colspan="4">${item.stockInStore} ${item.unitOfMeasure}</td></tr>
                    <tr class="total-row"><td colspan="5" style="text-align:right">Minimum Stock Level:</td><td colspan="4">${item.minimumStockLevel} ${item.unitOfMeasure}</td></tr></tfoot>
                  </div>
                  <div class="signature-section"><div class="signature-grid"><div><div class="signature-line"></div><div class="signature-label">Store Dept.</div></div>
                  <div><div class="signature-line"></div><div class="signature-label">Mechanical Dept.</div></div>
                  <div><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
                  <div><div class="signature-line"></div><div class="signature-label">Received By</div></div></div></div>
                  <div class="datetime-footer">Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
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

  // Print function for Return Pass
  const handlePrintReturnPass = (item: StoreItem, returnData: ReturnFormData) => {
    const returnNumber = `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const sheetCost = getSafeCostValue(item.sheetCostPerPiece)
    const paintCost = getSafeCostValue(item.paintCostPerPiece)
    const totalCost = sheetCost + paintCost
    const returnTotalCost = totalCost * returnData.returnQuantity
    
    const widthDisplay = `${item.blankWidthMM || 0} mm`
    const lengthDisplay = `${item.blankLengthMM || 0} mm`
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Return Pass - ${item.partNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
              * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; }
              body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
              .print-container { max-width: 1100px; margin: 0 auto; border: 1px solid #000; padding: 0; position: relative; min-height: 95vh; display: flex; flex-direction: column; }
              .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding: 5px 15px 10px 15px; border-bottom: 2px solid #000; background: #fff; }
              .logo-placeholder { width: 250px; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #000; font-weight: 600; text-transform: uppercase; }
              .title-section { flex: 2; text-align: right; margin-top: -3px; }
              .main-title { font-size: 24px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.1em; }
              .challan-type { font-size: 16px; font-weight: bold; margin-top: 3px; padding: 4px 12px; border: 2px solid #000; display: inline-block; text-transform: uppercase; background: #fff3cd; }
              .info-section { padding: 8px 15px; border-bottom: 1px solid #000; }
              .info-table { width: 100%; border-collapse: collapse; }
              .info-table td { padding: 3px 8px; vertical-align: top; }
              .info-label { font-weight: bold; white-space: nowrap; }
              .data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; }
              .data-table th { background: #f0f0f0; padding: 6px 4px; text-align: center; font-weight: bold; border: 1px solid #000; }
              .data-table td { padding: 4px 4px; border: 1px solid #000; }
              .numeric-cell { text-align: right; }
              .center-cell { text-align: center; }
              .total-row { background: #fff3cd !important; font-weight: bold; }
              .signature-section { padding: 10px 15px 5px 15px; margin-top: auto; margin-bottom: 10px; }
              .signature-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-top: 5px; }
              .signature-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 3px; }
              .signature-label { font-weight: bold; text-align: center; font-size: 11px; }
              .datetime-footer { text-align: left; padding: 5px 15px; border-top: 1px solid #000; background: #f9f9f9; font-size: 11px; font-weight: bold; margin-top: auto; }
              .content-wrapper { display: flex; flex-direction: column; flex: 1; }
              @media print { body { padding: 3px; } .print-container { border: none; } }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="header-section">
                <div class="logo-section"><div class="logo-placeholder"><img src="/logo.png" alt="Logo" style="width:250px;height:100px;object-fit:contain" onerror="this.style.display='none';this.parentNode.innerHTML='STORE INVENTORY'"></div></div>
                <div class="title-section"><div class="main-title">STOCK RETURN PASS</div><div class="challan-type">RETURN SLIP</div></div>
              </div>
              <div class="content-wrapper">
                <div class="info-section">
                  <table class="info-table"><tbody>
                    <tr><td class="info-label">M/S Qadri Spray Tech</td><td></td><td class="info-label">Return Number:</td><td>${returnNumber}</td></tr>
                    <tr><td class="info-label">Date:</td><td>${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</td><td class="info-label">Part Number:</td><td>${item.partNumber}</td></tr>
                    <tr><td class="info-label">Part Name:</td><td>${item.partName}</td><td class="info-label">Store Location:</td><td>${item.storeLocation}</td></tr>
                    <tr><td class="info-label">Returned By:</td><td>${returnData.returnedBy}</td><td class="info-label">Reason:</td><td>${returnData.returnReason}</td></tr>
                  </tbody></table>
                </div>
                <div class="table-section">
                  <table class="data-table"><thead><tr><th>S.No</th><th>Description</th><th>Width (mm)</th><th>Length (mm)</th><th>SQFT</th><th>Weight(kg)</th><th>Cost/Piece</th><th>Return Qty</th><th>Total Value</th></tr></thead>
                  <tbody><tr><td class="center-cell">1</td><td>${item.partName} - ${item.material || 'N/A'} (${item.gauge || 'N/A'})</td>
                  <td class="numeric-cell">${widthDisplay}</td>
                  <td class="numeric-cell">${lengthDisplay}</td>
                  <td class="numeric-cell">${(item.sqft || 0).toFixed(2)}</td>
                  <td class="numeric-cell">${(item.weight || 0).toFixed(3)}</td>
                  <td class="numeric-cell">Rs ${totalCost.toFixed(2)}</td>
                  <td class="center-cell">${returnData.returnQuantity}</td>
                  <td class="numeric-cell">Rs ${returnTotalCost.toFixed(2)}</td></tr></tbody>
                  <tfoot><tr class="total-row"><td colspan="7" style="text-align:right">Total Return Value:</td><td class="center-cell">${returnData.returnQuantity}</td><td class="numeric-cell">Rs ${returnTotalCost.toFixed(2)}</td></tr>
                  <tr class="total-row"><td colspan="8" style="text-align:right">Stock After Return:</td><td class="numeric-cell">${item.stockInStore + returnData.returnQuantity} ${item.unitOfMeasure}</td></tr></tfoot>
                </div>
                <div class="signature-section"><div class="signature-grid"><div><div class="signature-line"></div><div class="signature-label">Store Dept.</div></div>
                <div><div class="signature-line"></div><div class="signature-label">Mechanical Dept.</div></div>
                <div><div class="signature-line"></div><div class="signature-label">Returned By</div></div>
                <div><div class="signature-line"></div><div class="signature-label">Received By</div></div></div></div>
                <div class="datetime-footer">Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
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

  const openReturnModal = (item: StoreItem) => {
    setReturnItem(item)
    setReturnFormData({
      returnQuantity: 0,
      returnReason: '',
      returnedBy: ''
    })
    setIsReturnModalOpen(true)
  }

  if (isLoading) {
    return <div className={`min-h-screen flex items-center justify-center bg-white ${dmSans.className}`}><div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div></div>
  }

  if (error) {
    return <div className={`min-h-screen bg-white ${dmSans.variable} font-sans`}><main className="max-w-7xl mx-auto px-4 py-10"><div className="bg-red-100 text-red-700 p-4 rounded-md"><p className="font-medium">{error}</p></div></main></div>
  }

  return (
    <ProtectedRoute allowedUser="mechanical">
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Toaster position="top-center" />
      <Sidebar />
      
      <main className={`max-w-7xl mx-auto px-4 py-10 space-y-8 transition-all duration-300 ${isAddModalOpen || isEditModalOpen || isCostModalOpen || isReturnModalOpen ? 'blur-sm pointer-events-none' : ''}`}>
        
        <div className="flex flex-col gap-6 border-b pb-6">
          <div className="space-y-2">
            <h1 className={`text-2xl sm:text-3xl pt-8 font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>Store Inventory Management</h1>
            <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>Manage parts, stock levels, returns, and gatepasses</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <span className="absolute left-3 top-2.5 text-gray-400"><HiSearch className="w-5 h-5" /></span>
              <input type="text" placeholder="Search by part number, name, category, material..." className={`w-full pl-10 pr-24 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none transition ${dmSans.className} tracking-wide text-sm`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-16 top-2.5 text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>}
              <button className="absolute right-1.5 top-1.5 px-3 py-1.5 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] transition">Search</button>
            </div>
            <div className="flex gap-3">
              <button onClick={openCostModal} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium">Update Costs</button>
              <button onClick={openAddModal} className="px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4a2f] transition text-sm font-medium">+ Add New Part</button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Total Parts</p><p className="text-2xl font-bold text-gray-800">{storeItems.length}</p></div>
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Low Stock Items</p><p className="text-2xl font-bold text-orange-600">{storeItems.filter(i => i.stockInStore <= i.minimumStockLevel && i.stockInStore > 0).length}</p></div>
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Out of Stock</p><p className="text-2xl font-bold text-red-600">{storeItems.filter(i => i.stockInStore <= 0).length}</p></div>
          <div className="bg-gray-50 rounded-lg p-4 border"><p className="text-sm text-gray-500">Total Gatepasses</p><p className="text-2xl font-bold text-gray-800">{storeItems.reduce((sum, i) => sum + (i.gatepasses?.length || 0), 0)}</p></div>
        </div>

        {/* Market Prices Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Market Prices</h3>
              <div className="mb-4"><p className="text-xs text-gray-500">Paint Price (per sqft)</p><p className="text-lg font-bold text-blue-700">Rs {livePrices?.paintPrice?.toFixed(2) || '0.00'} PKR</p><p className="text-xs text-gray-400">Updated: {formatDate(livePrices?.paintEffectiveDate)}</p></div>
              <div><p className="text-xs text-gray-500 mb-2">Material Prices (per kg)</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className="text-xs text-gray-600"><th className="text-left py-1">Material</th><th className="text-left py-1">Gauge</th><th className="text-right py-1">Price per Kg (PKR)</th><th className="text-right py-1">Cost per Piece</th></tr></thead>
                    <tbody>
                      {livePrices?.sheetPrices?.map((price, idx) => {
                        // Find matching items to show sample cost
                        const matchingItem = storeItems.find(item => item.material === price.material && item.gauge === price.gauge)
                        const sampleCost = matchingItem?.weight ? (price.pricePerKg || 0) * matchingItem.weight : 0
                        return (
                          <tr key={idx} className="border-t border-green-100">
                            <td className="py-1">{price.material}</td>
                            <td className="py-1">{price.gauge}</td>
                            <td className="text-right py-1">Rs {(price.pricePerKg || 0).toFixed(2)}</td>
                            <td className="text-right py-1 text-xs text-gray-500">{matchingItem ? `~Rs ${sampleCost.toFixed(2)}` : '-'}</td>
                          </tr>
                        )
                      })}
                      {(!livePrices?.sheetPrices || livePrices.sheetPrices.length === 0) && (
                        <tr><td colSpan={4} className="text-center text-gray-400 py-2">No material prices configured</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 mt-1">Updated: {formatDate(livePrices?.sheetEffectiveDate)}</p>
              </div>
            </div>
            <button onClick={openCostModal} className="text-sm text-green-600 hover:text-green-700 font-medium ml-4">Update Prices →</button>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <table className={`w-full table-auto divide-y divide-gray-200 ${dmSans.className} text-xs`}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Sr#</th>
                  <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Part #</th>
                  <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Part Name</th>
                  <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Category</th>
                  <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Location</th>
                  <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Mat/Gauge</th>
                  <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">W(mm)</th>
                  <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">L(mm)</th>
                  <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">SQFT</th>
                  <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">Wt(kg)</th>
                  <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">Stock</th>
                  <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Unit</th>
                  <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">Sheet</th>
                  <th className="px-2 py-2 text-right text-[11px] font-medium text-gray-700">Paint</th>
                  <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-700">Status</th>
                  <th className="px-2 py-2 text-center text-[11px] font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr><td colSpan={16} className="px-4 py-4 text-center text-sm text-gray-500">No items found</td></tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    const stockStatus = getStockStatus(item.stockInStore, item.minimumStockLevel)
                    const sheetCost = getSafeCostValue(item.sheetCostPerPiece)
                    const paintCost = getSafeCostValue(item.paintCostPerPiece)
                    const widthDisplay = `${item.blankWidthMM || 0}`
                    const lengthDisplay = `${item.blankLengthMM || 0}`
                    return <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700">{idx + 1}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] font-medium text-gray-900">{item.partNumber}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700">{item.partName}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700"><span className="capitalize">{item.category}</span></td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700">{item.storeLocation}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700">{item.material || '-'}/{item.gauge || '-'}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">{widthDisplay}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">{lengthDisplay}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">{item.sqft || 0}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">{(item.weight || 0).toFixed(2)}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">{item.stockInStore}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-gray-700">{item.unitOfMeasure}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">Rs {sheetCost.toFixed(0)}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right text-gray-700">Rs {paintCost.toFixed(0)}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px]"><span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] ${stockStatus.bg} ${stockStatus.color}`}>{stockStatus.text}</span></td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] space-x-1 text-center">
                        <button onClick={() => handlePrintStorePass(item)} className="text-blue-600 hover:text-blue-800 font-medium text-[10px]"><HiPrinter className="inline w-3 h-3 mr-0.5" /> Print</button>
                        <button onClick={() => openReturnModal(item)} className="text-green-600 hover:text-green-800 font-medium text-[10px] ml-1">Return</button>
                        <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-medium text-[10px] ml-1">Edit</button>
                        <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id} className={`text-red-600 hover:text-red-800 font-medium text-[10px] ml-1 ${deletingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}>{deletingId === item._id ? 'Del' : 'Delete'}</button>
                      </td>
                    </tr>
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Return Stock Modal */}
      {isReturnModalOpen && returnItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsReturnModalOpen(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Return Stock</h2>
                <button onClick={() => setIsReturnModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Part Name</p>
                  <p className="font-medium">{returnItem.partName}</p>
                  <p className="text-sm text-gray-600 mt-2">Current Stock</p>
                  <p className="text-lg font-bold text-blue-600">{returnItem.stockInStore} {returnItem.unitOfMeasure}</p>
                  <p className="text-sm text-gray-600 mt-2">Weight per Piece</p>
                  <p className="font-medium">{(returnItem.weight || 0).toFixed(3)} kg</p>
                  <p className="text-sm text-gray-600 mt-2">Cost per Piece</p>
                  <p className="font-medium">Rs {(getSafeCostValue(returnItem.sheetCostPerPiece) + getSafeCostValue(returnItem.paintCostPerPiece)).toFixed(2)}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Return Quantity *</label>
                  <input type="number" name="returnQuantity" value={returnFormData.returnQuantity} onChange={handleReturnChange} required min="1" max={returnItem.stockInStore} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                  <p className="text-xs text-gray-500 mt-1">Maximum: {returnItem.stockInStore} {returnItem.unitOfMeasure}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Return Reason *</label>
                  <select name="returnReason" value={returnFormData.returnReason} onChange={handleReturnChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                    <option value="">Select Reason</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Wrong Part">Wrong Part</option>
                    <option value="Excess Quantity">Excess Quantity</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Returned By *</label>
                  <input type="text" name="returnedBy" value={returnFormData.returnedBy} onChange={handleReturnChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="Name of person returning" />
                </div>
                {returnFormData.returnReason === 'Other' && (
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Specify Reason</label>
                    <textarea name="returnReason" value={returnFormData.returnReason} onChange={handleReturnChange} rows={2} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="Please specify..." />
                  </div>
                )}
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">After return, stock will increase to: <strong>{returnItem.stockInStore + returnFormData.returnQuantity}</strong> {returnItem.unitOfMeasure}</p>
                  <p className="text-xs text-yellow-600 mt-1">A return pass will be printed automatically.</p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setIsReturnModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={isReturnSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">{isReturnSubmitting ? 'Processing...' : 'Process Return'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Costs Modal */}
      {isCostModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsCostModalOpen(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Update Market Prices</h2>
                <button onClick={() => { setIsCostModalOpen(false); resetCostForm(); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCostSubmit} className="p-6 space-y-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className={`text-lg font-semibold text-blue-800 mb-4 ${dmSans.className}`}>🎨 Paint Price (per sqft)</h3>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${dmSans.className}`}>Paint Price per Sqft <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">Rs</span>
                      <input type="number" value={costFormData.paintPrice} onChange={handlePaintPriceChange} required step="0.01" min="0" className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none" placeholder="0.00" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Current price: Rs {livePrices?.paintPrice?.toFixed(2) || '0.00'} PKR</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold text-green-800 ${dmSans.className}`}>📄 Material Prices (per kg)</h3>
                    <button type="button" onClick={addSheetPriceRow} className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">+ Add Price</button>
                  </div>
                  <div className="mb-4 text-sm text-gray-600 bg-white p-3 rounded border border-green-100">
                    <p className="font-medium">Note:</p>
                    <p>Material cost is calculated as: Weight (kg) × Price per kg</p>
                    <p>Weight is automatically calculated based on part dimensions, material, and gauge</p>
                  </div>
                  <div className="space-y-3">
                    {costFormData.sheetPrices.map((price, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-green-100">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>Material</label>
                            <select value={price.material} onChange={(e) => handleSheetPriceChange(index, 'material', e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                              <option value="GI">GI (Galvanized Iron)</option>
                              <option value="MS">MS (Mild Steel)</option>
                              <option value="Aluminum">Aluminum</option>
                              <option value="StainlessSteel">Stainless Steel</option>
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>Gauge</label>
                            <select value={price.gauge} onChange={(e) => handleSheetPriceChange(index, 'gauge', e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                              <option value="10G">10G</option>
                              <option value="12G">12G</option>
                              <option value="14G">14G</option>
                              <option value="16G">16G</option>
                              <option value="18G">18G</option>
                              <option value="20G">20G</option>
                              <option value="22G">22G</option>
                              <option value="24G">24G</option>
                              <option value="26G">26G</option>
                              <option value="28G">28G</option>
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>Price per Kg (Rs)</label>
                            <input type="number" value={price.pricePerKg} onChange={(e) => handleSheetPriceChange(index, 'pricePerKg', e.target.value)} step="0.01" min="0" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="0.00" />
                          </div>
                          <div className="flex items-end">
                            <button type="button" onClick={() => removeSheetPriceRow(index)} className="px-3 py-2 text-red-600 hover:text-red-800">Remove ✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {costFormData.sheetPrices.length === 0 && <div className="text-center text-gray-400 py-4">No material prices added. Click &quot;Add Price&quot; to add.</div>}
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-700">Updating these prices will affect all new store items. Existing items will keep their original costs.</p>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button type="button" onClick={() => { setIsCostModalOpen(false); resetCostForm(); }} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={isCostSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">{isCostSubmitting ? 'Updating...' : 'Update Costs'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add New Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Add New Part</h2>
                <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Part Number *</label><input type="text" name="partNumber" value={formData.partNumber} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="e.g., P-001" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Part Name *</label><input type="text" name="partName" value={formData.partName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="Part name" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none"><option value="raw">Raw Material</option><option value="finished">Finished Goods</option><option value="packaging">Packaging</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Store Location *</label><input type="text" name="storeLocation" value={formData.storeLocation} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="e.g., Shelf A3" /></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Material Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gauge *</label>
                      <select name="gauge" value={formData.gauge} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                        <option value="">Select Gauge</option>
                        <option value="10G">10G (3.416mm)</option>
                        <option value="12G">12G (2.642mm)</option>
                        <option value="14G">14G (1.897mm)</option>
                        <option value="16G">16G (1.519mm)</option>
                        <option value="18G">18G (1.214mm)</option>
                        <option value="20G">20G (0.912mm)</option>
                        <option value="22G">22G (0.759mm)</option>
                        <option value="24G">24G (0.607mm)</option>
                        <option value="26G">26G (0.455mm)</option>
                        <option value="28G">28G (0.378mm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                      <select name="material" value={formData.material} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                        <option value="GI">GI (Galvanized Iron)</option>
                        <option value="MS">MS (Mild Steel)</option>
                        <option value="Aluminum">Aluminum</option>
                        <option value="StainlessSteel">Stainless Steel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blank Width (mm) *</label>
                      <input type="number" name="blankWidthMM" value={formData.blankWidthMM} onChange={handleChange} step="0.01" required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="e.g., 610" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blank Length (mm) *</label>
                      <input type="number" name="blankLengthMM" value={formData.blankLengthMM} onChange={handleChange} step="0.01" required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="e.g., 914" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Auto-Calculated Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">SQFT (Auto)</label>
                      <p className="text-2xl font-bold text-blue-600">{formData.sqft || '0'} sqft</p>
                      <p className="text-xs text-gray-500">Width × Length in inches ÷ 144</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) - AUTO</label>
                      <p className="text-2xl font-bold text-teal-600">{formData.weight || '0'} kg</p>
                      <p className="text-xs text-gray-500">Based on material, gauge & mm dimensions</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sheet Cost (Rs) — AUTO</label>
                      <p className="text-2xl font-bold text-green-600">Rs {formData.sheetCostPerPiece?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-gray-500">Weight (kg) × Price per kg</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paint Cost (Rs) — AUTO</label>
                      <p className="text-2xl font-bold text-purple-600">Rs {formData.paintCostPerPiece?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-gray-500">SQFT × Paint price per sqft</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Stock Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Stock in Hand *</label><input type="number" name="stockInHand" value={formData.stockInHand} onChange={handleNumberChange} required min="0" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="0" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Min Order Qty (MOQ) *</label><input type="number" name="minOrderQty" value={formData.minOrderQty} onChange={handleNumberChange} required min="0" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" placeholder="e.g., 50" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label><select name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none"><option value="Pieces">Pieces</option><option value="Kg">Kg</option><option value="Liters">Liters</option><option value="Meters">Meters</option><option value="Sheets">Sheets</option></select></div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button type="button" onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] disabled:opacity-50">{isSubmitting ? 'Adding...' : 'Add Part'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Part Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-[#8B5E3C] ${dmSans.className}`}>Edit Part: {editingItem.partName}</h2>
                <button onClick={() => { setIsEditModalOpen(false); resetForm(); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Part Number *</label><input type="text" name="partNumber" value={formData.partNumber} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Part Name *</label><input type="text" name="partName" value={formData.partName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none"><option value="raw">Raw Material</option><option value="finished">Finished Goods</option><option value="packaging">Packaging</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Store Location *</label><input type="text" name="storeLocation" value={formData.storeLocation} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Material Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gauge *</label>
                      <select name="gauge" value={formData.gauge} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                        <option value="">Select Gauge</option>
                        <option value="10G">10G (3.416mm)</option>
                        <option value="12G">12G (2.642mm)</option>
                        <option value="14G">14G (1.897mm)</option>
                        <option value="16G">16G (1.519mm)</option>
                        <option value="18G">18G (1.214mm)</option>
                        <option value="20G">20G (0.912mm)</option>
                        <option value="22G">22G (0.759mm)</option>
                        <option value="24G">24G (0.607mm)</option>
                        <option value="26G">26G (0.455mm)</option>
                        <option value="28G">28G (0.378mm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                      <select name="material" value={formData.material} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                        <option value="GI">GI (Galvanized Iron)</option>
                        <option value="MS">MS (Mild Steel)</option>
                        <option value="Aluminum">Aluminum</option>
                        <option value="StainlessSteel">Stainless Steel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blank Width (mm)</label>
                      <input type="number" name="blankWidthMM" value={formData.blankWidthMM} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blank Length (mm)</label>
                      <input type="number" name="blankLengthMM" value={formData.blankLengthMM} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Cost Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm"><label className="block text-sm font-medium text-gray-700 mb-2">SQFT</label><p className="text-xl font-bold text-blue-600">{formData.sqft || '0'} sqft</p></div>
                    <div className="bg-white rounded-lg p-4 shadow-sm"><label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label><p className="text-xl font-bold text-teal-600">{formData.weight || '0'} kg</p></div>
                    <div className="bg-white rounded-lg p-4 shadow-sm"><label className="block text-sm font-medium text-gray-700 mb-2">Sheet Cost (Rs)</label><input type="number" name="sheetCostPerPiece" value={formData.sheetCostPerPiece} onChange={handleNumberChange} step="0.01" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                    <div className="bg-white rounded-lg p-4 shadow-sm"><label className="block text-sm font-medium text-gray-700 mb-2">Paint Cost (Rs)</label><input type="number" name="paintCostPerPiece" value={formData.paintCostPerPiece} onChange={handleNumberChange} step="0.01" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${dmSans.className}`}>Stock Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Stock in Hand *</label><input type="number" name="stockInHand" value={formData.stockInHand} onChange={handleNumberChange} required min="0" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Min Order Qty (MOQ) *</label><input type="number" name="minOrderQty" value={formData.minOrderQty} onChange={handleNumberChange} required min="0" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label><select name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#8B5E3C] outline-none"><option value="Pieces">Pieces</option><option value="Kg">Kg</option><option value="Liters">Liters</option><option value="Meters">Meters</option><option value="Sheets">Sheets</option></select></div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button type="button" onClick={() => { setIsEditModalOpen(false); resetForm(); setEditingItem(null); }} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-[#8B5E3C] rounded-md hover:bg-[#6d4a2f] disabled:opacity-50">{isSubmitting ? 'Updating...' : 'Update Part'}</button>
                </div>
              </form>
            </div>
          </div >
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}

export const dynamic = 'force-dynamic'