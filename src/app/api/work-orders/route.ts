import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing work order ID' }, { status: 400 })
    }

    await writeClient.delete(id)

    return NextResponse.json({ success: true, message: '✅ Work order deleted!' })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Delete failed:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to delete work order', details: errorMessage },
      { status: 500 }
    )
  }
}