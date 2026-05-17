// app/api/manual-work-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client, writeClient, canWrite } from '@/sanity/lib/client'

// Define types
interface Part {
  partNo: string;
  partName: string;
  category?: string;
  storeLocation?: string;
  blankWidth?: number;
  blankLength?: number;
  blankSizeSqft?: number;
  paintCostPerSqft?: number;
  paintCostPerPiece?: number;
  gauge?: string;
  material?: string;
  qty: number;
  totalPrice?: number;
  totalSqft?: number;
  storeItemId?: string;
  _key?: string;
}

interface FormattedPart extends Part {
  _key: string;
  category: string;
  storeLocation: string;
  blankWidth: number;
  blankLength: number;
  blankSizeSqft: number;
  paintCostPerSqft: number;
  paintCostPerPiece: number;
  gauge: string;
  material: string;
  totalPrice: number;
  totalSqft: number;
  storeItemId: string;
}

interface ExistingPart {
  _key?: string;
  partNo: string;
  qty: number;
  storeItemId?: string;
}

interface ExistingDocument {
  _id: string;
  workOrderNo: string;
  gatepassNo: string;
  parts?: ExistingPart[];
}

interface StockItem {
  _id: string;
  stockInStore: number;
  partName: string;
  partNumber: string;
}

// Helper function to calculate paint cost for a part
function calculatePartValues(part: Partial<Part>) {
  const paintCostPerPiece = (part.blankSizeSqft || 0) * (part.paintCostPerSqft || 0)
  const totalPrice = paintCostPerPiece * (part.qty || 0)
  const totalSqft = (part.blankSizeSqft || 0) * (part.qty || 0)
  return { paintCostPerPiece, totalPrice, totalSqft }
}

// Helper function to calculate order total
function calculateOrderTotal(parts: FormattedPart[]) {
  return parts.reduce((sum, part) => sum + (part.totalPrice || 0), 0)
}

