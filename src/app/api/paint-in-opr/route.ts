// // app/api/paint-in-opr/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { client, writeClient, canWrite } from '@/sanity/lib/client'

// // Define interfaces
// interface Part {
//   partNo: string
//   partName: string
//   category: string
//   storeLocation: string
//   blankWidth?: number
//   blankLength?: number
//   blankSizeSqft?: number
//   weight?: number
//   paintCostPerSqft?: number
//   gauge?: string
//   material?: string
//   qty: number
//   storeItemId?: string
// }

// interface FormattedPart {
//   _key: string
//   partNo: string
//   partName: string
//   category: string
//   storeLocation: string
//   blankWidth: number
//   blankLength: number
//   blankSizeSqft: number
//   weight: number
//   paintCostPerSqft: number
//   paintCostPerPiece: number
//   gauge: string
//   material: string
//   qty: number
//   receivedQty: number
//   remainingQty: number
//   totalPrice: number
//   totalWeight: number
//   storeItemId: string
// }

// interface ExistingPart {
//   _key: string
//   partNo: string
//   qty: number
//   storeItemId?: string
// }

// interface ExistingDocument {
//   _id: string
//   workOrderNo: string
//   gatepassNo: string
//   parts: ExistingPart[]
// }

// interface StoreItem {
//   _id: string
//   stockInStore: number
//   partName: string
// }

// // Helper function to calculate values for a part
// function calculatePartValues(part: Part): { paintCostPerPiece: number; totalPrice: number; totalWeight: number } {
//   const paintCostPerPiece = (part.blankSizeSqft || 0) * (part.paintCostPerSqft || 0)
//   const totalPrice = paintCostPerPiece * (part.qty || 0)
//   const totalWeight = (part.weight || 0) * (part.qty || 0)
//   return { paintCostPerPiece, totalPrice, totalWeight }
// }

// // Helper function to calculate order total
// function calculateOrderTotal(parts: FormattedPart[]): number {
//   return parts.reduce((sum: number, part: FormattedPart) => sum + (part.totalPrice || 0), 0)
// }

// // Helper function to calculate order total weight
// function calculateOrderTotalWeight(parts: FormattedPart[]): number {
//   return parts.reduce((sum: number, part: FormattedPart) => sum + (part.totalWeight || 0), 0)
// }

// // GET - Fetch all paint inward operations
// export async function GET(_req: NextRequest) {
//   try {
//     const query = `*[_type == "paint-in-opr"] | order(_createdAt desc) {
//       _id,
//       _createdAt,
//       workOrderNo,
//       gatepassNo,
//       dateIssued,
//       remarks,
//       total,
//       totalWeight,
//       parts[] {
//         _key,
//         partNo,
//         partName,
//         category,
//         storeLocation,
//         blankWidth,
//         blankLength,
//         blankSizeSqft,
//         weight,
//         paintCostPerSqft,
//         paintCostPerPiece,
//         gauge,
//         material,
//         qty,
//         receivedQty,
//         remainingQty,
//         totalPrice,
//         totalWeight,
//         storeItemId
//       }
//     }`
    
//     const paintInwardOps = await client.fetch(query)
    
//     console.log('Paint Inward Ops fetched:', paintInwardOps.length)
//     if (paintInwardOps.length > 0 && paintInwardOps[0].parts) {
//       console.log('Sample part from inward:', {
//         partName: paintInwardOps[0].parts[0]?.partName,
//         blankWidth: paintInwardOps[0].parts[0]?.blankWidth,
//         blankLength: paintInwardOps[0].parts[0]?.blankLength,
//         weight: paintInwardOps[0].parts[0]?.weight,
//         blankSizeSqft: paintInwardOps[0].parts[0]?.blankSizeSqft,
//         paintCostPerSqft: paintInwardOps[0].parts[0]?.paintCostPerSqft
//       })
//     }
    
//     return NextResponse.json({ 
//       data: paintInwardOps || [], 
//       success: true 
//     }, { status: 200 })

