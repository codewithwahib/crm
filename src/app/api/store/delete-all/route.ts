import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function DELETE() {
  try {
    // Fetch all store item IDs
    const ids: string[] = await client.fetch(`*[_type == "storeItem"]._id`)

    if (!ids.length) {
      return NextResponse.json({ deleted: 0 })
    }

    // Delete in a single transaction (max 100 per mutation — chunk it)
    const chunkSize = 100
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize)
      const tx = client.transaction()
      chunk.forEach((id) => tx.delete(id))
      await tx.commit()
    }

    return NextResponse.json({ deleted: ids.length })
  } catch (err) {
    console.error('Bulk delete failed', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete all items' },
      { status: 500 }
    )
  }
}