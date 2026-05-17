import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// GET - Fetch all store return records
export async function GET() {
  try {
    const query = `*[_type == "storeReturn"] | order(returnDate desc) {
      _id,
      returnNumber,
      returnDate,
      partNumber,
      partName,
      storeLocation,
      gauge,
      material,
      blankWidthMM,
      blankLengthMM,
      returnedQuantity,
      returnReason,
      returnedBy,
      receivedBy,
      fromDepartment,
      originalStock,
      newStock,
      unitOfMeasure,
      remarks,
      status
    }`
    
    const returns = await sanityClient.fetch(query)
    return NextResponse.json(returns)
  } catch (error) {
    console.error('Error fetching store returns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store returns' },
      { status: 500 }
    )
  }
}

// POST - Create store return and ADD stock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      returnNumber,
      returnDate,
      partNumber,
      partName,
      storeLocation,
      gauge,
      material,
      blankWidthMM,
      blankLengthMM,
      returnedQuantity,
      returnReason,
      returnedBy,
      receivedBy,
      fromDepartment,
      originalStock,
      newStock,
      unitOfMeasure,
      remarks,
      storeItemId
    } = body
    
    console.log('Creating return:', { returnNumber, partNumber, returnedQuantity })
    console.log('Stock update - Original:', originalStock, 'New:', newStock, 'Increase by:', returnedQuantity)
    
    // Validate required fields
    if (!returnNumber || !returnDate || !partNumber || !partName || !returnedQuantity || !returnReason || !returnedBy || !receivedBy || !fromDepartment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create return document in Sanity
    const doc = {
      _type: 'storeReturn',
      returnNumber,
      returnDate,
      partNumber,
      partName,
      storeLocation: storeLocation || '',
      gauge: gauge || '',
      material: material || '',
      blankWidthMM: blankWidthMM || 0,
      blankLengthMM: blankLengthMM || 0,
      returnedQuantity: Number(returnedQuantity),
      returnReason,
      returnedBy,
      receivedBy,
      fromDepartment,
      originalStock: Number(originalStock),
      newStock: Number(newStock),
      unitOfMeasure: unitOfMeasure || 'Pieces',
      remarks: remarks || '',
      status: 'completed'
    }
    
    const result = await sanityClient.create(doc)
    console.log('Return record created:', result._id)
    
    // Update store stock - ADD the returned quantity
    if (storeItemId) {
      try {
        console.log('Adding stock for store item:', storeItemId)
        console.log('Current stock:', originalStock)
        console.log('Adding quantity:', returnedQuantity)
        console.log('New stock will be:', newStock)
        
        const updatedItem = await sanityClient
          .patch(storeItemId)
          .set({ stockInStore: Number(newStock) })
          .commit()
        
        console.log('Store stock updated successfully. New stock:', updatedItem.stockInStore)
      } catch (stockError) {
        console.error('Failed to update store stock:', stockError)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Store return recorded successfully. Stock increased!',
      data: {
        _id: result._id,
        returnNumber,
        returnDate,
        partNumber,
        partName,
        storeLocation,
        gauge,
        material,
        blankWidthMM,
        blankLengthMM,
        returnedQuantity,
        returnReason,
        returnedBy,
        receivedBy,
        fromDepartment,
        originalStock,
        newStock,
        stockIncreasedBy: returnedQuantity,
        unitOfMeasure,
        remarks,
        status: 'completed'
      }
    })
    
  } catch (error) {
    console.error('Error creating store return:', error)
    const err = error as Error
    return NextResponse.json(
      { error: err.message || 'Failed to create store return' },
      { status: 500 }
    )
  }
}

// DELETE - Delete store return record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing return ID' },
        { status: 400 }
      )
    }
    
    await sanityClient.delete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Store return deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting store return:', error)
    return NextResponse.json(
      { error: 'Failed to delete store return' },
      { status: 500 }
    )
  }
}