//   } catch (error) {
//     console.error('Error fetching paint inward operations:', error)
//     return NextResponse.json(
//       { 
//         error: 'Failed to fetch paint inward operations', 
//         success: false,
//         data: []
//       },
//       { status: 500 }
//     )
//   }
// }

// // POST - Create new paint inward operation
// export async function POST(req: Request) {
//   try {
//     if (!canWrite()) {
//       return NextResponse.json(
//         { error: 'Write token not configured' },
//         { status: 500 }
//       )
//     }

//     const body = await req.json()
//     const { workOrderNo, gatepassNo, dateIssued, remarks, parts } = body

//     console.log('=== POST: Creating Paint Inward Work Order ===')
//     console.log('Parts count:', parts?.length)

//     // Validate required fields
//     if (!workOrderNo || workOrderNo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Work Order Number is required' },
//         { status: 400 }
//       )
//     }

//     if (!gatepassNo || gatepassNo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Gate Pass Number is required' },
//         { status: 400 }
//       )
//     }

//     if (!dateIssued) {
//       return NextResponse.json(
//         { error: 'Date Issued is required' },
//         { status: 400 }
//       )
//     }

//     if (!parts || parts.length === 0) {
//       return NextResponse.json(
//         { error: 'At least one part is required' },
//         { status: 400 }
//       )
//     }

//     // ===== DUPLICATE WORK ORDER CHECK REMOVED - Now multiple same work order numbers allowed =====
//     // Removed: existingWorkOrder check for workOrderNo
    
//     // Check for existing gatepass only (gatepass must be unique)
//     const existingGatepass = await client.fetch(
//       `*[_type == "paint-in-opr" && gatepassNo == $gatepassNo][0] { _id }`,
//       { gatepassNo }
//     )

//     if (existingGatepass) {
//       return NextResponse.json(
//         { error: 'Gate pass number already exists' },
//         { status: 400 }
//       )
//     }

//     // Calculate values for each part
//     const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
//       const { paintCostPerPiece, totalPrice, totalWeight } = calculatePartValues(part)
      
//       console.log(`Processing part ${index}:`, {
//         partName: part.partName,
//         blankWidth: part.blankWidth,
//         blankLength: part.blankLength,
//         blankSizeSqft: part.blankSizeSqft,
//         weight: part.weight,
//         paintCostPerSqft: part.paintCostPerSqft,
//         qty: part.qty,
//         paintCostPerPiece,
//         totalPrice,
//         totalWeight
//       })
      
//       return {
//         _key: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
//         partNo: part.partNo,
//         partName: part.partName,
//         category: part.category,
//         storeLocation: part.storeLocation,
//         blankWidth: part.blankWidth || 0,
//         blankLength: part.blankLength || 0,
//         blankSizeSqft: part.blankSizeSqft || 0,
//         weight: part.weight || 0,
//         paintCostPerSqft: part.paintCostPerSqft || 0,
//         paintCostPerPiece: paintCostPerPiece,
//         gauge: part.gauge || '',
//         material: part.material || '',
//         qty: Number(part.qty),
//         receivedQty: 0,
//         remainingQty: Number(part.qty),
//         totalPrice: totalPrice,
//         totalWeight: totalWeight,
//         storeItemId: part.storeItemId || ''
//       }
//     })

//     // Calculate order totals
//     const total = calculateOrderTotal(formattedParts)
//     const totalWeight = calculateOrderTotalWeight(formattedParts)

//     console.log('Formatted parts with all fields:', formattedParts.map((p: FormattedPart) => ({
//       name: p.partName,
//       blankWidth: p.blankWidth,
//       blankLength: p.blankLength,
//       weight: p.weight,
//       paintCostPerSqft: p.paintCostPerSqft,
//       paintCostPerPiece: p.paintCostPerPiece,
//       qty: p.qty,
//       totalPrice: p.totalPrice,
//       totalWeight: p.totalWeight
//     })))

//     // Create new document
//     const result = await writeClient.create({
//       _type: 'paint-in-opr',
//       workOrderNo: workOrderNo.trim(),
//       gatepassNo: gatepassNo.trim(),
//       dateIssued: new Date(dateIssued).toISOString(),
//       remarks: remarks || '',
//       parts: formattedParts,
//       total: total,
//       totalWeight: totalWeight
//     })
    
