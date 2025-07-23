// app/api/inventory/route.ts
import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/sanity.client'

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // ✅ Validation
    if (!data.itemName || !data.sku || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields: itemName, sku, category' },
        { status: 400 }
      )
    }

    const quantity = Number(data.quantity) || 0
    const reorderLevel = Number(data.reorderLevel) || 5

    const status =
      quantity <= 0
        ? 'out_of_stock'
        : quantity <= reorderLevel
        ? 'low_stock'
        : 'in_stock'

    // ✅ Correct schema name here
    const newItem = await writeClient.create({
      _type: 'inventoryItem', // ✅ MUST match your schema name
      itemName: data.itemName,
      sku: data.sku,
      category: data.category,
      description: data.description || '',
      quantity,
      unit: data.unit || 'pcs',
      location: data.location || '',
      supplier: data.supplier || '',
      reorderLevel,
      status,
      lastUpdated: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, item: newItem })
  } catch (error) {
    console.error('Add Item Error:', error)
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 })
  }
}
