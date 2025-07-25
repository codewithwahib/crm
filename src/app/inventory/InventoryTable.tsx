// 'use client'

// import { useState, useMemo } from 'react'
// import { SearchIcon, Pencil, X, Trash } from 'lucide-react'
// import { DM_Sans } from 'next/font/google'
// import toast from 'react-hot-toast'

// export interface InventoryItem {
//   _id: string
//   itemName: string
//   sku: string
//   category: string
//   description?: string
//   quantity: number
//   unit?: string
//   location?: string
//   supplier?: string
//   reorderLevel: number
//   status: 'in_stock' | 'low_stock' | 'out_of_stock'
//   lastUpdated?: string
//   image?: {
//     asset?: { url: string }
//   }
// }

// const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] })

// const formatCategory = (cat: string) =>
//   cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// const formatDate = (dateString?: string) => {
//   if (!dateString) return 'N/A'
//   try {
//     const date = new Date(dateString)
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       timeZone: 'Asia/Karachi',
//     })
//   } catch {
//     return 'Invalid Date'
//   }
// }

// export function InventoryTable({ items }: { items: InventoryItem[] }) {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
//   const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)
//   const [editQuantity, setEditQuantity] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [deleting, setDeleting] = useState(false)
//   const [expandedItem, setExpandedItem] = useState<string | null>(null)

//   const filteredItems = useMemo(() => {
//     if (!searchTerm.trim()) return items
//     const term = searchTerm.toLowerCase().trim()
//     return items.filter((item) =>
//       [
//         item.itemName?.toLowerCase().includes(term),
//         item.sku?.toLowerCase().includes(term),
//         item.category?.toLowerCase().includes(term),
//         formatCategory(item.category).toLowerCase().includes(term),
//         item.description?.toLowerCase().includes(term),
//         item.location?.toLowerCase().includes(term),
//         item.supplier?.toLowerCase().includes(term),
//       ].some(Boolean)
//     )
//   }, [items, searchTerm])

//   const renderSupplier = (supplier?: string) => {
//     if (!supplier) return <span>—</span>
//     const [first, ...rest] = supplier.split(' ')
//     return (
//       <span>
//         <span className="font-medium">{first}</span>
//         {rest.length ? ` ${rest.join(' ')}` : ''}
//       </span>
//     )
//   }

//   const toggleExpandItem = (id: string) => {
//     setExpandedItem(expandedItem === id ? null : id)
//   }

//   const handleEditClick = (item: InventoryItem) => {
//     setEditingItem(item)
//     setEditQuantity(item.quantity.toString())
//   }

//   const handleUpdateStock = async () => {
//     if (!editingItem) return
//     const updatedQty = Number(editQuantity)
//     if (isNaN(updatedQty)) return toast.error('❌ Enter a valid quantity')

//     try {
//       setLoading(true)
//       const res = await fetch('/api/inventory/update', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           id: editingItem._id,
//           quantity: updatedQty,
//         }),
//       })

//       if (!res.ok) throw new Error('Failed to update')
//       toast.success('✅ Stock updated successfully!')
//       setEditingItem(null)
//       window.location.reload()
//     } catch (err) {
//       console.error(err)
//       toast.error('❌ Error updating stock')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const confirmDelete = (item: InventoryItem) => {
//     setDeletingItem(item)
//   }

//   const handleDeleteConfirm = async () => {
//     if (!deletingItem) return
//     try {
//       setDeleting(true)
//       const res = await fetch('/api/inventory/delete', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id: deletingItem._id }),
//       })

//       if (!res.ok) throw new Error('Failed to delete item')

//       toast.success(`🗑️ Deleted "${deletingItem.itemName}"`)
//       setDeletingItem(null)
//       window.location.reload()
//     } catch (err) {
//       console.error(err)
//       toast.error('❌ Error deleting item')
//     } finally {
//       setDeleting(false)
//     }
//   }

//   return (
//     <div className={`space-y-6 ${dmSans.className}`}>
//       {/* Search bar - same for all screens */}
//       <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
//         <div className="p-4 border-b">
//           <div className="relative w-full max-w-2xl">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <SearchIcon className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by item, SKU, category, supplier, etc..."
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C]"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Desktop Table (lg screens and up) */}
//       <div className="hidden lg:block overflow-x-auto bg-white rounded-lg border shadow-sm">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {filteredItems.map((item) => {
//               const lowStock = item.quantity <= item.reorderLevel
//               const imageUrl = item.image?.asset?.url

