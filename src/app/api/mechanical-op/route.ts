// app/api/mechanical-op/route.ts
import { NextResponse } from 'next/server'
import { client, writeClient, canWrite, checkWritePermissions } from '@/sanity/lib/client'

// Define proper interfaces
interface Part {
  partNo: string
  partName: string
  category: string
  storeLocation: string
  blankWidth?: number
  blankLength?: number
  blankSizeSqft?: number
  weight?: number
  sheetCost?: number
  paintCostPerPiece?: number
  todayPaintCost?: number
  gauge?: string
  material?: string
  qty: number
  completedQty?: number
  remainingQty?: number
  storeItemId: string
}

interface ProcessedPart {
  _key: string
  partNo: string
  partName: string
  category: string
  storeLocation: string
  blankWidth: number
  blankLength: number
  blankSizeSqft: number
  weight: number
  sheetCost: number
  paintCostPerPiece: number
  todayPaintCost: number
  gauge: string
  material: string
  qty: number
  completedQty: number
  remainingQty: number
  storeItemId: string
  totalWeight: number
  totalCost: number
}

interface WorkOrderBody {
  workOrderNo: string
  gatepassNo: string
  dateIssued: string
  remarks?: string
  overallStatus?: string
  parts: Part[]
}

interface ExistingPart {
  _key?: string
  partNo: string
  partName: string
  qty: number
  storeItemId: string
}

interface ExistingWorkOrder {
  _id: string
  parts?: ExistingPart[]
}

interface StoreItem {
  _id: string
  stockInStore: number
  partName: string
  partNumber?: string
}

// Helper function to calculate paint cost per piece
function calculatePaintCostPerPiece(blankSizeSqft: number, todayPaintCost: number): number {
  return blankSizeSqft * todayPaintCost
}

