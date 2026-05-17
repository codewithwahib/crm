// app/api/paint-out-opr/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client, writeClient, canWrite } from '@/sanity/lib/client'

// Define interfaces
interface Part {
  partNo: string;
  partName: string;
  category: string;
  storeLocation: string;
  _key?: string; 
  blankWidth?: number;
  blankLength?: number;
  blankSizeSqft?: number;
  weight?: number;
  sheetCost?: number;
  gauge?: string;
  material?: string;
  qty: number;
  remainingQty?: number;
  completedQty?: number;
  storeItemId?: string;
  inwardPartId?: string;
  receivedQty?: number;
  totalPrice?: number;
  totalWeight?: number;
}

interface FormattedPart extends Part {
  _key: string;
  blankWidth: number;
  blankLength: number;
  blankSizeSqft: number;
  weight: number;
  sheetCost: number;
  gauge: string;
  material: string;
  qty: number;
  remainingQty: number;
  completedQty: number;
  paintCostPerPiece: number;
  totalPrice: number;
  totalWeight: number;
  storeItemId: string;
  inwardPartId: string;
  receivedQty: number;
}

interface StoreItem {
  _id: string;
  partNumber: string;
  partName: string;
  stockInStore: number;
  unitOfMeasure: string;
  _type: string;
}

interface InwardPart {
  _key?: string;
  partNo: string;
  partName: string;
  qty: number;
  receivedQty?: number;
  remainingQty?: number;
  blankWidth?: number;
  blankLength?: number;
  blankSizeSqft?: number;
  gauge?: string;
  material?: string;
}

interface InwardOrder {
  _id: string;
  workOrderNo: string;
  parts: InwardPart[];
}

function calculatePartValues(part: Partial<Part>) {
  const paintCostPerPiece = (part.blankSizeSqft || 0) * (part.sheetCost || 0)
  const totalPrice = paintCostPerPiece * (part.qty || 0)
  const totalWeight = (part.weight || 0) * (part.qty || 0)
  
  return { 
    paintCostPerPiece, 
    totalPrice,
    totalWeight
  }
}

function calculateOrderTotal(parts: FormattedPart[]) {
  return parts.reduce((sum, part) => sum + (part.totalPrice || 0), 0)
}

function calculateOrderTotalWeight(parts: FormattedPart[]) {
  return parts.reduce((sum, part) => sum + (part.totalWeight || 0), 0)
}

// Helper function to check if part exists in store and get current stock
async function checkStoreStock(parts: Part[]): Promise<{ valid: boolean; error?: string }> {
  try {
    for (const part of parts) {
      if (!part.storeItemId) {
        console.warn(`No storeItemId for part: ${part.partName}, skipping stock check`)
        continue
      }

      const storeItem = await client.fetch(
        `*[_type in ["storeItem", "store"] && (storeItemId == $storeItemId || partNumber == $partNumber)][0] { 
          _id, 
          partNumber, 
          partName, 
          stockInStore,
          unitOfMeasure
        }`,
        { 
          storeItemId: part.storeItemId,
          partNumber: part.partNo 
        }
      ) as StoreItem | null

      if (!storeItem) {
        console.error(`Store item not found for part: ${part.partName}, PartNo: ${part.partNo}`)
        return { 
          valid: false, 
          error: `Part "${part.partName}" (${part.partNo}) not found in store inventory. Please add this part to store first.` 
        }
      }

      console.log(`✅ Part found in store: ${storeItem.partName}, Current stock: ${storeItem.stockInStore || 0}`)
    }

    return { valid: true }
  } catch (error) {
    console.error('Error checking store stock:', error)
    return { valid: false, error: 'Failed to check store inventory. Please try again.' }
  }
}