//               return (
//                 <tr key={item._id} className="hover:bg-gray-50">
//                   {/* Item */}
//                   <td className="px-4 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-3">
//                       {imageUrl && (
//                         <img src={imageUrl} alt={item.itemName} className="w-10 h-10 rounded-md object-cover" />
//                       )}
//                       <div>
//                         <div className="font-medium text-[#8B5E3C]">{item.itemName}</div>
//                         {item.description && (
//                           <div className="text-sm text-gray-500 truncate max-w-xs">
//                             {item.description}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </td>

//                   {/* Other columns */}
//                   <td className="px-4 py-4 text-sm text-gray-500">{item.sku}</td>
//                   <td className="px-4 py-4 text-sm text-gray-500">{formatCategory(item.category)}</td>
//                   <td className="px-4 py-4 whitespace-nowrap">
//                     <span className={`${lowStock ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
//                       {item.quantity} {item.unit === 'pcs' ? 'pcs' : item.unit}
//                     </span>
//                     {lowStock && (
//                       <div className="text-xs text-red-500">Reorder at {item.reorderLevel}</div>
//                     )}
//                   </td>
//                   <td className="px-4 py-4 text-sm text-gray-500">{item.location || 'N/A'}</td>
//                   <td className="px-4 py-4 text-sm text-gray-500">{renderSupplier(item.supplier)}</td>
//                   <td className="px-4 py-4 whitespace-nowrap">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         item.status === 'in_stock'
//                           ? 'bg-green-100 text-green-800'
//                           : item.status === 'low_stock'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}
//                     >
//                       {item.status === 'in_stock'
//                         ? 'In Stock'
//                         : item.status === 'low_stock'
//                         ? 'Low Stock'
//                         : 'Out of Stock'}
//                     </span>
//                   </td>
//                   <td className="px-4 py-4 text-sm text-gray-500">{formatDate(item.lastUpdated)}</td>

//                   {/* Actions */}
//                   <td className="px-4 py-4 whitespace-nowrap flex gap-2 text-sm text-gray-500">
//                     <button
//                       onClick={() => handleEditClick(item)}
//                       className="text-[#8B5E3C] hover:text-[#6d4b30]"
//                       title="Edit item"
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => confirmDelete(item)}
//                       className="text-red-600 hover:text-red-800"
//                       title="Delete item"
//                     >
//                       <Trash className="h-4 w-4" />
//                     </button>
//                   </td>
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Mobile List View (below lg screens) */}
//       <div className="lg:hidden space-y-4">
//         {filteredItems.map((item) => {
//           const lowStock = item.quantity <= item.reorderLevel
//           const imageUrl = item.image?.asset?.url
//           const isExpanded = expandedItem === item._id

//           return (
//             <div key={item._id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
//               <div 
//                 className="p-4 flex justify-between items-center cursor-pointer"
//                 onClick={() => toggleExpandItem(item._id)}
//               >
//                 <div className="flex items-center gap-3">
//                   {imageUrl && (
//                     <img src={imageUrl} alt={item.itemName} className="w-12 h-12 rounded-md object-cover" />
//                   )}
//                   <div>
//                     <h3 className="font-medium text-[#8B5E3C]">{item.itemName}</h3>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           item.status === 'in_stock'
//                             ? 'bg-green-100 text-green-800'
//                             : item.status === 'low_stock'
//                             ? 'bg-yellow-100 text-yellow-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {item.status === 'in_stock'
//                           ? 'In Stock'
//                           : item.status === 'low_stock'
//                           ? 'Low Stock'
//                           : 'Out of Stock'}
//                       </span>
//                       <span className={`text-sm ${lowStock ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
//                         {item.quantity} {item.unit === 'pcs' ? 'pcs' : item.unit}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-gray-500">
//                   {isExpanded ? (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
//                     </svg>
//                   ) : (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                   )}
//                 </div>
//               </div>

//               {isExpanded && (
//                 <div className="px-4 pb-4 space-y-3">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-xs text-gray-500">SKU</p>
//                       <p className="text-sm">{item.sku}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Category</p>
//                       <p className="text-sm">{formatCategory(item.category)}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Location</p>
//                       <p className="text-sm">{item.location || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Supplier</p>
//                       <p className="text-sm">{item.supplier || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Last Updated</p>
//                       <p className="text-sm">{formatDate(item.lastUpdated)}</p>
//                     </div>
//                     {lowStock && (
//                       <div className="col-span-2">
//                         <p className="text-xs text-red-500">Reorder at {item.reorderLevel}</p>
//                       </div>
//                     )}
//                   </div>

//                   {item.description && (
//                     <div>
//                       <p className="text-xs text-gray-500">Description</p>
//                       <p className="text-sm">{item.description}</p>
//                     </div>
//                   )}

