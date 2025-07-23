'use client'

import { useState, useMemo } from 'react'
import { SearchIcon, Pencil, X, Trash } from 'lucide-react'
import { DM_Sans } from 'next/font/google'
import toast from 'react-hot-toast'

export interface InventoryItem {
  _id: string
  itemName: string
  sku: string
  category: string
  description?: string
  quantity: number
  unit?: string
  location?: string
  supplier?: string
  reorderLevel: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  lastUpdated?: string
  image?: {
    asset?: { url: string }
  }
}

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] })

const formatCategory = (cat: string) =>
  cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Karachi',
    })
  } catch {
    return 'Invalid Date'
  }
}

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null) // ✅ NEW state for delete modal
  const [editQuantity, setEditQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false) // ✅ Track delete loading

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items
    const term = searchTerm.toLowerCase().trim()
    return items.filter((item) =>
      [
        item.itemName?.toLowerCase().includes(term),
        item.sku?.toLowerCase().includes(term),
        item.category?.toLowerCase().includes(term),
        formatCategory(item.category).toLowerCase().includes(term),
        item.description?.toLowerCase().includes(term),
        item.location?.toLowerCase().includes(term),
        item.supplier?.toLowerCase().includes(term),
      ].some(Boolean)
    )
  }, [items, searchTerm])

  const renderSupplier = (supplier?: string) => {
    if (!supplier) return <span>—</span>
    const [first, ...rest] = supplier.split(' ')
    return (
      <span>
        <span className="font-medium">{first}</span>
        {rest.length ? ` ${rest.join(' ')}` : ''}
      </span>
    )
  }

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item)
    setEditQuantity(item.quantity.toString())
  }

  const handleUpdateStock = async () => {
    if (!editingItem) return
    const updatedQty = Number(editQuantity)
    if (isNaN(updatedQty)) return toast.error('❌ Enter a valid quantity')

    try {
      setLoading(true)
      const res = await fetch('/api/inventory/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem._id,
          quantity: updatedQty,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')
      toast.success('✅ Stock updated successfully!')
      setEditingItem(null)
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast.error('❌ Error updating stock')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (item: InventoryItem) => {
    setDeletingItem(item) // ✅ Show custom modal
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    try {
      setDeleting(true)
      const res = await fetch('/api/inventory/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingItem._id }),
      })

      if (!res.ok) throw new Error('Failed to delete item')

      toast.success(`🗑️ Deleted "${deletingItem.itemName}"`)
      setDeletingItem(null) // ✅ Close modal
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast.error('❌ Error deleting item')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={`space-y-6 ${dmSans.className}`}>
      {/* ✅ Search bar */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by item, SKU, category, supplier, etc..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ✅ Table */}
      <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const lowStock = item.quantity <= item.reorderLevel
              const imageUrl = item.image?.asset?.url

              return (
                <tr key={item._id} className="hover:bg-gray-50">
                  {/* ✅ Item */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {imageUrl && (
                        <img src={imageUrl} alt={item.itemName} className="w-10 h-10 rounded-md object-cover" />
                      )}
                      <div>
                        <div className="font-medium text-[#8B5E3C]">{item.itemName}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ✅ Other columns */}
                  <td className="px-4 py-4 text-sm text-gray-500">{item.sku}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{formatCategory(item.category)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`${lowStock ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                      {item.quantity} {item.unit === 'pcs' ? 'pcs' : item.unit}
                    </span>
                    {lowStock && (
                      <div className="text-xs text-red-500">Reorder at {item.reorderLevel}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{item.location || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{renderSupplier(item.supplier)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'in_stock'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'low_stock'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status === 'in_stock'
                        ? 'In Stock'
                        : item.status === 'low_stock'
                        ? 'Low Stock'
                        : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{formatDate(item.lastUpdated)}</td>

                  {/* ✅ Actions */}
                  <td className="px-4 py-4 whitespace-nowrap flex gap-2 text-sm text-gray-500">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-[#8B5E3C] hover:text-[#6d4b30]"
                      title="Edit item"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete item"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#8B5E3C]">
                Edit Stock - {editingItem.itemName}
              </h2>
              <button onClick={() => setEditingItem(null)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              className="w-full border rounded-md p-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleUpdateStock}
                className="px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4b30]"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-red-600">Confirm Delete</h2>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete <b>{deletingItem.itemName}</b>? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
