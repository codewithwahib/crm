import { client } from '@/sanity/lib/client'
import { NextResponse } from 'next/server'

interface DeleteRequest {
  id: string
}

interface ErrorResponse {
  message: string
}

export async function POST(request: Request) {
  try {
    const { id } = (await request.json()) as DeleteRequest

    if (!id) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Verify the document exists first
    const existingDoc = await client.fetch(`*[_id == $id][0]`, { id })
    if (!existingDoc) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete the document using the Sanity client with proper authentication
    await client.delete(id, {
      token: process.env.SANITY_API_TOKEN // Make sure this is set in your environment
    })

    return NextResponse.json<{ message: string }>(
      { message: 'Document deleted successfully' },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Delete error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete document'
    return NextResponse.json<ErrorResponse>(
      { message: errorMessage },
      { status: 500 }
    )
  }
}