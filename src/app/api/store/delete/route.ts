// app/api/store/delete/route.ts
import { NextResponse } from 'next/server'
import { writeClient, client, canWrite } from '@/sanity/lib/client'

export async function DELETE(request: Request) {
  try {
    // Check write permissions
    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured. Please set SANITY_API_TOKEN in environment variables.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    console.log('Deleting item with ID:', id)

    // First, check if the item exists using read client
    const existingItem = await client.fetch(
      `*[_type == "store" && _id == $id][0] {
        _id,
        partName,
        partNumber
      }`,
      { id }
    )

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    console.log('Found item to delete:', existingItem.partName)

    // Delete the document from Sanity using writeClient
    await writeClient.delete(id)

    return NextResponse.json({
      success: true,
      message: `${existingItem.partName} deleted successfully`,
      deletedId: id,
      deletedItem: existingItem
    })

  } catch (error) {
    console.error('Error deleting store item:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}