//     console.log('Successfully created paint inward work order:', result._id)
//     console.log('Total order value:', total)
//     console.log('Total order weight:', totalWeight)

//     // Update stock for each part (deduct quantity)
//     for (const part of parts) {
//       if (part.storeItemId) {
//         try {
//           const storeItem = await client.fetch(
//             `*[_type == "store" && _id == $storeItemId][0] { _id, stockInStore, partNumber, partName }`,
//             { storeItemId: part.storeItemId }
//           )
          
//           if (storeItem) {
//             const newStock = Math.max(0, storeItem.stockInStore - Number(part.qty))
//             await writeClient
//               .patch(storeItem._id)
//               .set({ stockInStore: newStock })
//               .commit()
//             console.log(`Updated stock for ${storeItem.partName}: ${newStock} (deducted ${part.qty})`)
//           } else {
//             console.warn(`Store item not found for ID: ${part.storeItemId}`)
//           }
//         } catch (stockError) {
//           console.error('Error updating stock for part:', part.partName, stockError)
//         }
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Paint inward work order created successfully',
//       data: result
//     }, { status: 201 })

//   } catch (error) {
//     console.error('Error creating paint inward work order:', error)
//     return NextResponse.json(
//       { 
//         error: 'Failed to create paint inward work order', 
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     )
//   }
// }

// // PUT - Update existing paint inward operation
// export async function PUT(req: Request) {
//   try {
//     if (!canWrite()) {
//       return NextResponse.json(
//         { error: 'Write token not configured' },
//         { status: 500 }
//       )
//     }

//     const body = await req.json()
//     const { id, workOrderNo, gatepassNo, dateIssued, remarks, parts } = body

//     console.log('=== PUT: Updating Paint Inward Work Order ===')
//     console.log('Received PUT request for ID:', id)

//     if (!id) {
//       return NextResponse.json(
//         { error: 'Work order ID is required' },
//         { status: 400 }
//       )
//     }

//     if (!workOrderNo || workOrderNo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Work Order Number is required' },
//         { status: 400 }
//       )
//     }

//     if (!gatepassNo || gatepassNo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Gate Pass Number is required' },
//         { status: 400 }
//       )
//     }

//     if (!dateIssued) {
//       return NextResponse.json(
//         { error: 'Date Issued is required' },
//         { status: 400 }
//       )
//     }

//     if (!parts || parts.length === 0) {
//       return NextResponse.json(
//         { error: 'At least one part is required' },
//         { status: 400 }
//       )
//     }

//     // Get existing parts to calculate stock differences
//     const existingDoc = await client.fetch(
//       `*[_type == "paint-in-opr" && _id == $id][0] { 
//         _id,
//         workOrderNo,
//         gatepassNo,
//         parts[] {
//           _key,
//           partNo,
//           qty,
//           storeItemId
//         }
//       }`,
//       { id }
//     ) as ExistingDocument | null

//     if (!existingDoc) {
//       return NextResponse.json(
//         { error: 'Work order not found' },
//         { status: 404 }
//       )
//     }

//     // Create a map of old parts by partNo
//     const oldPartsMap = new Map<string, ExistingPart>()
//     for (const oldPart of existingDoc.parts || []) {
//       oldPartsMap.set(oldPart.partNo, oldPart)
//     }

//     // Restore stock for parts that were removed or reduced
//     for (const [partNo, oldPart] of oldPartsMap) {
//       const newPart = parts.find((p: Part) => p.partNo === partNo)
      
//       if (!newPart) {
//         // Part was removed - restore full quantity
//         await updateStockByStoreItemId(oldPart.storeItemId, oldPart.qty, 'add')
//         console.log(`Restored stock for removed part ${partNo}: +${oldPart.qty}`)
//       } else if (newPart.qty !== oldPart.qty) {
//         // Quantity changed - adjust difference
//         const difference = oldPart.qty - newPart.qty
//         if (difference > 0) {
//           await updateStockByStoreItemId(oldPart.storeItemId, difference, 'add')
//           console.log(`Restored stock for ${partNo}: +${difference}`)
//         } else if (difference < 0) {
//           await updateStockByStoreItemId(oldPart.storeItemId, Math.abs(difference), 'deduct')
//           console.log(`Deducted stock for ${partNo}: -${Math.abs(difference)}`)
//         }
//       }
//     }

