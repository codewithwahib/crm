import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

interface UpdateData {
  stockInStore?: number;
  partNumber?: string;
  partName?: string;
  storeLocation?: string;
  gauge?: string;
  material?: string;
  category?: string;
  [key: string]: unknown;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, stockInStore, partNumber, partName, storeLocation, ...otherFields } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }
    
    // Build update object - only include fields that are provided
    const updateData: UpdateData = {}
    
    if (stockInStore !== undefined) {
      updateData.stockInStore = stockInStore
    }
    
    // Optional fields - only update if provided
    if (partNumber !== undefined) updateData.partNumber = partNumber
    if (partName !== undefined) updateData.partName = partName
    if (storeLocation !== undefined) updateData.storeLocation = storeLocation
    if (otherFields.gauge !== undefined) updateData.gauge = otherFields.gauge as string
    if (otherFields.material !== undefined) updateData.material = otherFields.material as string
    if (otherFields.category !== undefined) updateData.category = otherFields.category as string
    
    // Only update stock if stockInStore is provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    const result = await client
      .patch(id)
      .set(updateData)
      .commit()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Stock updated successfully',
      data: result 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { error: 'Failed to update stock: ' + (error as Error).message },
      { status: 500 }
    )
  }
}