// Helper function to update store stock (ADD quantity - for outward received)
async function updateStoreStock(parts: Part[], operation: 'add' | 'restore') {
  const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
  for (const part of parts) {
    const qtyToAdd = part.receivedQty || part.qty || 0
    
    if (qtyToAdd <= 0) {
      console.log(`⚠️ No quantity to add for ${part.partName}, skipping stock update`)
      continue
    }

    if (!part.storeItemId && !part.partNo) {
      console.warn(`No storeItemId or partNo for part: ${part.partName}, skipping stock update`)
      continue
    }

    try {
      const storeItem = await client.fetch(
        `*[_type in ["storeItem", "store"] && (storeItemId == $storeItemId || partNumber == $partNumber)][0] { 
          _id, 
          partNumber, 
          partName, 
          stockInStore,
          unitOfMeasure,
          _type
        }`,
        { 
          storeItemId: part.storeItemId,
          partNumber: part.partNo 
        }
      ) as StoreItem | null

      if (!storeItem) {
        console.error(`Store item not found for part: ${part.partName}, PartNo: ${part.partNo}`)
        results.push({ success: false, partName: part.partName, error: 'Store item not found' })
        continue
      }

      let newStock: number
      if (operation === 'add') {
        newStock = (storeItem.stockInStore || 0) + qtyToAdd
        console.log(`📦 Adding ${qtyToAdd} to store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)
      } else {
        newStock = (storeItem.stockInStore || 0) - qtyToAdd
        if (newStock < 0) {
          console.warn(`⚠️ Restore would make stock negative for ${storeItem.partName}, setting to 0 instead`)
          newStock = 0
        }
        console.log(`📦 Restoring (subtracting) ${qtyToAdd} from store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)
      }

      await writeClient
        .patch(storeItem._id)
        .set({ stockInStore: newStock })
        .commit()

      results.push({ success: true, partName: part.partName, newStock })
      
    } catch (error) {
      console.error(`Error updating stock for part ${part.partName}:`, error)
      results.push({ success: false, partName: part.partName, error: String(error) })
    }
  }

  return results
}

// Helper function to update inward order - updates receivedQty, remainingQty AND preserves dimensions
async function updateInwardOrder(inwardOrderId: string, outwardParts: Part[]) {
  try {
    const inwardOrder = await client.fetch(
      `*[_type == "paint-in-opr" && _id == $id][0] {
        _id,
        workOrderNo,
        parts[] {
          _key,
          partNo,
          partName,
          qty,
          receivedQty,
          remainingQty,
          blankWidth,
          blankLength,
          blankSizeSqft,
          gauge,
          material,
          storeItemId
        }
      }`,
      { id: inwardOrderId }
    ) as InwardOrder | null

    if (!inwardOrder) {
      console.error('Inward order not found:', inwardOrderId)
      return false
    }

    console.log('📦 Current inward order state BEFORE update:', JSON.stringify(inwardOrder.parts.map((p: InwardPart) => ({
      partNo: p.partNo,
      partName: p.partName,
      qty: p.qty,
      receivedQty: p.receivedQty || 0,
      remainingQty: p.remainingQty,
      blankWidth: p.blankWidth,
      blankLength: p.blankLength,
      blankSizeSqft: p.blankSizeSqft
    })), null, 2))

    const outwardPartsMap = new Map<string, { qty: number; inwardPartId?: string }>()
    for (const outPart of outwardParts) {
      outwardPartsMap.set(outPart.partNo, {
        qty: outPart.receivedQty || outPart.qty || 0,
        inwardPartId: outPart.inwardPartId
      })
    }

    console.log('📤 Outward parts to ADD to inward received:', Array.from(outwardPartsMap.entries()))

    let hasError = false
    let updated = false
    
    const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
      const outwardPart = outwardPartsMap.get(inPart.partNo)
      
      if (outwardPart) {
        const currentReceivedQty = inPart.receivedQty || 0
        const newReceivedQty = currentReceivedQty + outwardPart.qty
        
        if (newReceivedQty > inPart.qty) {
          console.error(`❌ Cannot receive more than inward quantity for part: ${inPart.partNo}`)
          console.error(`   Current: ${currentReceivedQty}, Adding: ${outwardPart.qty}, Max: ${inPart.qty}`)
          hasError = true
          return inPart
        }
        
        const newRemainingQty = inPart.qty - newReceivedQty
        
        console.log(`✅ Updating part ${inPart.partNo} (${inPart.partName}):`, {
          originalQty: inPart.qty,
          oldReceived: currentReceivedQty,
          outwardQty: outwardPart.qty,
          newReceived: newReceivedQty,
          newRemaining: newRemainingQty,
          dimensions: { blankWidth: inPart.blankWidth, blankLength: inPart.blankLength, sqft: inPart.blankSizeSqft }
        })
        
        updated = true
        return {
          ...inPart,
          receivedQty: newReceivedQty,
          remainingQty: newRemainingQty
        }
      }
      return inPart
    })

    if (hasError) {
      return false
    }

    if (!updated) {
      console.log('ℹ️ No parts to update in inward order')
      return true
    }

    await writeClient
      .patch(inwardOrderId)
      .set({ parts: updatedParts })
      .commit()

    console.log('✅ Inward order updated - NEW STATE:', JSON.stringify(updatedParts.map((p: InwardPart) => ({
      partNo: p.partNo,
      partName: p.partName,
      receivedQty: p.receivedQty,
      remainingQty: p.remainingQty
    })), null, 2))
    
    return true
  } catch (error) {
    console.error('Error updating inward order:', error)
    return false
  }
}