//     // Deduct stock for new parts that weren't in the original order
//     for (const newPart of parts) {
//       if (!oldPartsMap.has(newPart.partNo) && newPart.storeItemId) {
//         await updateStockByStoreItemId(newPart.storeItemId, newPart.qty, 'deduct')
//         console.log(`Deducted stock for new part ${newPart.partNo}: -${newPart.qty}`)
//       }
//     }

//     // Calculate values for each part
//     const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
//       const { paintCostPerPiece, totalPrice, totalWeight } = calculatePartValues(part)
      
//       // Find existing part to preserve _key if it exists
//       const existingPart = existingDoc.parts?.find((p: ExistingPart) => p.partNo === part.partNo)
      
//       return {
//         _key: existingPart?._key || `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
//         partNo: part.partNo,
//         partName: part.partName,
//         category: part.category,
//         storeLocation: part.storeLocation,
//         blankWidth: part.blankWidth || 0,
//         blankLength: part.blankLength || 0,
//         blankSizeSqft: part.blankSizeSqft || 0,
//         weight: part.weight || 0,
//         paintCostPerSqft: part.paintCostPerSqft || 0,
//         paintCostPerPiece: paintCostPerPiece,
//         gauge: part.gauge || '',
//         material: part.material || '',
//         qty: Number(part.qty),
//         receivedQty: 0,
//         remainingQty: Number(part.qty),
//         totalPrice: totalPrice,
//         totalWeight: totalWeight,
//         storeItemId: part.storeItemId || ''
//       }
//     })

//     // Calculate order totals
//     const total = calculateOrderTotal(formattedParts)
//     const totalWeight = calculateOrderTotalWeight(formattedParts)

//     const result = await writeClient
//       .patch(id)
//       .set({
//         workOrderNo: workOrderNo.trim(),
//         gatepassNo: gatepassNo.trim(),
//         dateIssued: new Date(dateIssued).toISOString(),
//         remarks: remarks || '',
//         parts: formattedParts,
//         total: total,
//         totalWeight: totalWeight
//       })
//       .commit()

//     console.log('Paint inward work order updated successfully:', result._id)

//     return NextResponse.json({
//       success: true,
//       message: 'Paint inward work order updated successfully',
//       data: result
//     }, { status: 200 })

//   } catch (error) {
//     console.error('Error updating paint inward work order:', error)
//     return NextResponse.json(
//       { error: 'Failed to update paint inward work order' },
//       { status: 500 }
//     )
//   }
// }

// // DELETE - Remove paint inward operation
// export async function DELETE(req: NextRequest) {
//   try {
//     if (!canWrite()) {
//       return NextResponse.json(
//         { error: 'Write token not configured' },
//         { status: 500 }
//       )
//     }

//     const { searchParams } = new URL(req.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { error: 'Work order ID is required' },
//         { status: 400 }
//       )
//     }

//     console.log('Deleting paint inward work order with ID:', id)

//     // Get the document to restore stock
//     const workOrder = await client.fetch(
//       `*[_type == "paint-in-opr" && _id == $id][0] { 
//         _id,
//         parts[] {
//           storeItemId,
//           partNo,
//           qty
//         }
//       }`,
//       { id }
//     )

//     if (!workOrder) {
//       return NextResponse.json(
//         { error: 'Work order not found' },
//         { status: 404 }
//       )
//     }

//     // Restore stock for all parts
//     if (workOrder.parts && workOrder.parts.length > 0) {
//       for (const part of workOrder.parts) {
//         if (part.storeItemId) {
//           await updateStockByStoreItemId(part.storeItemId, part.qty, 'add')
//           console.log(`Restored stock for ${part.partNo}: +${part.qty}`)
//         }
//       }
//     }

//     const result = await writeClient.delete(id)