export async function GET(_req: NextRequest) {
  try {
    // Fetch paint inward operations (manual work orders)
    const workOrders = await client.fetch(`
      *[_type == "paint-in-opr"] | order(_createdAt desc) {
        _id,
        _createdAt,
        workOrderNo,
        gatepassNo,
        dateIssued,
        remarks,
        total,
        parts[] {
          _key,
          partNo,
          partName,
          category,
          storeLocation,
          blankWidth,
          blankLength,
          blankSizeSqft,
          paintCostPerSqft,
          paintCostPerPiece,
          gauge,
          material,
          qty,
          totalPrice
        }
      }
    `)

    // Fetch mechanical operations for reference
    const mechanicalOps = await client.fetch(`
      *[_type == "mechanical-op"] | order(_createdAt desc) {
        _id,
        workOrderNo,
        gatepassNo,
        dateIssued,
        remarks,
        parts[] {
          partNo,
          partName,
          category,
          storeLocation,
          blankWidth,
          blankLength,
          blankSizeSqft,
          sheetCost,
          gauge,
          material,
          qty,
          todayPaintCost,
          paintCostPerPiece
        }
      }
    `)

    return NextResponse.json({ 
      data: workOrders || [], 
      mechanicalOps: mechanicalOps || [] 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching work orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work orders' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured' },
        { status: 500 }
      )
    }

    const body = await req.json() as { workOrderNo: string; gatepassNo: string; dateIssued: string; remarks?: string; parts: Partial<Part>[] }
    const { workOrderNo, gatepassNo, dateIssued, remarks, parts } = body

    console.log('=== POST: Creating Paint Inward Work Order ===')
    console.log('Received parts:', JSON.stringify(parts, null, 2))

    // Validate required fields
    if (!workOrderNo || workOrderNo.trim() === '') {
      return NextResponse.json(
        { error: 'Work Order Number is required' },
        { status: 400 }
      )
    }

    if (!gatepassNo || gatepassNo.trim() === '') {
      return NextResponse.json(
        { error: 'Gate Pass Number is required' },
        { status: 400 }
      )
    }

    if (!dateIssued) {
      return NextResponse.json(
        { error: 'Date Issued is required' },
        { status: 400 }
      )
    }

    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: 'At least one part is required' },
        { status: 400 }
      )
    }

    // Check if work order already exists
    const existingWorkOrder = await client.fetch(
      `*[_type == "paint-in-opr" && workOrderNo == $workOrderNo][0] { _id }`,
      { workOrderNo }
    )

    if (existingWorkOrder) {
      return NextResponse.json(
        { error: 'Work order number already exists' },
        { status: 400 }
      )
    }

    // Check if gatepass already exists
    const existingGatepass = await client.fetch(
      `*[_type == "paint-in-opr" && gatepassNo == $gatepassNo][0] { _id }`,
      { gatepassNo }
    )

    if (existingGatepass) {
      return NextResponse.json(
        { error: 'Gate pass number already exists' },
        { status: 400 }
      )
    }

    // Format parts with all required fields
    const formattedParts: FormattedPart[] = parts.map((part: Partial<Part>, index: number) => {
      const { paintCostPerPiece, totalPrice, totalSqft } = calculatePartValues(part)
      
      console.log(`Processing part ${index}:`, {
        partName: part.partName,
        blankWidth: part.blankWidth,
        blankLength: part.blankLength,
        blankSizeSqft: part.blankSizeSqft,
        paintCostPerSqft: part.paintCostPerSqft,
        qty: part.qty,
        paintCostPerPiece,
        totalPrice
      })
      
      return {
        _key: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
        partNo: part.partNo || '',
        partName: part.partName || '',
        category: part.category || 'raw',
        storeLocation: part.storeLocation || '',
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft || 0,
        paintCostPerSqft: part.paintCostPerSqft || 0,
        paintCostPerPiece: paintCostPerPiece,
        gauge: part.gauge || '',
        material: part.material || 'GI',
        qty: Number(part.qty),
        totalPrice: totalPrice,
        totalSqft: totalSqft,
        storeItemId: part.storeItemId || ''
      }
    })

    // Calculate order total
    const total = calculateOrderTotal(formattedParts)

    console.log('Formatted parts:', JSON.stringify(formattedParts, null, 2))
    console.log('Order total:', total)

    // Create new document
    const result = await writeClient.create({
      _type: 'paint-in-opr',
      workOrderNo: workOrderNo.trim(),
      gatepassNo: gatepassNo.trim(),
      dateIssued: new Date(dateIssued).toISOString(),
      remarks: remarks || '',
      parts: formattedParts,
      total: total,
      createdAt: new Date().toISOString()
    })
    
    console.log('Successfully created work order:', result._id)

    // Update stock for each part (deduct quantity)
    for (const part of parts) {
      if (part.storeItemId) {
        try {
          const storeItem = await client.fetch(
            `*[_type == "store" && _id == $storeItemId][0] { _id, stockInStore, partName, partNumber }`,
            { storeItemId: part.storeItemId }
          ) as StockItem | null
          
          if (storeItem) {
            const newStock = Math.max(0, storeItem.stockInStore - Number(part.qty))
            await writeClient
              .patch(storeItem._id)
              .set({ stockInStore: newStock })
              .commit()
            console.log(`Updated stock for ${storeItem.partName}: ${newStock} (deducted ${part.qty})`)
          } else {
            console.warn(`Store item not found for ID: ${part.storeItemId}`)
          }
        } catch (stockError) {
          console.error('Error updating stock for part:', part.partName, stockError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Work order created successfully',
      data: result
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating work order:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create work order', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured' },
        { status: 500 }
      )
    }

    const body = await req.json() as { id: string; workOrderNo: string; gatepassNo: string; dateIssued: string; remarks?: string; parts: Partial<Part>[] }
    const { id, workOrderNo, gatepassNo, dateIssued, remarks, parts } = body

    console.log('=== PUT: Updating Paint Inward Work Order ===')
    console.log('Received parts:', JSON.stringify(parts, null, 2))

    if (!id) {
      return NextResponse.json(
        { error: 'Work order ID is required' },
        { status: 400 }
      )
    }

    if (!workOrderNo || workOrderNo.trim() === '') {
      return NextResponse.json(
        { error: 'Work Order Number is required' },
        { status: 400 }
      )
    }

    if (!gatepassNo || gatepassNo.trim() === '') {
      return NextResponse.json(
        { error: 'Gate Pass Number is required' },
        { status: 400 }
      )
    }

    if (!dateIssued) {
      return NextResponse.json(
        { error: 'Date Issued is required' },
        { status: 400 }
      )
    }

    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: 'At least one part is required' },
        { status: 400 }
      )
    }

    // Get existing parts to calculate stock differences
    const existingDoc = await client.fetch(
      `*[_type == "paint-in-opr" && _id == $id][0] { 
        _id,
        workOrderNo,
        gatepassNo,
        parts[] {
          _key,
          partNo,
          qty,
          storeItemId
        }
      }`,
      { id }
    ) as ExistingDocument | null

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Work order not found' },
        { status: 404 }
      )
    }

    // Create a map of old parts by partNo
    const oldPartsMap = new Map<string, ExistingPart>()
    for (const oldPart of existingDoc.parts || []) {
      oldPartsMap.set(oldPart.partNo, oldPart)
    }

    // Restore stock for parts that were removed or reduced
    for (const [partNo, oldPart] of oldPartsMap) {
      const newPart = parts.find((p: Partial<Part>) => p.partNo === partNo)
      
      if (!newPart && oldPart.storeItemId) {
        // Part was removed - restore full quantity
        await updateStockByStoreItemId(oldPart.storeItemId, oldPart.qty, 'add')
        console.log(`Restored stock for removed part ${partNo}: +${oldPart.qty}`)
      } else if (newPart && newPart.qty !== oldPart.qty && oldPart.storeItemId) {
        // Quantity changed - adjust difference
        const difference = oldPart.qty - (newPart.qty || 0)
        if (difference > 0) {
          await updateStockByStoreItemId(oldPart.storeItemId, difference, 'add')
          console.log(`Restored stock for ${partNo}: +${difference}`)
        } else if (difference < 0 && oldPart.storeItemId) {
          await updateStockByStoreItemId(oldPart.storeItemId, Math.abs(difference), 'deduct')
          console.log(`Deducted stock for ${partNo}: -${Math.abs(difference)}`)
        }
      }
    }

    // Format parts with all required fields
    const formattedParts: FormattedPart[] = parts.map((part: Partial<Part>, index: number) => {
      const { paintCostPerPiece, totalPrice, totalSqft } = calculatePartValues(part)
      
      // Find existing part to preserve _key if it exists
      const existingPart = existingDoc.parts?.find((p: ExistingPart) => p.partNo === part.partNo)
      
      return {
        _key: existingPart?._key || `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
        partNo: part.partNo || '',
        partName: part.partName || '',
        category: part.category || 'raw',
        storeLocation: part.storeLocation || '',
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft || 0,
        paintCostPerSqft: part.paintCostPerSqft || 0,
        paintCostPerPiece: paintCostPerPiece,
        gauge: part.gauge || '',
        material: part.material || 'GI',
        qty: Number(part.qty),
        totalPrice: totalPrice,
        totalSqft: totalSqft,
        storeItemId: part.storeItemId || ''
      }
    })

    // Calculate order total
    const total = calculateOrderTotal(formattedParts)

    // Deduct stock for new parts that weren't in the original order
    for (const newPart of parts) {
      if (!oldPartsMap.has(newPart.partNo || '') && newPart.storeItemId) {
        await updateStockByStoreItemId(newPart.storeItemId, newPart.qty || 0, 'deduct')
        console.log(`Deducted stock for new part ${newPart.partNo}: -${newPart.qty}`)
      }
    }

    const result = await writeClient
      .patch(id)
      .set({
        workOrderNo: workOrderNo.trim(),
        gatepassNo: gatepassNo.trim(),
        dateIssued: new Date(dateIssued).toISOString(),
        remarks: remarks || '',
        parts: formattedParts,
        total: total,
        updatedAt: new Date().toISOString()
      })
      .commit()

    console.log('Work order updated successfully:', result._id)

    return NextResponse.json({
      success: true,
      message: 'Work order updated successfully',
      data: result
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating work order:', error)
    return NextResponse.json(
      { error: 'Failed to update work order' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Work order ID is required' },
        { status: 400 }
      )
    }

    console.log('Deleting paint inward work order with ID:', id)

    // Get the document to restore stock
    const workOrder = await client.fetch(
      `*[_type == "paint-in-opr" && _id == $id][0] { 
        _id,
        parts[] {
          storeItemId,
          partNo,
          qty
        }
      }`,
      { id }
    ) as { _id: string; parts: Array<{ storeItemId?: string; partNo: string; qty: number }> } | null

    if (!workOrder) {
      return NextResponse.json(
        { error: 'Work order not found' },
        { status: 404 }
      )
    }

    // Restore stock for all parts
    if (workOrder.parts && workOrder.parts.length > 0) {
      for (const part of workOrder.parts) {
        if (part.storeItemId) {
          await updateStockByStoreItemId(part.storeItemId, part.qty, 'add')
          console.log(`Restored stock for ${part.partNo}: +${part.qty}`)
        }
      }
    }

    const result = await writeClient.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Work order deleted successfully',
      data: result
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting work order:', error)
    return NextResponse.json(
      { error: 'Failed to delete work order' },
      { status: 500 }
    )
  }
}

// Helper function to update stock by storeItemId
async function updateStockByStoreItemId(storeItemId: string | undefined, quantity: number, operation: 'add' | 'deduct'): Promise<boolean> {
  if (!storeItemId) {
    console.warn('No storeItemId provided for stock update')
    return false
  }
  
  try {
    const storeItem = await client.fetch(
      `*[_type == "store" && _id == $storeItemId][0] { _id, stockInStore, partName, partNumber }`,
      { storeItemId }
    ) as StockItem | null
    
    if (storeItem) {
      let newStock = storeItem.stockInStore
      if (operation === 'add') {
        newStock = storeItem.stockInStore + quantity
      } else {
        newStock = Math.max(0, storeItem.stockInStore - quantity)
      }
      
      await writeClient
        .patch(storeItem._id)
        .set({ stockInStore: newStock })
        .commit()
      
      console.log(`Stock updated for ${storeItem.partName}: ${newStock} (${operation === 'add' ? 'added' : 'deducted'} ${quantity})`)
      return true
    }
    console.warn(`Store item not found for ID: ${storeItemId}`)
    return false
  } catch (error) {
    console.error(`Error updating stock for ${storeItemId}:`, error)
    return false
  }
}