// Helper to check if inward order has remaining quantity
async function checkInwardOrderRemainingQuantity(inwardOrderId: string, outwardParts: Part[]): Promise<{ valid: boolean; error?: string }> {
  try {
    const inwardOrder = await client.fetch(
      `*[_type == "paint-in-opr" && _id == $id][0] {
        _id,
        workOrderNo,
        parts[] {
          partNo,
          partName,
          qty,
          receivedQty,
          remainingQty,
          blankWidth,
          blankLength,
          blankSizeSqft
        }
      }`,
      { id: inwardOrderId }
    ) as InwardOrder | null

    if (!inwardOrder) {
      return { valid: false, error: 'Inward order not found' }
    }

    for (const outPart of outwardParts) {
      const inPart = inwardOrder.parts.find((p: InwardPart) => p.partNo === outPart.partNo)
      
      if (!inPart) {
        return { valid: false, error: `Part ${outPart.partNo} not found in inward order` }
      }
      
      let availableQty = inPart.remainingQty
      
      if (availableQty === undefined || availableQty === null) {
        const received = inPart.receivedQty || 0
        availableQty = inPart.qty - received
      }
      
      const requestedQty = outPart.receivedQty || outPart.qty || 0
      
      console.log(`🔍 Checking ${inPart.partName}: Total: ${inPart.qty}, Received: ${inPart.receivedQty || 0}, Remaining: ${availableQty}, Requested: ${requestedQty}`)
      console.log(`📏 Dimensions for ${inPart.partName}: Width: ${inPart.blankWidth}, Length: ${inPart.blankLength}, SQFT: ${inPart.blankSizeSqft}`)
      
      if (availableQty <= 0) {
        return { 
          valid: false, 
          error: `No remaining quantity for ${outPart.partName}. Already received: ${inPart.receivedQty || 0} of ${inPart.qty}` 
        }
      }
      
      if (requestedQty > availableQty) {
        return { 
          valid: false, 
          error: `Insufficient inward quantity for ${outPart.partName}. Available: ${availableQty}, Requested: ${requestedQty}` 
        }
      }
    }

    return { valid: true }
  } catch (error) {
    console.error('Error checking inward order:', error)
    return { valid: false, error: 'Failed to check inward order' }
  }
}