//     return NextResponse.json({
//       success: true,
//       message: 'Paint inward work order deleted successfully',
//       data: result
//     }, { status: 200 })

//   } catch (error) {
//     console.error('Error deleting paint inward work order:', error)
//     return NextResponse.json(
//       { error: 'Failed to delete paint inward work order' },
//       { status: 500 }
//     )
//   }
// }

// // Helper function to update stock by storeItemId
// async function updateStockByStoreItemId(storeItemId: string | undefined, quantity: number, operation: 'add' | 'deduct'): Promise<boolean> {
//   if (!storeItemId) {
//     console.warn('No storeItemId provided for stock update')
//     return false
//   }
  
//   try {
//     const storeItem = await client.fetch(
//       `*[_type == "store" && _id == $storeItemId][0] { _id, stockInStore, partName, partNumber }`,
//       { storeItemId }
//     ) as StoreItem | null
    
//     if (storeItem) {
//       let newStock = storeItem.stockInStore
//       if (operation === 'add') {
//         newStock = storeItem.stockInStore + quantity
//       } else {
//         newStock = Math.max(0, storeItem.stockInStore - quantity)
//       }
      
//       await writeClient
//         .patch(storeItem._id)
//         .set({ stockInStore: newStock })
//         .commit()
      
//       console.log(`Stock updated for ${storeItem.partName}: ${newStock} (${operation}ed ${quantity})`)
//       return true
//     }
//     console.warn(`Store item not found for ID: ${storeItemId}`)
//     return false
//   } catch (error) {
//     console.error(`Error updating stock for ${storeItemId}:`, error)
//     return false
//   }
// }



// app/api/paint-in-opr/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client, writeClient, canWrite } from '@/sanity/lib/client'

// Define interfaces
interface Part {
  partNo: string
  partName: string
  category: string
  storeLocation: string
  blankWidth?: number
  blankLength?: number
  blankSizeSqft?: number
  weight?: number
  paintCostPerSqft?: number
  gauge?: string
  material?: string
  qty: number
  storeItemId?: string
}

interface FormattedPart {
  _key: string
  partNo: string
  partName: string
  category: string
  storeLocation: string
  blankWidth: number
  blankLength: number
  blankSizeSqft: number
  weight: number
  paintCostPerSqft: number
  paintCostPerPiece: number
  gauge: string
  material: string
  qty: number
  receivedQty: number
  remainingQty: number
  totalPrice: number
  totalWeight: number
  storeItemId: string
}

interface ExistingPart {
  _key: string
  partNo: string
  qty: number
  storeItemId?: string
}

interface ExistingDocument {
  _id: string
  workOrderNo: string
  gatepassNo: string
  mwo: string
  parts: ExistingPart[]
}

interface StoreItem {
  _id: string
  stockInStore: number
  partName: string
}

// Helper function to calculate values for a part
function calculatePartValues(part: Part): { paintCostPerPiece: number; totalPrice: number; totalWeight: number } {
  const paintCostPerPiece = (part.blankSizeSqft || 0) * (part.paintCostPerSqft || 0)
  const totalPrice = paintCostPerPiece * (part.qty || 0)
  const totalWeight = (part.weight || 0) * (part.qty || 0)
  return { paintCostPerPiece, totalPrice, totalWeight }
}

// Helper function to calculate order total
function calculateOrderTotal(parts: FormattedPart[]): number {
  return parts.reduce((sum: number, part: FormattedPart) => sum + (part.totalPrice || 0), 0)
}

// Helper function to calculate order total weight
function calculateOrderTotalWeight(parts: FormattedPart[]): number {
  return parts.reduce((sum: number, part: FormattedPart) => sum + (part.totalWeight || 0), 0)
}

