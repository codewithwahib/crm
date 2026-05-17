import { NextRequest, NextResponse } from 'next/server'
import { client, writeClient } from '@/sanity/lib/client'  // ← client bhi import karo

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates } = body
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Updates array is required' },
        { status: 400 }
      )
    }
    
    const results = []
    
    for (const update of updates) {
      const { id, quantity, partName } = update
      
      if (!id) {
        results.push({ partName, success: false, error: 'Item ID is required' })
        continue
      }
      
      if (!quantity || quantity <= 0) {
        results.push({ partName, success: false, error: 'Valid quantity is required' })
        continue
      }
      
      try {
        // ✅ Use client (read client) for fetching, NOT writeClient
        const query = `*[_type == "store" && _id == $id][0]{
          _id,
          partNumber,
          partName,
          stockInStore,
          unitOfMeasure
        }`
        
        const currentItem = await client.fetch(query, { id })  // ← client use karo
        
        if (!currentItem) {
          results.push({ partName, success: false, error: 'Item not found' })
          continue
        }
        
        const oldStock = currentItem.stockInStore || 0
        const newStock = oldStock - quantity
        
        if (newStock < 0) {
          results.push({ 
            partName, 
            success: false, 
            error: `Insufficient stock. Available: ${oldStock} ${currentItem.unitOfMeasure || 'units'}, Required: ${quantity}` 
          })
          continue
        }
        
        // ✅ Use writeClient only for updating
        await writeClient
          .patch(id)
          .set({ stockInStore: newStock })
          .commit()
        
        results.push({
          partName: partName || currentItem.partName,
          success: true,
          oldStock,
          newStock,
          deducted: quantity,
          unit: currentItem.unitOfMeasure || 'units'
        })
        
      } catch (error) {
        console.error(`Error updating stock for ${partName}:`, error)
        results.push({
          partName,
          success: false,
          error: (error as Error).message
        })
      }
    }
    
    const allSuccess = results.every(r => r.success)
    
    return NextResponse.json({
      success: allSuccess,
      results,
      message: allSuccess ? 'All stocks deducted successfully' : 'Some stock deductions failed'
    }, { status: allSuccess ? 200 : 207 })
    
  } catch (error) {
    console.error('Error in batch stock deduction:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to deduct stock: ' + (error as Error).message 
      },
      { status: 500 }
    )
  }
}