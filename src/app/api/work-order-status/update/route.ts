import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client' // Make sure this has token for write access

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      )
    }

    // ✅ Update status in Sanity
    const updatedDoc = await writeClient.patch(id).set({ status }).commit()

    return NextResponse.json({ success: true, updatedDoc })
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