// GET - Fetch all paint inward operations
export async function GET(_req: NextRequest) {
  try {
    const query = `*[_type == "paint-in-opr"] | order(_createdAt desc) {
      _id,
      _createdAt,
      workOrderNo,
      gatepassNo,
      mwo,
      dateIssued,
      remarks,
      total,
      totalWeight,
      parts[] {
        _key,
        partNo,
        partName,
        category,
        storeLocation,
        blankWidth,
        blankLength,
        blankSizeSqft,
        weight,
        paintCostPerSqft,
        paintCostPerPiece,
        gauge,
        material,
        qty,
        receivedQty,
        remainingQty,
        totalPrice,
        totalWeight,
        storeItemId
      }
    }`
    
    const paintInwardOps = await client.fetch(query)
    
    console.log('Paint Inward Ops fetched:', paintInwardOps.length)
    if (paintInwardOps.length > 0 && paintInwardOps[0].parts) {
      console.log('Sample part from inward:', {
        partName: paintInwardOps[0].parts[0]?.partName,
        blankWidth: paintInwardOps[0].parts[0]?.blankWidth,
        blankLength: paintInwardOps[0].parts[0]?.blankLength,
        weight: paintInwardOps[0].parts[0]?.weight,
        blankSizeSqft: paintInwardOps[0].parts[0]?.blankSizeSqft,
        paintCostPerSqft: paintInwardOps[0].parts[0]?.paintCostPerSqft
      })
    }
    
    return NextResponse.json({ 
      data: paintInwardOps || [], 
      success: true 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching paint inward operations:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch paint inward operations', 
        success: false,
        data: []
      },
      { status: 500 }
    )
  }
}

