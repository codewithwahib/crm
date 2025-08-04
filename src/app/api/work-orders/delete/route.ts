import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'

interface DeleteRequest {
  id: string
  workOrderNumber?: string  // Added to include work order details
}

interface ErrorResponse {
  error: string
  details?: string
}

export async function POST(req: Request) {
  try {
    const { id, workOrderNumber } = await req.json() as DeleteRequest

    if (!id) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing work order ID' }, 
        { status: 400 }
      )
    }

    // Create a transaction for atomic operations
    const transaction = writeClient.transaction()

    // 1. Delete the work order
    transaction.delete(id)

    // 2. Create an audit log entry
    transaction.create({
      _type: 'deletionLog',
      action: 'delete',
      documentType: 'workOrder',
      documentId: id,
      workOrderNumber: workOrderNumber || 'Unknown',
      deletedAt: new Date().toISOString(),
      message: workOrderNumber 
        ? `Work order #${workOrderNumber} was deleted`
        : 'A work order was deleted'
    })

    await transaction.commit()

    return NextResponse.json({ 
      success: true, 
      message: workOrderNumber
        ? `Work order #${workOrderNumber} deleted successfully`
        : 'Work order deleted successfully'
    })

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error')
    console.error('❌ Delete failed:', error.message)
    
    // Log the failed deletion attempt
    try {
      await writeClient.create({
        _type: 'deletionLog',
        action: 'deleteAttempt',
        status: 'failed',
        documentType: 'workOrder',
        error: error.message,
        attemptedAt: new Date().toISOString()
      })
    } catch (logError) {
      console.error('Failed to log deletion attempt:', logError)
    }

    return NextResponse.json<ErrorResponse>(
      { 
        error: 'Failed to delete work order', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}