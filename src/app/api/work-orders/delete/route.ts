import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'

interface DeleteRequest {
  id: string
}

interface ErrorResponse {
  error: string
  details?: string
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json() as DeleteRequest

    if (!id) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing work order ID' }, 
        { status: 400 }
      )
    }

    await writeClient.delete(id)

    return NextResponse.json({ 
      success: true, 
      message: 'Work order deleted!' 
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Delete failed:', errorMessage)
    
    return NextResponse.json<ErrorResponse>(
      { 
        error: 'Failed to delete work order', 
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}