// GET - Fetch all mechanical operations
export async function GET() {
  try {
    const workOrders = await client.fetch(`
      *[_type == "mechanical-op"] | order(_createdAt desc) {
        _id,
        _createdAt,
        workOrderNo,
        gatepassNo,
        dateIssued,
        remarks,
        overallStatus,
        parts[] {
          partNo,
          partName,
          category,
          storeLocation,
          blankWidth,
          blankLength,
          blankSizeSqft,
          weight,
          sheetCost,
          paintCostPerPiece,
          todayPaintCost,
          gauge,
          material,
          qty,
          completedQty,
          remainingQty,
          storeItemId,
          "totalWeight": weight * qty,
          "totalCost": sheetCost * qty
        }
      }
    `)
    return NextResponse.json(workOrders)
  } catch (error) {
    console.error('Error fetching work orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Create new mechanical operation
export async function POST(req: Request) {
  try {
    const permissionError = checkWritePermissions()
    if (permissionError) {
      return NextResponse.json(
        { error: 'Write permission error', details: permissionError },
        { status: 403 }
      )
    }

    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured', details: 'SANITY_API_TOKEN is missing' },
        { status: 403 }
      )
    }

    const body: WorkOrderBody = await req.json()
    
    console.log('=== POST: Creating Mechanical Work Order ===')
    console.log('Received body:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.workOrderNo || !body.gatepassNo || !body.dateIssued) {
      return NextResponse.json(
        { error: 'Missing required fields: workOrderNo, gatepassNo, dateIssued' },
        { status: 400 }
      )
    }

    if (!body.parts || body.parts.length === 0) {
      return NextResponse.json(
        { error: 'At least one part is required' },
        { status: 400 }
      )
    }

    // Check if work order already exists
    const existingWorkOrder = await client.fetch(
      `*[_type == "mechanical-op" && workOrderNo == $workOrderNo][0] { _id }`,
      { workOrderNo: body.workOrderNo }
    )

    if (existingWorkOrder) {
      return NextResponse.json(
        { error: 'Work order number already exists' },
        { status: 400 }
      )
    }

    // Check if gatepass already exists
    const existingGatepass = await client.fetch(
      `*[_type == "mechanical-op" && gatepassNo == $gatepassNo][0] { _id }`,
      { gatepassNo: body.gatepassNo }
    )

    if (existingGatepass) {
      return NextResponse.json(
        { error: 'Gate pass number already exists' },
        { status: 400 }
      )
    }

    // Process parts with ALL fields including weight, blankWidth, blankLength, and paint costs
    const processedParts: ProcessedPart[] = body.parts.map((part: Part, index: number) => {
      const completedQty = part.completedQty || 0
      const qty = part.qty || 0
      const remainingQty = qty - completedQty
      const weightPerPiece = part.weight || 0
      const totalWeight = weightPerPiece * qty
      const totalCost = (part.sheetCost || 0) * qty
      
      // CRITICAL: Preserve paint cost values
      const blankSizeSqft = part.blankSizeSqft || 0
      const todayPaintCost = part.todayPaintCost || 0
      const paintCostPerPiece = part.paintCostPerPiece || calculatePaintCostPerPiece(blankSizeSqft, todayPaintCost)
      
      console.log(`Processing part ${index}:`, {
        partName: part.partName,
        blankWidth: part.blankWidth,
        blankLength: part.blankLength,
        blankSizeSqft: blankSizeSqft,
        weight: part.weight,
        sheetCost: part.sheetCost,
        todayPaintCost: todayPaintCost,
        paintCostPerPiece: paintCostPerPiece,
        qty: qty
      })
      
      return {
        _key: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
        partNo: part.partNo,
        partName: part.partName,
        category: part.category,
        storeLocation: part.storeLocation,
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankSizeSqft: blankSizeSqft,
        weight: weightPerPiece,
        sheetCost: part.sheetCost || 0,
        paintCostPerPiece: paintCostPerPiece,
        todayPaintCost: todayPaintCost,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: qty,
        completedQty: completedQty,
        remainingQty: remainingQty,
        storeItemId: part.storeItemId,
        totalWeight: totalWeight,
        totalCost: totalCost
      }
    })

    // Calculate overall status
    const totalQty = processedParts.reduce((sum: number, part: ProcessedPart) => sum + part.qty, 0)
    const totalCompleted = processedParts.reduce((sum: number, part: ProcessedPart) => sum + part.completedQty, 0)
    
    let overallStatus = 'not-started'
    if (totalCompleted > 0 && totalCompleted < totalQty) {
      overallStatus = 'in-progress'
    } else if (totalCompleted >= totalQty && totalQty > 0) {
      overallStatus = 'completed'
    }

    // Create work order document
    const newWorkOrder = {
      _type: 'mechanical-op',
      workOrderNo: body.workOrderNo.trim(),
      gatepassNo: body.gatepassNo.trim(),
      dateIssued: new Date(body.dateIssued).toISOString(),
      remarks: body.remarks || '',
      overallStatus: body.overallStatus || overallStatus,
      parts: processedParts
    }

    console.log('Creating work order with parts that have weight, dimensions, and paint costs:', 
      processedParts.map((p: ProcessedPart) => ({ 
        name: p.partName, 
        weight: p.weight,
        blankWidth: p.blankWidth,
        blankLength: p.blankLength,
        blankSizeSqft: p.blankSizeSqft,
        totalWeight: p.totalWeight,
        todayPaintCost: p.todayPaintCost,
        paintCostPerPiece: p.paintCostPerPiece 
      })))

    const result = await writeClient.create(newWorkOrder)
    
    console.log('Work order created successfully:', result._id)

    // Update stock for each part (deduct quantity)
    for (const part of body.parts) {
      try {
        const storeItem = await client.fetch(
          `*[_type == "store" && _id == $storeItemId][0] { _id, stockInStore, partNumber, partName }`,
          { storeItemId: part.storeItemId }
        ) as StoreItem | null
        
        if (storeItem) {
          const newStock = Math.max(0, storeItem.stockInStore - Number(part.qty))
          await writeClient
            .patch(storeItem._id)
            .set({ stockInStore: newStock })
            .commit()
          console.log(`Updated stock for ${storeItem.partName}: ${newStock} (deducted ${part.qty})`)
        }
      } catch (stockError) {
        console.error('Error updating stock for part:', part.partName, stockError)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Work order created successfully' 
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

// PUT - Update existing mechanical operation
export async function PUT(req: Request) {
  try {
    const permissionError = checkWritePermissions()
    if (permissionError) {
      return NextResponse.json(
        { error: 'Write permission error', details: permissionError },
        { status: 403 }
      )
    }

    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured', details: 'SANITY_API_TOKEN is missing' },
        { status: 403 }
      )
    }

    const body = await req.json() as { id: string; workOrderNo: string; gatepassNo: string; dateIssued: string; remarks?: string; overallStatus?: string; parts: Part[] }
    const { id, ...updates } = body
    
    console.log('=== PUT: Updating Mechanical Work Order ===')
    console.log('Received PUT request for ID:', id)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing work order ID' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!updates.workOrderNo || !updates.gatepassNo || !updates.dateIssued) {
      return NextResponse.json(
        { error: 'Missing required fields: workOrderNo, gatepassNo, dateIssued' },
        { status: 400 }
      )
    }

    if (!updates.parts || updates.parts.length === 0) {
      return NextResponse.json(
        { error: 'At least one part is required' },
        { status: 400 }
      )
    }

    // Get existing work order to calculate stock differences
    const existingWorkOrder = await client.fetch(
      `*[_type == "mechanical-op" && _id == $id][0] { 
        _id,
        parts[] {
          _key,
          partNo,
          partName,
          qty,
          storeItemId
        }
      }`,
      { id }
    ) as ExistingWorkOrder | null

    if (!existingWorkOrder) {
      return NextResponse.json(
        { error: 'Work order not found' },
        { status: 404 }
      )
    }

    // Create a map of old parts by storeItemId
    const oldPartsMap = new Map<string, ExistingPart>()
    for (const oldPart of existingWorkOrder.parts || []) {
      oldPartsMap.set(oldPart.storeItemId, oldPart)
    }

    // Process parts for update - INCLUDING weight, dimensions, and paint costs
    const processedParts: ProcessedPart[] = updates.parts.map((part: Part, index: number) => {
      const completedQty = part.completedQty || 0
      const qty = part.qty || 0
      const remainingQty = qty - completedQty
      const weightPerPiece = part.weight || 0
      const totalWeight = weightPerPiece * qty
      const totalCost = (part.sheetCost || 0) * qty
      
      // CRITICAL: Preserve paint cost values
      const blankSizeSqft = part.blankSizeSqft || 0
      const todayPaintCost = part.todayPaintCost || 0
      const paintCostPerPiece = part.paintCostPerPiece || calculatePaintCostPerPiece(blankSizeSqft, todayPaintCost)
      
      // Find existing part to preserve _key if it exists
      const existingPart = existingWorkOrder.parts?.find((p: ExistingPart) => p.storeItemId === part.storeItemId)
      
      return {
        _key: existingPart?._key || `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
        partNo: part.partNo,
        partName: part.partName,
        category: part.category,
        storeLocation: part.storeLocation,
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankSizeSqft: blankSizeSqft,
        weight: weightPerPiece,
        sheetCost: part.sheetCost || 0,
        paintCostPerPiece: paintCostPerPiece,
        todayPaintCost: todayPaintCost,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: qty,
        completedQty: completedQty,
        remainingQty: remainingQty,
        storeItemId: part.storeItemId,
        totalWeight: totalWeight,
        totalCost: totalCost
      }
    })

    // Calculate stock adjustments
    for (const [storeItemId, oldPart] of oldPartsMap) {
      const newPart = updates.parts.find((p: Part) => p.storeItemId === storeItemId)
      
      if (!newPart) {
        await updateStock(storeItemId, oldPart.qty, 'add')
        console.log(`Restored stock for removed part ${oldPart.partName}: +${oldPart.qty}`)
      } else if (newPart.qty !== oldPart.qty) {
        const difference = oldPart.qty - newPart.qty
        if (difference > 0) {
          await updateStock(storeItemId, difference, 'add')
          console.log(`Restored stock for ${oldPart.partName}: +${difference}`)
        } else if (difference < 0) {
          await updateStock(storeItemId, Math.abs(difference), 'deduct')
          console.log(`Deducted stock for ${oldPart.partName}: -${Math.abs(difference)}`)
        }
      }
    }

    for (const newPart of updates.parts) {
      if (!oldPartsMap.has(newPart.storeItemId)) {
        await updateStock(newPart.storeItemId, newPart.qty, 'deduct')
        console.log(`Deducted stock for new part ${newPart.partName}: -${newPart.qty}`)
      }
    }

    // Calculate overall status
    const totalQty = processedParts.reduce((sum: number, part: ProcessedPart) => sum + part.qty, 0)
    const totalCompleted = processedParts.reduce((sum: number, part: ProcessedPart) => sum + part.completedQty, 0)
    
    let overallStatus = 'not-started'
    if (totalCompleted > 0 && totalCompleted < totalQty) {
      overallStatus = 'in-progress'
    } else if (totalCompleted >= totalQty && totalQty > 0) {
      overallStatus = 'completed'
    }

    // Prepare update data
    const updateData = {
      workOrderNo: updates.workOrderNo.trim(),
      gatepassNo: updates.gatepassNo.trim(),
      dateIssued: new Date(updates.dateIssued).toISOString(),
      remarks: updates.remarks || '',
      parts: processedParts,
      overallStatus: updates.overallStatus || overallStatus
    }

    console.log('Updating work order with parts that have weight, dimensions, and paint costs:', 
      processedParts.map((p: ProcessedPart) => ({ 
        name: p.partName, 
        weight: p.weight,
        blankWidth: p.blankWidth,
        blankLength: p.blankLength,
        totalWeight: p.totalWeight,
        todayPaintCost: p.todayPaintCost,
        paintCostPerPiece: p.paintCostPerPiece 
      })))

    // Update work order
    const result = await writeClient
      .patch(id)
      .set(updateData)
      .commit()
    
    console.log('Work order updated successfully:', result._id)
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Work order updated successfully' 
    })
    
  } catch (error) {
    console.error('Error updating work order:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update work order', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove mechanical operation
export async function DELETE(req: Request) {
  try {
    const permissionError = checkWritePermissions()
    if (permissionError) {
      return NextResponse.json(
        { error: 'Write permission error', details: permissionError },
        { status: 403 }
      )
    }

    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured', details: 'SANITY_API_TOKEN is missing' },
        { status: 403 }
      )
    }

    const body = await req.json() as { id: string }
    const { id } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing work order ID' },
        { status: 400 }
      )
    }

    console.log('Deleting work order with ID:', id)

    const workOrder = await client.fetch(
      `*[_type == "mechanical-op" && _id == $id][0] { 
        _id,
        parts[] {
          storeItemId,
          partName,
          qty
        }
      }`,
      { id }
    ) as { _id: string; parts: Array<{ storeItemId: string; partName: string; qty: number }> } | null

    if (!workOrder) {
      return NextResponse.json(
        { error: 'Work order not found' },
        { status: 404 }
      )
    }

    if (workOrder.parts && workOrder.parts.length > 0) {
      for (const part of workOrder.parts) {
        await updateStock(part.storeItemId, part.qty, 'add')
        console.log(`Restored stock for ${part.partName}: +${part.qty}`)
      }
    }

    await writeClient.delete(id)
    
    console.log('Work order deleted successfully:', id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Work order deleted successfully' 
    })
    
  } catch (error) {
    console.error('Error deleting work order:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete work order', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Helper function to update stock
async function updateStock(storeItemId: string, quantity: number, operation: 'add' | 'deduct'): Promise<boolean> {
  try {
    const storeItem = await client.fetch(
      `*[_type == "store" && _id == $storeItemId][0] { _id, stockInStore, partName }`,
      { storeItemId }
    ) as StoreItem | null
    
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
      
      console.log(`Stock updated for ${storeItem.partName}: ${newStock} (${operation === 'add' ? '+' : '-'}${quantity})`)
      return true
    }
    return false
  } catch (error) {
    console.error(`Error updating stock for ${storeItemId}:`, error)
    return false
  }
}