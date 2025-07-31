'use client'

import { useState } from 'react'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import { useRouter } from 'next/navigation'
import Sidebar from '@/app/Components/sidebar'
import { DM_Sans } from 'next/font/google'
import toast, { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

const categoryOptions = [
  { value: 'main_incoming_breaker', label: 'Main Incoming Breaker – MCCB / ACB / MCB' },
  { value: 'isolator', label: 'Isolator / Disconnect Switch' },
  { value: 'busbars', label: 'Busbars – Copper or Aluminum' },
  { value: 'outgoing_breakers', label: 'Outgoing Breakers – MCBs / MCCBs' },
  { value: 'contactors', label: 'Contactors – Motor / Load Control' },
  { value: 'overload_relays', label: 'Overload Relays – Motor Protection' },
  { value: 'control_transformer', label: 'Control Transformer / Power Supply' },
  { value: 'current_transformers', label: 'Current Transformers (CTs)' },
  { value: 'meters', label: 'Meters – Voltmeter, Ammeter, Energy Meter' },
  { value: 'phase_relays', label: 'Phase Sequence / Phase Failure Relays' },
  { value: 'surge_protection', label: 'Surge Protection Device (SPD)' },
  { value: 'earth_leakage', label: 'Earth Leakage / RCCB' },
  { value: 'push_buttons', label: 'Push Buttons & Selector Switches' },
  { value: 'indicator_lamps', label: 'Indicator Lamps / Pilot Lamps' },
  { value: 'alarm_buzzer', label: 'Alarm Buzzer – Fault Indication' },
  { value: 'terminal_blocks', label: 'Terminal Blocks – Organized Wiring' },
  { value: 'wiring_ducts', label: 'Wiring Ducts & Cables – Internal Wiring' },
  { value: 'earthing_bar', label: 'Earthing Bar – Grounding Connection' },
]

const unitOptions = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'm', label: 'Meters' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'set', label: 'Set' },
]

export default function AddInventoryItem() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    itemName: '',
    sku: '',
    category: '',
    description: '',
    quantity: 0,
    unit: 'pcs',
    location: '',
    supplier: '',
    reorderLevel: 5,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'reorderLevel' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.itemName || !formData.sku || !formData.category) {
      setError('Please fill in all required fields (Item Name, SKU, and Category)')
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.quantity < 0) {
      setError('Quantity cannot be negative')
      toast.error('Quantity cannot be negative')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add item')
      }

      // Show success notification
      toast.success('Item added successfully!', {
        duration: 4000,
        position: 'top-center',
        icon: '✅',
        style: {
          background: '#f0fdf4',
          color: '#166534',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: 500,
        },
      })

      router.push('/inventory')
      router.refresh()
    } catch (err: unknown) {
      console.error('Error adding item:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item. Please try again.'
      setError(errorMessage)
      
      // Show error notification
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#b91c1c',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: 500,
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedUser='store'>
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      {/* Toast Notifications Container */}
      <Toaster />
      
      <Sidebar />
      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        {/* Header Section */}
        <div className="flex justify-between items-start pb-4">
          <div className="space-y-1">
            <h1 className={`text-2xl font-bold pt-12 pl-4 text-[#8B5E3C] ${dmSans.className}`}>
              Add New Inventory Item
            </h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
            <p className={`text-red-700 text-sm ${dmSans.className}`}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Name */}
            <div className="col-span-2 bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 pb-2 border-b ${dmSans.className}`}>
                Basic Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                    placeholder="Enter item name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                      SKU / Part Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                    >
                      <option value="">Select a category</option>
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                    rows={2}
                    placeholder="Enter description (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Inventory Details */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 pb-2 border-b ${dmSans.className}`}>
                Inventory Details
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min={0}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                      Unit of Measure
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                    >
                      {unitOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    min={0}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                    Storage Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                    placeholder="e.g., Shelf A1"
                  />
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 pb-2 border-b ${dmSans.className}`}>
                Supplier Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                    Supplier
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/inventory')}
              className={`px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${dmSans.className}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-3 py-1.5 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${dmSans.className}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Item'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
    </ProtectedRoute>
  )
}