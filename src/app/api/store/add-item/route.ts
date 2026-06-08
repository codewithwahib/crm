// // app/api/store/add-item/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { client, writeClient, canWrite } from '@/sanity/lib/client'

// interface StoreItem {
//   _id: string;
//   _createdAt: string;
//   partNumber: string;
//   partName: string;
//   category: string;
//   storeLocation: string;
//   gauge?: string;
//   material?: string;
//   blankWidthMM?: number;
//   blankLengthMM?: number;
//   blankWidthInch?: number;
//   blankLengthInch?: number;
//   blankWidth?: number;
//   blankLength?: number;
//   sqft?: number;
//   weight?: number;
//   todaySheetCost?: number;
//   todayPaintCost?: number;
//   sheetCostPerPiece?: number;
//   paintCostPerPiece?: number;
//   stockInStore: number;
//   minimumStockLevel: number;
//   unitOfMeasure: string;
//   returnStockOrders?: unknown[];
//   gatepasses?: unknown[];
// }

// export async function POST(req: NextRequest) {
//   try {
//     if (!canWrite()) {
//       return NextResponse.json({ error: 'Write token not configured' }, { status: 500 })
//     }

//     const body = await req.json()
    
//     console.log('Received body in API:', body)
    
//     // Use provided costs
//     const todaySheetCost = body.todaySheetCost || 0
//     const todayPaintCost = body.todayPaintCost || 0
//     let sheetCostPerPiece = body.sheetCostPerPiece || 0
//     let paintCostPerPiece = body.paintCostPerPiece || 0
    
//     // Calculate sheet cost per piece if not provided
//     if (sheetCostPerPiece === 0 && todaySheetCost > 0 && body.sqft && body.sqft > 0) {
//       const standardSheetSqft = 32
//       const pricePerSqft = todaySheetCost / standardSheetSqft
//       sheetCostPerPiece = pricePerSqft * body.sqft
//     }
    
//     // Calculate paint cost per piece if not provided
//     if (paintCostPerPiece === 0 && todayPaintCost > 0 && body.sqft && body.sqft > 0) {
//       paintCostPerPiece = todayPaintCost * body.sqft
//     }
    
//     // Round to 2 decimal places
//     const finalSheetCostPerPiece = Math.round(sheetCostPerPiece * 100) / 100
//     const finalPaintCostPerPiece = Math.round(paintCostPerPiece * 100) / 100
    
//     const newItem = {
//       _type: 'store',
//       partNumber: body.partNumber,
//       partName: body.partName,
//       category: body.category,
//       storeLocation: body.storeLocation,
//       gauge: body.gauge || '',
//       material: body.material || 'GI',
//       // Store both mm and inches
//       blankWidthMM: body.blankWidthMM || 0,
//       blankLengthMM: body.blankLengthMM || 0,
//       blankWidthInch: body.blankWidthInch || 0,
//       blankLengthInch: body.blankLengthInch || 0,
//       // Keep old fields for backward compatibility
//       blankWidth: body.blankWidthInch || 0,
//       blankLength: body.blankLengthInch || 0,
//       sqft: body.sqft || 0,
//       weight: body.weight || 0,
//       todaySheetCost: todaySheetCost,
//       todayPaintCost: todayPaintCost,
//       sheetCostPerPiece: finalSheetCostPerPiece,
//       paintCostPerPiece: finalPaintCostPerPiece,
//       stockInStore: Number(body.stockInStore),
//       minimumStockLevel: Number(body.minimumStockLevel),
//       unitOfMeasure: body.unitOfMeasure || 'Pieces',
//       // Required fields for assembly
//       returnStockOrders: body.returnStockOrders || [],
//       gatepasses: body.gatepasses || []
//     }

//     console.log('Creating store item:', {
//       todaySheetCost: newItem.todaySheetCost,
//       todayPaintCost: newItem.todayPaintCost,
//       sheetCostPerPiece: newItem.sheetCostPerPiece,
//       paintCostPerPiece: newItem.paintCostPerPiece,
//       weight: newItem.weight,
//       blankWidthMM: newItem.blankWidthMM,
//       blankLengthMM: newItem.blankLengthMM,
//       blankWidthInch: newItem.blankWidthInch,
//       blankLengthInch: newItem.blankLengthInch
//     })

//     const result = await writeClient.create(newItem)
    
//     return NextResponse.json({
//       success: true,
//       message: 'Item added successfully',
//       data: result
//     }, { status: 201 })

//   } catch (error) {
//     console.error('Error adding store item:', error)
//     return NextResponse.json({ 
//       error: 'Failed to add item',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 })
//   }
// }

// export async function GET() {
//   try {
//     const items = await client.fetch(`
//       *[_type == "store"] | order(_createdAt desc) {
//         _id,
//         _createdAt,
//         partNumber,
//         partName,
//         category,
//         storeLocation,
//         gauge,
//         material,
//         blankWidthMM,
//         blankLengthMM,
//         blankWidthInch,
//         blankLengthInch,
//         blankWidth,
//         blankLength,
//         sqft,
//         weight,
//         todaySheetCost,
//         todayPaintCost,
//         sheetCostPerPiece,
//         paintCostPerPiece,
//         stockInStore,
//         minimumStockLevel,
//         unitOfMeasure,
//         returnStockOrders[],
//         gatepasses[]
//       }
//     `) as StoreItem[]
    