//                   <div className="flex justify-end gap-2 pt-2">
//                     <button
//                       onClick={() => handleEditClick(item)}
//                       className="px-3 py-1 flex items-center gap-1 text-sm text-[#8B5E3C] hover:bg-[#8B5E3C]/10 rounded"
//                     >
//                       <Pencil className="h-4 w-4" />
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => confirmDelete(item)}
//                       className="px-3 py-1 flex items-center gap-1 text-sm text-red-600 hover:bg-red-100 rounded"
//                     >
//                       <Trash className="h-4 w-4" />
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )
//         })}
//       </div>

//       {/* Edit Modal */}
//       {editingItem && (
//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-bold text-[#8B5E3C]">
//                 Edit Stock - {editingItem.itemName}
//               </h2>
//               <button onClick={() => setEditingItem(null)}>
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
//             <input
//               type="number"
//               value={editQuantity}
//               onChange={(e) => setEditQuantity(e.target.value)}
//               className="w-full border rounded-md p-2 mb-4"
//             />
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setEditingItem(null)}
//                 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 disabled={loading}
//                 onClick={handleUpdateStock}
//                 className="px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4b30]"
//               >
//                 {loading ? 'Saving...' : 'Save'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deletingItem && (
//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
//             <h2 className="text-lg font-bold text-red-600">Confirm Delete</h2>
//             <p className="text-sm text-gray-600 mt-2">
//               Are you sure you want to delete <b>{deletingItem.itemName}</b>? This action cannot be undone.
//             </p>

//             <div className="mt-6 flex justify-end gap-3">
//               <button
//                 onClick={() => setDeletingItem(null)}
//                 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 disabled={deleting}
//                 onClick={handleDeleteConfirm}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//               >
//                 {deleting ? 'Deleting...' : 'Delete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


'use client'

import { useState, useMemo } from 'react'
import { SearchIcon, Pencil, X, Trash } from 'lucide-react'
import { DM_Sans } from 'next/font/google'
import toast from 'react-hot-toast'
import Image from 'next/image'

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
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

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

  const toggleExpandItem = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id)
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
    setDeletingItem(item)
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
      setDeletingItem(null)
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast.error('❌ Error deleting item')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={`space-y-4 ${dmSans.className} px-1 sm:px-2 md:px-4 lg:px-0`}>
      {/* Search bar */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-3 border-b px-3 sm:px-4">
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by item, SKU, category..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Desktop Table (lg screens and up) */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg border shadow-sm">
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
                  {/* Item */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {imageUrl && (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={item.itemName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 640px"
                          />
                        </div>
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

                  {/* Other columns */}
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

                  {/* Actions */}
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

      {/* Mobile List View (below lg screens) */}
      <div className="lg:hidden space-y-2">
        {filteredItems.map((item) => {
          const lowStock = item.quantity <= item.reorderLevel
          const imageUrl = item.image?.asset?.url
          const isExpanded = expandedItem === item._id

          return (
            <div key={item._id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div 
                className="px-2 py-2 flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpandItem(item._id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {imageUrl && (
                    <div className="relative w-8 h-8 rounded-md overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={item.itemName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 640px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#8B5E3C] text-sm truncate">{item.itemName}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
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
                          ? 'Low'
                          : 'Out'}
                      </span>
                      <span className={`text-xs ${lowStock ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                        {item.quantity} {item.unit === 'pcs' ? 'pcs' : item.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-2 pb-3 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">SKU</p>
                      <p className="truncate">{item.sku}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="truncate">{formatCategory(item.category)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="truncate">{item.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Supplier</p>
                      <p className="truncate">{item.supplier || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Updated</p>
                      <p>{formatDate(item.lastUpdated)}</p>
                    </div>
                    {lowStock && (
                      <div className="col-span-2">
                        <p className="text-xs text-red-500">Reorder at {item.reorderLevel}</p>
                      </div>
                    )}
                  </div>

                  {item.description && (
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm">{item.description}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="px-2 py-1 flex items-center gap-1 text-xs text-[#8B5E3C] hover:bg-[#8B5E3C]/10 rounded"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="px-2 py-1 flex items-center gap-1 text-xs text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-3">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-md font-bold text-[#8B5E3C]">
                Edit {editingItem.itemName}
              </h2>
              <button onClick={() => setEditingItem(null)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              className="w-full border rounded-md p-1.5 text-sm mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleUpdateStock}
                className="px-3 py-1.5 text-xs bg-[#8B5E3C] text-white rounded-md hover:bg-[#6d4b30]"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm mx-3">
            <h2 className="text-md font-bold text-red-600">Delete Item?</h2>
            <p className="text-xs text-gray-600 mt-1">
              Delete <b>{deletingItem.itemName}</b>? This cannot be undone.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
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