// POST - Create new paint inward operation
export async function POST(req: Request) {
  try {
    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { workOrderNo, gatepassNo, mwo, dateIssued, remarks, parts } = body

    console.log('=== POST: Creating Paint Inward Work Order ===')
    console.log('Work Order No:', workOrderNo)
    console.log('MWO (Document Ref):', mwo)
    console.log('Parts count:', parts?.length)

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

    if (!mwo || mwo.trim() === '') {
      return NextResponse.json(
        { error: 'Document Reference Number (MWO) is required' },
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

    // Check for existing gatepass only (gatepass must be unique)
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

    // Calculate values for each part
    const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
      const { paintCostPerPiece, totalPrice, totalWeight } = calculatePartValues(part)
      
      console.log(`Processing part ${index}:`, {
        partName: part.partName,
        blankWidth: part.blankWidth,
        blankLength: part.blankLength,
        blankSizeSqft: part.blankSizeSqft,
        weight: part.weight,
        paintCostPerSqft: part.paintCostPerSqft,
        qty: part.qty,
        paintCostPerPiece,
        totalPrice,
        totalWeight
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
        paintCostPerSqft: part.paintCostPerSqft || 0,
        paintCostPerPiece: paintCostPerPiece,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: Number(part.qty),
        receivedQty: 0,
        remainingQty: Number(part.qty),
        totalPrice: totalPrice,
        totalWeight: totalWeight,
        storeItemId: part.storeItemId || ''
      }
    })

    // Calculate order totals
    const total = calculateOrderTotal(formattedParts)
    const totalWeight = calculateOrderTotalWeight(formattedParts)

    console.log('Formatted parts with all fields:', formattedParts.map((p: FormattedPart) => ({
      name: p.partName,
      blankWidth: p.blankWidth,
      blankLength: p.blankLength,
      weight: p.weight,
      paintCostPerSqft: p.paintCostPerSqft,
      paintCostPerPiece: p.paintCostPerPiece,
      qty: p.qty,
      totalPrice: p.totalPrice,
      totalWeight: p.totalWeight
    })))

    // Create new document
    const result = await writeClient.create({
      _type: 'paint-in-opr',
      workOrderNo: workOrderNo.trim(),
      gatepassNo: gatepassNo.trim(),
      mwo: mwo.trim(),
      dateIssued: new Date(dateIssued).toISOString(),
      remarks: remarks || '',
      parts: formattedParts,
      total: total,
      totalWeight: totalWeight
    })
    
    console.log('Successfully created paint inward work order:', result._id)
    console.log('Total order value:', total)
    console.log('Total order weight:', totalWeight)

    // Update stock for each part (deduct quantity)
    for (const part of parts) {
      if (part.storeItemId) {
        try {
          const storeItem = await client.fetch(
            `*[_type == "store" && _id == $storeItemId][0] { _id, stockInStore, partNumber, partName }`,
            { storeItemId: part.storeItemId }
          )
          
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
      message: 'Paint inward work order created successfully',
      data: result
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating paint inward work order:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create paint inward work order', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update existing paint inward operation
export async function PUT(req: Request) {
  try {
    if (!canWrite()) {
      return NextResponse.json(
        { error: 'Write token not configured' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { id, workOrderNo, gatepassNo, mwo, dateIssued, remarks, parts } = body

    console.log('=== PUT: Updating Paint Inward Work Order ===')
    console.log('Received PUT request for ID:', id)

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

    if (!mwo || mwo.trim() === '') {
      return NextResponse.json(
        { error: 'Document Reference Number (MWO) is required' },
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
        mwo,
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
      const newPart = parts.find((p: Part) => p.partNo === partNo)
      
      if (!newPart) {
        // Part was removed - restore full quantity
        await updateStockByStoreItemId(oldPart.storeItemId, oldPart.qty, 'add')
        console.log(`Restored stock for removed part ${partNo}: +${oldPart.qty}`)
      } else if (newPart.qty !== oldPart.qty) {
        // Quantity changed - adjust difference
        const difference = oldPart.qty - newPart.qty
        if (difference > 0) {
          await updateStockByStoreItemId(oldPart.storeItemId, difference, 'add')
          console.log(`Restored stock for ${partNo}: +${difference}`)
        } else if (difference < 0) {
          await updateStockByStoreItemId(oldPart.storeItemId, Math.abs(difference), 'deduct')
          console.log(`Deducted stock for ${partNo}: -${Math.abs(difference)}`)
        }
      }
    }

    // Deduct stock for new parts that weren't in the original order
    for (const newPart of parts) {
      if (!oldPartsMap.has(newPart.partNo) && newPart.storeItemId) {
        await updateStockByStoreItemId(newPart.storeItemId, newPart.qty, 'deduct')
        console.log(`Deducted stock for new part ${newPart.partNo}: -${newPart.qty}`)
      }
    }

    // Calculate values for each part
    const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
      const { paintCostPerPiece, totalPrice, totalWeight } = calculatePartValues(part)
      
      // Find existing part to preserve _key if it exists
      const existingPart = existingDoc.parts?.find((p: ExistingPart) => p.partNo === part.partNo)
      
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
        paintCostPerSqft: part.paintCostPerSqft || 0,
        paintCostPerPiece: paintCostPerPiece,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: Number(part.qty),
        receivedQty: 0,
        remainingQty: Number(part.qty),
        totalPrice: totalPrice,
        totalWeight: totalWeight,
        storeItemId: part.storeItemId || ''
      }
    })

    // Calculate order totals
    const total = calculateOrderTotal(formattedParts)
    const totalWeight = calculateOrderTotalWeight(formattedParts)

    const result = await writeClient
      .patch(id)
      .set({
        workOrderNo: workOrderNo.trim(),
        gatepassNo: gatepassNo.trim(),
        mwo: mwo.trim(),
        dateIssued: new Date(dateIssued).toISOString(),
        remarks: remarks || '',
        parts: formattedParts,
        total: total,
        totalWeight: totalWeight
      })
      .commit()

    console.log('Paint inward work order updated successfully:', result._id)

    return NextResponse.json({
      success: true,
      message: 'Paint inward work order updated successfully',
      data: result
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating paint inward work order:', error)
    return NextResponse.json(
      { error: 'Failed to update paint inward work order' },
      { status: 500 }
    )
  }
}

// DELETE - Remove paint inward operation
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
    )

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
      message: 'Paint inward work order deleted successfully',
      data: result
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting paint inward work order:', error)
    return NextResponse.json(
      { error: 'Failed to delete paint inward work order' },
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
      
      console.log(`Stock updated for ${storeItem.partName}: ${newStock} (${operation}ed ${quantity})`)
      return true
    }
    console.warn(`Store item not found for ID: ${storeItemId}`)
    return false
  } catch (error) {
    console.error(`Error updating stock for ${storeItemId}:`, error)
    return false
  }
}