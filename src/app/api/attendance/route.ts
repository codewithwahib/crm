import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Only require employee.name (not id)
    if (!body.employee || !body.employee.name) {
      return NextResponse.json(
        { 
          error: 'Missing employee details',
          details: 'Request must include employee object with at least a name',
          receivedBody: body // Helps debugging
        }, 
        { status: 400 }
      )
    }

    const doc = {
      _type: 'attendance',
      ...body,
      publishedAt: new Date().toISOString(),
    }

    const createdDoc = await writeClient.create(doc)

    return NextResponse.json(createdDoc, { status: 201 })
  } catch (error) {
    console.error('Error creating sales visit log:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create sales visit log',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // First fetch all attendance record IDs
    const query = `*[_type == "attendance"][]._id`
    const ids = await writeClient.fetch<string[]>(query)
    
    if (ids.length === 0) {
      return NextResponse.json(
        { message: 'No sales visit log records found to delete' },
        { status: 200 }
      )
    }

    // Create a transaction to delete all records
    const transaction = writeClient.transaction()
    ids.forEach(id => transaction.delete(id))
    
    await transaction.commit()

    return NextResponse.json(
      { 
        message: `Successfully deleted ${ids.length} sales visit log records`,
        deletedCount: ids.length
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting sales visit log records:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to delete sales visit log records',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}