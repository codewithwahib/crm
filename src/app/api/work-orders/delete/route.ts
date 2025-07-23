import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing work order ID' }, { status: 400 })
    }

    await writeClient.delete(id)

    return NextResponse.json({ success: true, message: ' Work order deleted!' })
  } catch (err: any) {
    console.error('❌ Delete failed:', err.message || err)
    return NextResponse.json(
      { error: 'Failed to delete work order', details: err.message || err },
      { status: 500 }
    )
  }
}