//     // Ensure all items have required fields for assembly
//     const processedItems = items.map((item: StoreItem) => ({
//       ...item,
//       stockInStore: item.stockInStore || 0,
//       minimumStockLevel: item.minimumStockLevel || 0,
//       unitOfMeasure: item.unitOfMeasure || 'Pieces',
//       sheetCostPerPiece: item.sheetCostPerPiece || 0,
//       paintCostPerPiece: item.paintCostPerPiece || 0,
//       weight: item.weight || 0,
//       sqft: item.sqft || 0,
//       blankWidthMM: item.blankWidthMM || 0,
//       blankLengthMM: item.blankLengthMM || 0,
//       blankWidthInch: item.blankWidthInch || item.blankWidth || 0,
//       blankLengthInch: item.blankLengthInch || item.blankLength || 0,
//       // Ensure storeLocation for assembly
//       storeLocation: item.storeLocation || 'Main Store'
//     }))
    
//     console.log(`Fetched ${processedItems.length} store items`)
    
//     return NextResponse.json(processedItems, { status: 200 })
//   } catch (error) {
//     console.error('Error fetching store items:', error)
//     return NextResponse.json([], { status: 200 })
//   }
// }

// // ✅ Add PUT method for updating stock (used by assembly)
// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { id, stockInStore } = body
    
//     if (!id) {
//       return NextResponse.json(
//         { error: 'Item ID is required' },
//         { status: 400 }
//       )
//     }
    
//     if (stockInStore === undefined) {
//       return NextResponse.json(
//         { error: 'Stock quantity is required' },
//         { status: 400 }
//       )
//     }
    
//     if (!canWrite()) {
//       return NextResponse.json(
//         { error: 'Write token not configured' },
//         { status: 500 }
//       )
//     }
    
//     // Update only stock quantity
//     const result = await writeClient
//       .patch(id)
//       .set({ stockInStore: Number(stockInStore) })
//       .commit()
    
//     return NextResponse.json({
//       success: true,
//       message: 'Stock updated successfully',
//       data: result
//     }, { status: 200 })
    
//   } catch (error) {
//     console.error('Error updating stock:', error)
//     return NextResponse.json(
//       { 
//         error: 'Failed to update stock',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     )
//   }
// }

// // ✅ Add DELETE method
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
    
//     if (!id) {
//       return NextResponse.json(
//         { error: 'Item ID is required' },
//         { status: 400 }
//       )
//     }
    
//     if (!canWrite()) {
//       return NextResponse.json(
//         { error: 'Write token not configured' },
//         { status: 500 }
//       )
//     }
    
//     const result = await writeClient.delete(id)
    
//     return NextResponse.json({
//       success: true,
//       message: 'Item deleted successfully',
//       data: result
//     }, { status: 200 })
    
//   } catch (error) {
//     console.error('Error deleting item:', error)
//     return NextResponse.json(
//       { 
//         error: 'Failed to delete item',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     )
//   }
// }



import { NextRequest, NextResponse } from 'next/server'
import { client, writeClient } from '@/sanity/lib/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log('📦 Received data:', JSON.stringify(body, null, 2))
    
    // Create the document in Sanity
    const newItem = {
      _type: 'store',
      partNumber: body.partNumber,
      partName: body.partName,
      category: body.category || 'raw',
      storeLocation: body.storeLocation,
      gauge: body.gauge || '',
      material: body.material || 'GI',
      blankWidthMM: Number(body.blankWidthMM) || 0,
      blankLengthMM: Number(body.blankLengthMM) || 0,
      blankWidthInch: Number(body.blankWidthInch) || 0,
      blankLengthInch: Number(body.blankLengthInch) || 0,
      sqft: Number(body.sqft) || 0,
      weight: Number(body.weight) || 0,
      todaySheetPricePerKg: Number(body.todaySheetPricePerKg) || 0,
      todayPaintCost: Number(body.todayPaintCost) || 0,
      sheetCostPerPiece: Number(body.sheetCostPerPiece) || 0,
      paintCostPerPiece: Number(body.paintCostPerPiece) || 0,
      stockInStore: Number(body.stockInStore) || 0,
      minimumStockLevel: Number(body.minimumStockLevel) || 0,
      unitOfMeasure: body.unitOfMeasure || 'Pieces',
      returnStockOrders: [],
      gatepasses: []
    }

    console.log('💾 Saving to Sanity:', newItem)

    const result = await writeClient.create(newItem)
    
    console.log('✅ Item saved successfully:', result._id)
    
    return NextResponse.json({
      success: true,
      message: 'Item added successfully',
      data: result
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('❌ Error adding store item:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add item'
    }, { status: 500 })
}
}

export async function GET() {
  try {
    const items = await client.fetch(`
      *[_type == "store"] | order(_createdAt desc) {
        _id,
        _createdAt,
        partNumber,
        partName,
        category,
        storeLocation,
        gauge,
        material,
        blankWidthMM,
        blankLengthMM,
        blankWidthInch,
        blankLengthInch,
        sqft,
        weight,
        todaySheetPricePerKg,
        todayPaintCost,
        sheetCostPerPiece,
        paintCostPerPiece,
        stockInStore,
        minimumStockLevel,
        unitOfMeasure,
        returnStockOrders[],
        gatepasses[]
      }
    `)
    
    return NextResponse.json(items, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching store items:', error)
    return NextResponse.json([], { status: 200 })
}
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }
    
    const result = await writeClient
      .patch(id)
      .set(updates)
      .commit()
    
    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      data: result
    }, { status: 200 })
    
  } catch (error: unknown) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update item' },
      { status: 500 }
    )
}
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }
    
    const result = await writeClient.delete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
      data: result
    }, { status: 200 })
    
  } catch (error: unknown) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete item' },
      { status: 500 }
    )
}
}