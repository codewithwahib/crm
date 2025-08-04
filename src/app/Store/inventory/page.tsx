// src/app/inventory/page.tsx
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import Sidebar from '@/app/Store/Components/sidebar'
import { InventoryTable } from './InventoryTable'

export const dynamic = 'force-dynamic'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] })

export default async function InventoryPage() {
  const inventoryItems = await client.fetch<InventoryItem[]>(`
    *[_type == "inventoryItem"] | order(itemName asc) {
      _id, itemName, sku, category, description, quantity, unit, location,
      supplier, reorderLevel, status, "lastUpdated": _updatedAt,
      costPrice, sellingPrice, image { asset->{ url } }
    }
  `, {}, { cache: 'no-store', next: { tags: ['inventory'] } })

  const validatedItems = inventoryItems.map(item => ({
    _id: item._id,
    itemName: item.itemName?.trim() || 'Unnamed Item',
    sku: item.sku?.trim() || `SKU-${Math.random().toString(36).substring(2,8).toUpperCase()}`,
    category: item.category?.replace(/[_-]/g, ' ').trim().toLowerCase() || 'uncategorized',
    description: item.description?.trim(),
    quantity: Number(item.quantity) || 0,
    unit: ['pcs', 'units', 'boxes', 'meters'].includes(item.unit?.trim().toLowerCase()) 
      ? item.unit.trim().toLowerCase() : 'pcs',
    location: item.location?.trim(),
    supplier: item.supplier?.trim(),
    reorderLevel: Math.max(Number(item.reorderLevel) || 0, 0),
    status: item.status || (item.quantity <= 0 ? 'out_of_stock' : 
           item.quantity <= item.reorderLevel ? 'low_stock' : 'in_stock'),
    costPrice: item.costPrice ? Number(item.costPrice) : undefined,
    sellingPrice: item.sellingPrice ? Number(item.sellingPrice) : undefined,
    lastUpdated: item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : undefined,
    image: item.image?.asset?.url ? { asset: { url: item.image.asset.url } } : undefined
  }))


  

  return (
    <ProtectedRoute allowedUser='store'>
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.className}`}>
      <Sidebar />
      
      <main className="ml-1 mr-2 pt-14 sm:mr-5 md:mr-6  lg:mr-8 lg:pl-8">
        <div className="max-w-7xl mx-auto px-2 py-6 sm:px-3 md:px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl sm:pl-3 md:text-3xl font-bold text-[#8B5E3C]">
                Electrical Components Inventory
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {validatedItems.length} items in stock • Last updated: {validatedItems[0]?.lastUpdated || 'Recently'}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <InventoryTable items={validatedItems} />
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}

type InventoryItem = {
  _id: string
  itemName: string
  sku: string
  category: string
  description?: string
  quantity: number
  unit: string
  location?: string
  supplier?: string
  reorderLevel: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  image?: { asset: { url: string } }
  lastUpdated?: string
  costPrice?: number
  sellingPrice?: number
}