export async function GET(_req: NextRequest) {
  try {
    const paintOutwardOps = await client.fetch(`
      *[_type == "paint-out-opr"] | order(_createdAt desc) {
        _id,
        _createdAt,
        workOrderNo,
        gatepassNo,
        inwardChallanNo,
        dateIssued,
        remarks,
        inwardOrderId,
        total,
        totalWeight,
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
          gauge,
          material,
          qty,
          remainingQty,
          completedQty,
          paintCostPerPiece,
          totalPrice,
          totalWeight,
          storeItemId,
          inwardPartId,
          receivedQty
        }
      }
    `)

    // Log sample data for debugging
    if (paintOutwardOps && paintOutwardOps.length > 0 && paintOutwardOps[0].parts && paintOutwardOps[0].parts.length > 0) {
      console.log('📊 Sample outward part data:', {
        partName: paintOutwardOps[0].parts[0].partName,
        blankWidth: paintOutwardOps[0].parts[0].blankWidth,
        blankLength: paintOutwardOps[0].parts[0].blankLength,
        blankSizeSqft: paintOutwardOps[0].parts[0].blankSizeSqft,
        material: paintOutwardOps[0].parts[0].material,
        gauge: paintOutwardOps[0].parts[0].gauge
      })
    }

    return NextResponse.json({ 
      data: paintOutwardOps || [], 
      success: true 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching paint outward operations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paint outward operations', success: false, data: [] },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured', success: false },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { 
      workOrderNo, 
      gatepassNo, 
      inwardChallanNo, 
      dateIssued, 
      remarks, 
      parts, 
      inwardOrderId,
      totalWeight 
    } = body

    console.log('=== 🚀 POST: Creating Paint Outward Operation ===')
    console.log('Inward Order ID:', inwardOrderId)
    console.log('Parts to outward:', parts.map((p: Part) => ({ 
      partNo: p.partNo, 
      partName: p.partName, 
      receivedQty: p.receivedQty || p.qty,
      blankWidth: p.blankWidth,
      blankLength: p.blankLength,
      blankSizeSqft: p.blankSizeSqft,
      storeItemId: p.storeItemId 
    })))

    // Validation
    if (!workOrderNo || workOrderNo.trim() === '') {
      return NextResponse.json(
        { error: 'Work Order Number is required', success: false },
        { status: 400 }
      )
    }

    if (!gatepassNo || gatepassNo.trim() === '') {
      return NextResponse.json(
        { error: 'Gate Pass Number is required', success: false },
        { status: 400 }
      )
    }

    if (!dateIssued) {
      return NextResponse.json(
        { error: 'Date Issued is required', success: false },
        { status: 400 }
      )
    }

    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: 'At least one part is required', success: false },
        { status: 400 }
      )
    }

    // Check if all parts exist in store
    const stockCheck = await checkStoreStock(parts)
    if (!stockCheck.valid) {
      return NextResponse.json(
        { error: stockCheck.error, success: false },
        { status: 400 }
      )
    }

    // Check if inward order has sufficient remaining quantity
    if (inwardOrderId) {
      const quantityCheck = await checkInwardOrderRemainingQuantity(inwardOrderId, parts)
      if (!quantityCheck.valid) {
        return NextResponse.json(
          { error: quantityCheck.error, success: false },
          { status: 400 }
        )
      }
    }

    // Check for existing work order
    const existingWorkOrder = await client.fetch(
      `*[_type == "paint-out-opr" && workOrderNo == $workOrderNo][0] { _id }`,
      { workOrderNo }
    )

    if (existingWorkOrder) {
      return NextResponse.json(
        { error: 'Work order number already exists', success: false },
        { status: 400 }
      )
    }

    // Check for existing gatepass
    const existingGatepass = await client.fetch(
      `*[_type == "paint-out-opr" && gatepassNo == $gatepassNo][0] { _id }`,
      { gatepassNo }
    )

    if (existingGatepass) {
      return NextResponse.json(
        { error: 'Gate pass number already exists', success: false },
        { status: 400 }
      )
    }

    // Process parts with all fields - preserve dimensions from inward
    const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
      const outwardQty = part.receivedQty || part.qty || 0
      const partForCalc = { ...part, qty: outwardQty }
      const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
      console.log(`📦 Formatting part ${part.partName}:`, {
        blankWidth: part.blankWidth,
        blankLength: part.blankLength,
        blankSizeSqft: part.blankSizeSqft,
        outwardQty: outwardQty
      })
      
      return {
        _key: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
        partNo: part.partNo,
        partName: part.partName,
        category: part.category,
        storeLocation: part.storeLocation,
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft || 0,
        weight: part.weight || 0,
        sheetCost: part.sheetCost || 0,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: outwardQty,
        remainingQty: part.remainingQty || outwardQty,
        completedQty: part.completedQty || 0,
        paintCostPerPiece: paintCostPerPiece,
        totalPrice: totalPrice,
        totalWeight: partTotalWeight,
        storeItemId: part.storeItemId || '',
        inwardPartId: part.inwardPartId || '',
        receivedQty: part.receivedQty || 0
      }
    })

    const total = calculateOrderTotal(formattedParts)
    const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

    // Create paint outward operation
    const result = await writeClient.create({
      _type: 'paint-out-opr',
      workOrderNo: workOrderNo.trim(),
      gatepassNo: gatepassNo.trim(),
      inwardChallanNo: inwardChallanNo || '',
      dateIssued: new Date(dateIssued).toISOString(),
      remarks: remarks || '',
      inwardOrderId: inwardOrderId || '',
      parts: formattedParts,
      total: total,
      totalWeight: calculatedTotalWeight
    })

    console.log('✅ Paint outward operation created:', result._id)

    // Update store stock - ADD the received quantity to store
    const stockUpdateResults = await updateStoreStock(parts, 'add')
    const failedStockUpdates = stockUpdateResults.filter(r => !r.success)
    if (failedStockUpdates.length > 0) {
      console.error('Some stock updates failed:', failedStockUpdates)
    }

    // Update inward order's receivedQty and remainingQty
    if (inwardOrderId) {
      const updated = await updateInwardOrder(inwardOrderId, parts)
      if (!updated) {
        console.error('❌ Failed to update inward order quantities')
      } else {
        console.log('✅ Successfully updated inward order - received and remaining quantities')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Paint outward operation created successfully. Store stock updated.',
      data: result
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating paint outward operation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create paint outward operation', 
        success: false,
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
        { error: 'Write token not configured', success: false },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { id, workOrderNo, gatepassNo, inwardChallanNo, dateIssued, remarks, parts, totalWeight } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Work order ID is required', success: false },
        { status: 400 }
      )
    }

    if (!workOrderNo || workOrderNo.trim() === '') {
      return NextResponse.json(
        { error: 'Work Order Number is required', success: false },
        { status: 400 }
      )
    }

    if (!gatepassNo || gatepassNo.trim() === '') {
      return NextResponse.json(
        { error: 'Gate Pass Number is required', success: false },
        { status: 400 }
      )
    }

    if (!dateIssued) {
      return NextResponse.json(
        { error: 'Date Issued is required', success: false },
        { status: 400 }
      )
    }

    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: 'At least one part is required', success: false },
        { status: 400 }
      )
    }

    // Check if all parts exist in store
    const stockCheck = await checkStoreStock(parts)
    if (!stockCheck.valid) {
      return NextResponse.json(
        { error: stockCheck.error, success: false },
        { status: 400 }
      )
    }

    // Fetch existing document to restore stock
    const existingDoc = await client.fetch(
      `*[_type == "paint-out-opr" && _id == $id][0] { 
        _id,
        parts[] {
          storeItemId,
          partNo,
          partName,
          qty,
          receivedQty
        }
      }`,
      { id }
    ) as { _id: string; parts: Part[] } | null

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Paint outward operation not found', success: false },
        { status: 404 }
      )
    }

    // Restore stock for old parts
    if (existingDoc.parts && existingDoc.parts.length > 0) {
      await updateStoreStock(existingDoc.parts, 'restore')
    }

    // Process parts with all fields
    const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
      const outwardQty = part.receivedQty || part.qty || 0
      const partForCalc = { ...part, qty: outwardQty }
      const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
      const existingPart = existingDoc.parts?.find((p: Part) => p.storeItemId === part.storeItemId)
      
      return {
        _key: existingPart?._key || `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
        partNo: part.partNo,
        partName: part.partName,
        category: part.category,
        storeLocation: part.storeLocation,
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft || 0,
        weight: part.weight || 0,
        sheetCost: part.sheetCost || 0,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: outwardQty,
        remainingQty: part.remainingQty || outwardQty,
        completedQty: part.completedQty || 0,
        paintCostPerPiece: paintCostPerPiece,
        totalPrice: totalPrice,
        totalWeight: partTotalWeight,
        storeItemId: part.storeItemId || '',
        receivedQty: part.receivedQty || 0
      }
    })

    const total = calculateOrderTotal(formattedParts)
    const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

    // Add stock for new/updated parts
    await updateStoreStock(parts, 'add')

    // Update the outward operation
    const result = await writeClient
      .patch(id)
      .set({
        workOrderNo: workOrderNo.trim(),
        gatepassNo: gatepassNo.trim(),
        inwardChallanNo: inwardChallanNo || '',
        dateIssued: new Date(dateIssued).toISOString(),
        remarks: remarks || '',
        parts: formattedParts,
        total: total,
        totalWeight: calculatedTotalWeight
      })
      .commit()

    return NextResponse.json({
      success: true,
      message: 'Paint outward operation updated successfully',
      data: result
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating paint outward operation:', error)
    return NextResponse.json(
      { error: 'Failed to update paint outward operation', success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured', success: false },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Work order ID is required', success: false },
        { status: 400 }
      )
    }

    // Get the work order to restore stock
    const workOrder = await client.fetch(
      `*[_type == "paint-out-opr" && _id == $id][0] { 
        _id,
        parts[] {
          storeItemId,
          partNo,
          partName,
          qty,
          receivedQty
        }
      }`,
      { id }
    ) as { _id: string; parts: Part[] } | null

    if (!workOrder) {
      return NextResponse.json(
        { error: 'Paint outward operation not found', success: false },
        { status: 404 }
      )
    }

    // Restore stock for all parts
    if (workOrder.parts && workOrder.parts.length > 0) {
      await updateStoreStock(workOrder.parts, 'restore')
    }

    await writeClient.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Paint outward operation deleted successfully. Store stock restored.'
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting paint outward operation:', error)
    return NextResponse.json(
      { error: 'Failed to delete paint outward operation', success: false },
      { status: 500 }
    )
  }
}