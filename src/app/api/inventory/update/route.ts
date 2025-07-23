import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/sanity.client'

export async function PATCH(req: Request) {
  try {
    const { id, quantity } = await req.json()

    if (!id || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const status =
      quantity <= 0
        ? 'out_of_stock'
        : quantity <= 5
        ? 'low_stock'
        : 'in_stock'

    // ✅ Use writeClient (NOT read-only client)
    await writeClient
      .patch(id)
      .set({ quantity, status, lastUpdated: new Date().toISOString() })
      .commit()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
