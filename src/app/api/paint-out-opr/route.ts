// // // // app/api/paint-out-opr/route.ts
// // // import { NextRequest, NextResponse } from 'next/server'
// // // import { client, writeClient, canWrite } from '@/sanity/lib/client'

// // // // Define interfaces
// // // interface Part {
// // //   partNo: string;
// // //   partName: string;
// // //   category: string;
// // //   storeLocation: string;
// // //   _key?: string; 
// // //   blankWidth?: number;
// // //   blankLength?: number;
// // //   blankSizeSqft?: number;
// // //   weight?: number;
// // //   sheetCost?: number;
// // //   gauge?: string;
// // //   material?: string;
// // //   qty: number;
// // //   remainingQty?: number;
// // //   completedQty?: number;
// // //   storeItemId?: string;
// // //   inwardPartId?: string;
// // //   receivedQty?: number;
// // //   totalPrice?: number;
// // //   totalWeight?: number;
// // // }

// // // interface FormattedPart extends Part {
// // //   _key: string;
// // //   blankWidth: number;
// // //   blankLength: number;
// // //   blankSizeSqft: number;
// // //   weight: number;
// // //   sheetCost: number;
// // //   gauge: string;
// // //   material: string;
// // //   qty: number;
// // //   remainingQty: number;
// // //   completedQty: number;
// // //   paintCostPerPiece: number;
// // //   totalPrice: number;
// // //   totalWeight: number;
// // //   storeItemId: string;
// // //   inwardPartId: string;
// // //   receivedQty: number;
// // // }

// // // interface StoreItem {
// // //   _id: string;
// // //   partNumber: string;
// // //   partName: string;
// // //   stockInStore: number;
// // //   unitOfMeasure: string;
// // //   _type: string;
// // // }

// // // interface InwardPart {
// // //   _key?: string;
// // //   partNo: string;
// // //   partName: string;
// // //   qty: number;
// // //   receivedQty?: number;
// // //   remainingQty?: number;
// // //   blankWidth?: number;
// // //   blankLength?: number;
// // //   blankSizeSqft?: number;
// // //   gauge?: string;
// // //   material?: string;
// // //   storeItemId?: string;
// // // }

// // // interface InwardOrder {
// // //   _id: string;
// // //   workOrderNo: string;
// // //   parts: InwardPart[];
// // // }

// // // function calculatePartValues(part: Partial<Part>) {
// // //   const paintCostPerPiece = (part.blankSizeSqft || 0) * (part.sheetCost || 0)
// // //   const totalPrice = paintCostPerPiece * (part.qty || 0)
// // //   const totalWeight = (part.weight || 0) * (part.qty || 0)
  
// // //   return { 
// // //     paintCostPerPiece, 
// // //     totalPrice,
// // //     totalWeight
// // //   }
// // // }

// // // function calculateOrderTotal(parts: FormattedPart[]) {
// // //   return parts.reduce((sum, part) => sum + (part.totalPrice || 0), 0)
// // // }

// // // function calculateOrderTotalWeight(parts: FormattedPart[]) {
// // //   return parts.reduce((sum, part) => sum + (part.totalWeight || 0), 0)
// // // }

// // // // Helper function to update store stock - ONLY ADDITIONAL OUTWARD quantity
// // // async function updateStoreStockForOutward(parts: Part[], existingReceivedQtyMap?: Map<string, number>) {
// // //   const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
// // //   for (const part of parts) {
// // //     // Calculate ONLY the additional quantity (new outward - already received)
// // //     let additionalQty = part.completedQty || part.qty || 0
    
// // //     // If we have existing received quantity, subtract it to get only additional
// // //     if (existingReceivedQtyMap && existingReceivedQtyMap.has(part.partNo)) {
// // //       const alreadyReceived = existingReceivedQtyMap.get(part.partNo) || 0
// // //       additionalQty = (part.completedQty || part.qty || 0) - alreadyReceived
// // //     }
    
// // //     if (additionalQty <= 0) {
// // //       console.log(`⚠️ No additional quantity for ${part.partName}, skipping stock update (already received: ${existingReceivedQtyMap?.get(part.partNo) || 0})`)
// // //       continue
// // //     }

// // //     if (!part.storeItemId && !part.partNo) {
// // //       console.warn(`No storeItemId or partNo for part: ${part.partName}, skipping stock update`)
// // //       continue
// // //     }

// // //     try {
// // //       const storeItem = await client.fetch(
// // //         `*[_type in ["storeItem", "store"] && (storeItemId == $storeItemId || partNumber == $partNumber)][0] { 
// // //           _id, 
// // //           partNumber, 
// // //           partName, 
// // //           stockInStore,
// // //           unitOfMeasure,
// // //           _type
// // //         }`,
// // //         { 
// // //           storeItemId: part.storeItemId,
// // //           partNumber: part.partNo 
// // //         }
// // //       ) as StoreItem | null

// // //       if (!storeItem) {
// // //         console.error(`Store item not found for part: ${part.partName}, PartNo: ${part.partNo}`)
// // //         results.push({ success: false, partName: part.partName, error: 'Store item not found' })
// // //         continue
// // //       }

// // //       // OUTWARD: Add ONLY additional quantity to store
// // //       const newStock = (storeItem.stockInStore || 0) + additionalQty
// // //       console.log(`📦 OUTWARD (Additional): Adding ${additionalQty} to store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)

// // //       await writeClient
// // //         .patch(storeItem._id)
// // //         .set({ stockInStore: newStock })
// // //         .commit()

// // //       results.push({ success: true, partName: part.partName, newStock })
      
// // //     } catch (error) {
// // //       console.error(`Error updating stock for part ${part.partName}:`, error)
// // //       results.push({ success: false, partName: part.partName, error: String(error) })
// // //     }
// // //   }

// // //   return results
// // // }

// // // // Helper function to remove additional stock (for delete/update)
// // // async function removeStoreStockForOutward(parts: Part[], existingReceivedQtyMap?: Map<string, number>) {
// // //   const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
// // //   for (const part of parts) {
// // //     let additionalQty = part.completedQty || part.qty || 0
    
// // //     if (existingReceivedQtyMap && existingReceivedQtyMap.has(part.partNo)) {
// // //       const alreadyReceived = existingReceivedQtyMap.get(part.partNo) || 0
// // //       additionalQty = (part.completedQty || part.qty || 0) - alreadyReceived
// // //     }
    
// // //     if (additionalQty <= 0) {
// // //       continue
// // //     }

// // //     if (!part.storeItemId && !part.partNo) {
// // //       continue
// // //     }

// // //     try {
// // //       const storeItem = await client.fetch(
// // //         `*[_type in ["storeItem", "store"] && (storeItemId == $storeItemId || partNumber == $partNumber)][0] { 
// // //           _id, 
// // //           partNumber, 
// // //           partName, 
// // //           stockInStore,
// // //           unitOfMeasure,
// // //           _type
// // //         }`,
// // //         { 
// // //           storeItemId: part.storeItemId,
// // //           partNumber: part.partNo 
// // //         }
// // //       ) as StoreItem | null

// // //       if (!storeItem) {
// // //         console.error(`Store item not found for part: ${part.partName}`)
// // //         results.push({ success: false, partName: part.partName, error: 'Store item not found' })
// // //         continue
// // //       }

// // //       const newStock = Math.max(0, (storeItem.stockInStore || 0) - additionalQty)
// // //       console.log(`📦 Removing additional ${additionalQty} from store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)

// // //       await writeClient
// // //         .patch(storeItem._id)
// // //         .set({ stockInStore: newStock })
// // //         .commit()

// // //       results.push({ success: true, partName: part.partName, newStock })
      
// // //     } catch (error) {
// // //       console.error(`Error removing stock for part ${part.partName}:`, error)
// // //       results.push({ success: false, partName: part.partName, error: String(error) })
// // //     }
// // //   }

// // //   return results
// // // }

// // // // Helper function to get existing received quantities from inward order
// // // async function getExistingReceivedQuantities(inwardOrderId: string): Promise<Map<string, number>> {
// // //   const receivedMap = new Map<string, number>()
  
// // //   if (!inwardOrderId) return receivedMap
  
// // //   try {
// // //     const inwardOrder = await client.fetch(
// // //       `*[_type == "paint-in-opr" && _id == $id][0] {
// // //         parts[] {
// // //           partNo,
// // //           receivedQty
// // //         }
// // //       }`,
// // //       { id: inwardOrderId }
// // //     ) as { parts: { partNo: string; receivedQty: number }[] } | null
    
// // //     if (inwardOrder?.parts) {
// // //       for (const part of inwardOrder.parts) {
// // //         receivedMap.set(part.partNo, part.receivedQty || 0)
// // //       }
// // //     }
// // //   } catch (error) {
// // //     console.error('Error getting existing received quantities:', error)
// // //   }
  
// // //   return receivedMap
// // // }

// // // // Helper function to update inward order - adds to receivedQty
// // // async function updateInwardOrder(inwardOrderId: string, outwardParts: Part[]) {
// // //   try {
// // //     const inwardOrder = await client.fetch(
// // //       `*[_type == "paint-in-opr" && _id == $id][0] {
// // //         _id,
// // //         workOrderNo,
// // //         parts[] {
// // //           _key,
// // //           partNo,
// // //           partName,
// // //           qty,
// // //           receivedQty,
// // //           remainingQty,
// // //           blankWidth,
// // //           blankLength,
// // //           blankSizeSqft,
// // //           gauge,
// // //           material,
// // //           storeItemId
// // //         }
// // //       }`,
// // //       { id: inwardOrderId }
// // //     ) as InwardOrder | null

// // //     if (!inwardOrder) {
// // //       console.error('Inward order not found:', inwardOrderId)
// // //       return false
// // //     }

// // //     console.log('📦 Current inward order state BEFORE update:')
// // //     inwardOrder.parts.forEach((p: InwardPart) => {
// // //       console.log(`   ${p.partName}: Qty=${p.qty}, Received=${p.receivedQty || 0}, Remaining=${p.remainingQty}`)
// // //     })

// // //     const outwardPartsMap = new Map<string, number>()
// // //     for (const outPart of outwardParts) {
// // //       const outwardQty = outPart.completedQty || outPart.qty || 0
// // //       outwardPartsMap.set(outPart.partNo, outwardQty)
// // //     }

// // //     console.log('📤 Outward quantities to ADD to receivedQty:', Array.from(outwardPartsMap.entries()))

// // //     let hasError = false
// // //     let updated = false
    
// // //     const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
// // //       const outwardQty = outwardPartsMap.get(inPart.partNo)
      
// // //       if (outwardQty) {
// // //         const currentReceivedQty = inPart.receivedQty || 0
// // //         const newReceivedQty = currentReceivedQty + outwardQty
        
// // //         if (newReceivedQty > inPart.qty) {
// // //           console.error(`❌ CRITICAL: Would exceed inward quantity for ${inPart.partNo}!`)
// // //           hasError = true
// // //           return inPart
// // //         }
        
// // //         const newRemainingQty = inPart.qty - newReceivedQty
        
// // //         console.log(`✅ Updating ${inPart.partName}: Received ${currentReceivedQty} + ${outwardQty} = ${newReceivedQty} (Remaining: ${newRemainingQty})`)
        
// // //         updated = true
// // //         return {
// // //           ...inPart,
// // //           receivedQty: newReceivedQty,
// // //           remainingQty: newRemainingQty
// // //         }
// // //       }
// // //       return inPart
// // //     })

// // //     if (hasError) {
// // //       return false
// // //     }

// // //     if (!updated) {
// // //       console.log('ℹ️ No parts to update in inward order')
// // //       return true
// // //     }

// // //     await writeClient
// // //       .patch(inwardOrderId)
// // //       .set({ parts: updatedParts })
// // //       .commit()

// // //     console.log('✅ Inward order updated successfully!')
// // //     return true
// // //   } catch (error) {
// // //     console.error('Error updating inward order:', error)
// // //     return false
// // //   }
// // // }

// // // export async function GET(_req: NextRequest) {
// // //   try {
// // //     const paintOutwardOps = await client.fetch(`
// // //       *[_type == "paint-out-opr"] | order(_createdAt desc) {
// // //         _id,
// // //         _createdAt,
// // //         workOrderNo,
// // //         gatepassNo,
// // //         inwardChallanNo,
// // //         dateIssued,
// // //         remarks,
// // //         inwardOrderId,
// // //         total,
// // //         totalWeight,
// // //         parts[] {
// // //           partNo,
// // //           partName,
// // //           category,
// // //           storeLocation,
// // //           blankWidth,
// // //           blankLength,
// // //           blankSizeSqft,
// // //           weight,
// // //           sheetCost,
// // //           gauge,
// // //           material,
// // //           qty,
// // //           remainingQty,
// // //           completedQty,
// // //           paintCostPerPiece,
// // //           totalPrice,
// // //           totalWeight,
// // //           storeItemId,
// // //           inwardPartId,
// // //           receivedQty
// // //         }
// // //       }
// // //     `)

// // //     return NextResponse.json({ 
// // //       data: paintOutwardOps || [], 
// // //       success: true 
// // //     }, { status: 200 })

// // //   } catch (error) {
// // //     console.error('Error fetching paint outward operations:', error)
// // //     return NextResponse.json(
// // //       { error: 'Failed to fetch paint outward operations', success: false, data: [] },
// // //       { status: 500 }
// // //     )
// // //   }
// // // }

// // // export async function POST(req: NextRequest) {
// // //   try {
// // //     if (!canWrite()) {
// // //       return NextResponse.json(
// // //         { error: 'Write token not configured', success: false },
// // //         { status: 500 }
// // //       )
// // //     }

// // //     const body = await req.json()
// // //     const { 
// // //       workOrderNo, 
// // //       gatepassNo, 
// // //       inwardChallanNo, 
// // //       dateIssued, 
// // //       remarks, 
// // //       parts, 
// // //       inwardOrderId,
// // //       totalWeight 
// // //     } = body

// // //     console.log('=== 🚀 POST: Creating Paint Outward Operation ===')
// // //     console.log('Inward Order ID:', inwardOrderId)
// // //     console.log('Parts to outward:', parts.map((p: Part) => ({ 
// // //       partNo: p.partNo, 
// // //       partName: p.partName, 
// // //       qty: p.qty,
// // //       completedQty: p.completedQty,
// // //       remainingQty: p.remainingQty
// // //     })))

// // //     if (!workOrderNo || workOrderNo.trim() === '') {
// // //       return NextResponse.json(
// // //         { error: 'Work Order Number is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     if (!gatepassNo || gatepassNo.trim() === '') {
// // //       return NextResponse.json(
// // //         { error: 'Gate Pass Number is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     if (!dateIssued) {
// // //       return NextResponse.json(
// // //         { error: 'Date Issued is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     if (!parts || parts.length === 0) {
// // //       return NextResponse.json(
// // //         { error: 'At least one part is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     // Check for existing gatepass
// // //     const existingGatepass = await client.fetch(
// // //       `*[_type == "paint-out-opr" && gatepassNo == $gatepassNo][0] { _id }`,
// // //       { gatepassNo }
// // //     )

// // //     if (existingGatepass) {
// // //       return NextResponse.json(
// // //         { error: 'Gate pass number already exists', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     // Get existing received quantities to calculate additional only
// // //     const existingReceivedMap = await getExistingReceivedQuantities(inwardOrderId || '')

// // //     // Process parts
// // //     const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
// // //       const outwardQty = part.qty || 0
// // //       const partForCalc = { ...part, qty: outwardQty }
// // //       const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
// // //       const remainingQtyValue = part.remainingQty !== undefined ? part.remainingQty : 0
      
// // //       return {
// // //         _key: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
// // //         partNo: part.partNo,
// // //         partName: part.partName,
// // //         category: part.category || '',
// // //         storeLocation: part.storeLocation || '',
// // //         blankWidth: part.blankWidth || 0,
// // //         blankLength: part.blankLength || 0,
// // //         blankSizeSqft: part.blankSizeSqft || 0,
// // //         weight: part.weight || 0,
// // //         sheetCost: part.sheetCost || 0,
// // //         gauge: part.gauge || '',
// // //         material: part.material || '',
// // //         qty: outwardQty,
// // //         remainingQty: remainingQtyValue,
// // //         completedQty: outwardQty,
// // //         paintCostPerPiece: paintCostPerPiece,
// // //         totalPrice: totalPrice,
// // //         totalWeight: partTotalWeight,
// // //         storeItemId: part.storeItemId || '',
// // //         inwardPartId: part.inwardPartId || '',
// // //         receivedQty: part.receivedQty || 0
// // //       }
// // //     })

// // //     const total = calculateOrderTotal(formattedParts)
// // //     const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

// // //     // Create paint outward operation
// // //     const result = await writeClient.create({
// // //       _type: 'paint-out-opr',
// // //       workOrderNo: workOrderNo.trim(),
// // //       gatepassNo: gatepassNo.trim(),
// // //       inwardChallanNo: inwardChallanNo || '',
// // //       dateIssued: new Date(dateIssued).toISOString(),
// // //       remarks: remarks || '',
// // //       inwardOrderId: inwardOrderId || '',
// // //       parts: formattedParts,
// // //       total: total,
// // //       totalWeight: calculatedTotalWeight
// // //     })

// // //     console.log('✅ Paint outward operation created:', result._id)

// // //     // ONLY ADD ADDITIONAL QUANTITY TO STORE (not the already received)
// // //     const stockUpdateResults = await updateStoreStockForOutward(parts, existingReceivedMap)
// // //     const failedStockUpdates = stockUpdateResults.filter(r => !r.success)
// // //     if (failedStockUpdates.length > 0) {
// // //       console.error('Some stock updates failed:', failedStockUpdates)
// // //     } else {
// // //       console.log('✅ Store stock updated successfully (added additional quantity to inventory)')
// // //     }

// // //     // Update inward order's receivedQty and remainingQty
// // //     if (inwardOrderId) {
// // //       const updated = await updateInwardOrder(inwardOrderId, parts)
// // //       if (!updated) {
// // //         console.error('❌ Failed to update inward order quantities')
// // //       } else {
// // //         console.log('✅ Successfully updated inward order')
// // //       }
// // //     }

// // //     return NextResponse.json({
// // //       success: true,
// // //       message: 'Paint outward operation created successfully. Additional stock added to store.',
// // //       data: result
// // //     }, { status: 201 })

// // //   } catch (error) {
// // //     console.error('Error creating paint outward operation:', error)
// // //     return NextResponse.json(
// // //       { 
// // //         error: 'Failed to create paint outward operation', 
// // //         success: false,
// // //         details: error instanceof Error ? error.message : 'Unknown error'
// // //       },
// // //       { status: 500 }
// // //     )
// // //   }
// // // }

// // // export async function PUT(req: NextRequest) {
// // //   try {
// // //     if (!canWrite()) {
// // //       return NextResponse.json(
// // //         { error: 'Write token not configured', success: false },
// // //         { status: 500 }
// // //       )
// // //     }

// // //     const body = await req.json()
// // //     const { id, workOrderNo, gatepassNo, inwardChallanNo, dateIssued, remarks, parts, totalWeight } = body

// // //     if (!id) {
// // //       return NextResponse.json(
// // //         { error: 'Work order ID is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     if (!workOrderNo || workOrderNo.trim() === '') {
// // //       return NextResponse.json(
// // //         { error: 'Work Order Number is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     if (!gatepassNo || gatepassNo.trim() === '') {
// // //       return NextResponse.json(
// // //         { error: 'Gate Pass Number is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     if (!dateIssued) {
// // //       return NextResponse.json(
// // //         { error: 'Date Issued is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     if (!parts || parts.length === 0) {
// // //       return NextResponse.json(
// // //         { error: 'At least one part is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     // Fetch existing document to restore old stock
// // //     const existingDoc = await client.fetch(
// // //       `*[_type == "paint-out-opr" && _id == $id][0] { 
// // //         _id,
// // //         inwardOrderId,
// // //         parts[] {
// // //           storeItemId,
// // //           partNo,
// // //           partName,
// // //           completedQty,
// // //           qty
// // //         }
// // //       }`,
// // //       { id }
// // //     ) as { _id: string; inwardOrderId: string; parts: Part[] } | null

// // //     if (!existingDoc) {
// // //       return NextResponse.json(
// // //         { error: 'Paint outward operation not found', success: false },
// // //         { status: 404 }
// // //       )
// // //     }

// // //     // Get existing received quantities for calculating additional
// // //     const existingReceivedMap = await getExistingReceivedQuantities(existingDoc.inwardOrderId || '')

// // //     // Remove old additional stock first
// // //     if (existingDoc.parts && existingDoc.parts.length > 0) {
// // //       await removeStoreStockForOutward(existingDoc.parts, existingReceivedMap)
// // //       console.log('📦 Removed old additional stock from store')
// // //     }

// // //     // Process new parts
// // //     const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
// // //       const outwardQty = part.qty || 0
// // //       const partForCalc = { ...part, qty: outwardQty }
// // //       const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
// // //       const existingPart = existingDoc.parts?.find((p: Part) => p.storeItemId === part.storeItemId)
// // //       const remainingQtyValue = part.remainingQty !== undefined ? part.remainingQty : outwardQty
      
// // //       return {
// // //         _key: existingPart?._key || `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
// // //         partNo: part.partNo,
// // //         partName: part.partName,
// // //         category: part.category || '',
// // //         storeLocation: part.storeLocation || '',
// // //         blankWidth: part.blankWidth || 0,
// // //         blankLength: part.blankLength || 0,
// // //         blankSizeSqft: part.blankSizeSqft || 0,
// // //         weight: part.weight || 0,
// // //         sheetCost: part.sheetCost || 0,
// // //         gauge: part.gauge || '',
// // //         material: part.material || '',
// // //         qty: outwardQty,
// // //         remainingQty: remainingQtyValue,
// // //         completedQty: outwardQty,
// // //         paintCostPerPiece: paintCostPerPiece,
// // //         totalPrice: totalPrice,
// // //         totalWeight: partTotalWeight,
// // //         storeItemId: part.storeItemId || '',
// // //         receivedQty: part.receivedQty || 0
// // //       }
// // //     })

// // //     const total = calculateOrderTotal(formattedParts)
// // //     const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

// // //     // Add new additional stock for updated parts
// // //     await updateStoreStockForOutward(parts, existingReceivedMap)
// // //     console.log('📦 Added new additional stock to store')

// // //     // Update the outward operation
// // //     const result = await writeClient
// // //       .patch(id)
// // //       .set({
// // //         workOrderNo: workOrderNo.trim(),
// // //         gatepassNo: gatepassNo.trim(),
// // //         inwardChallanNo: inwardChallanNo || '',
// // //         dateIssued: new Date(dateIssued).toISOString(),
// // //         remarks: remarks || '',
// // //         parts: formattedParts,
// // //         total: total,
// // //         totalWeight: calculatedTotalWeight
// // //       })
// // //       .commit()

// // //     return NextResponse.json({
// // //       success: true,
// // //       message: 'Paint outward operation updated successfully',
// // //       data: result
// // //     }, { status: 200 })

// // //   } catch (error) {
// // //     console.error('Error updating paint outward operation:', error)
// // //     return NextResponse.json(
// // //       { error: 'Failed to update paint outward operation', success: false },
// // //       { status: 500 }
// // //     )
// // //   }
// // // }

// // // export async function DELETE(req: NextRequest) {
// // //   try {
// // //     if (!canWrite()) {
// // //       return NextResponse.json(
// // //         { error: 'Write token not configured', success: false },
// // //         { status: 500 }
// // //       )
// // //     }

// // //     const { searchParams } = new URL(req.url)
// // //     const id = searchParams.get('id')

// // //     if (!id) {
// // //       return NextResponse.json(
// // //         { error: 'Work order ID is required', success: false },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     // Get the work order to restore stock
// // //     const workOrder = await client.fetch(
// // //       `*[_type == "paint-out-opr" && _id == $id][0] { 
// // //         _id,
// // //         inwardOrderId,
// // //         parts[] {
// // //           storeItemId,
// // //           partNo,
// // //           partName,
// // //           completedQty,
// // //           qty
// // //         }
// // //       }`,
// // //       { id }
// // //     ) as { _id: string; inwardOrderId: string; parts: Part[] } | null

// // //     if (!workOrder) {
// // //       return NextResponse.json(
// // //         { error: 'Paint outward operation not found', success: false },
// // //         { status: 404 }
// // //       )
// // //     }

// // //     // Get existing received quantities
// // //     const existingReceivedMap = await getExistingReceivedQuantities(workOrder.inwardOrderId || '')

// // //     // Remove additional stock for all parts (reverse the addition)
// // //     if (workOrder.parts && workOrder.parts.length > 0) {
// // //       await removeStoreStockForOutward(workOrder.parts, existingReceivedMap)
// // //       console.log('📦 Removed additional stock from store (deleted outward)')
// // //     }

// // //     // Reverse the inward order quantities
// // //     if (workOrder.inwardOrderId && workOrder.parts && workOrder.parts.length > 0) {
// // //       const inwardOrder = await client.fetch(
// // //         `*[_type == "paint-in-opr" && _id == $id][0] {
// // //           _id,
// // //           parts[] {
// // //             _key,
// // //             partNo,
// // //             partName,
// // //             qty,
// // //             receivedQty,
// // //             remainingQty
// // //           }
// // //         }`,
// // //         { id: workOrder.inwardOrderId }
// // //       ) as InwardOrder | null
      
// // //       if (inwardOrder) {
// // //         const outwardPartsMap = new Map<string, number>()
// // //         for (const outPart of workOrder.parts) {
// // //           outwardPartsMap.set(outPart.partNo, outPart.completedQty || outPart.qty || 0)
// // //         }
        
// // //         const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
// // //           const outwardQty = outwardPartsMap.get(inPart.partNo)
// // //           if (outwardQty) {
// // //             const currentReceived = inPart.receivedQty || 0
// // //             const newReceived = Math.max(0, currentReceived - outwardQty)
// // //             const newRemaining = inPart.qty - newReceived
            
// // //             return {
// // //               ...inPart,
// // //               receivedQty: newReceived,
// // //               remainingQty: newRemaining
// // //             }
// // //           }
// // //           return inPart
// // //         })
        
// // //         await writeClient
// // //           .patch(workOrder.inwardOrderId)
// // //           .set({ parts: updatedParts })
// // //           .commit()
        
// // //         console.log('✅ Reversed inward order quantities')
// // //       }
// // //     }

// // //     await writeClient.delete(id)

// // //     return NextResponse.json({
// // //       success: true,
// // //       message: 'Paint outward operation deleted successfully. Additional stock removed from store.'
// // //     }, { status: 200 })

// // //   } catch (error) {
// // //     console.error('Error deleting paint outward operation:', error)
// // //     return NextResponse.json(
// // //       { error: 'Failed to delete paint outward operation', success: false },
// // //       { status: 500 }
// // //     )
// // //   }
// // // }

// // // export const dynamic = 'force-dynamic'


// // import { NextRequest, NextResponse } from 'next/server'
// // import { client, writeClient, canWrite } from '@/sanity/lib/client'

// // // Define interfaces
// // interface Part {
// //   partNo: string;
// //   partName: string;
// //   category: string;
// //   storeLocation: string;
// //   _key?: string; 
// //   blankWidth?: number;
// //   blankLength?: number;
// //   blankSizeSqft?: number;
// //   weight?: number;
// //   sheetCost?: number;
// //   gauge?: string;
// //   material?: string;
// //   qty: number;
// //   remainingQty?: number;
// //   completedQty?: number;
// //   storeItemId?: string;
// //   inwardPartId?: string;
// //   receivedQty?: number;
// //   totalPrice?: number;
// //   totalWeight?: number;
// // }

// // interface FormattedPart extends Part {
// //   _key: string;
// //   blankWidth: number;
// //   blankLength: number;
// //   blankSizeSqft: number;
// //   weight: number;
// //   sheetCost: number;
// //   gauge: string;
// //   material: string;
// //   qty: number;
// //   remainingQty: number;
// //   completedQty: number;
// //   paintCostPerPiece: number;
// //   totalPrice: number;
// //   totalWeight: number;
// //   storeItemId: string;
// //   inwardPartId: string;
// //   receivedQty: number;
// // }

// // interface StoreItem {
// //   _id: string;
// //   partNumber: string;
// //   partName: string;
// //   stockInStore: number;
// //   unitOfMeasure: string;
// //   _type: string;
// // }

// // interface InwardPart {
// //   _key?: string;
// //   partNo: string;
// //   partName: string;
// //   qty: number;
// //   receivedQty?: number;
// //   remainingQty?: number;
// //   blankWidth?: number;
// //   blankLength?: number;
// //   blankSizeSqft?: number;
// //   gauge?: string;
// //   material?: string;
// //   storeItemId?: string;
// // }

// // interface InwardOrder {
// //   _id: string;
// //   workOrderNo: string;
// //   parts: InwardPart[];
// // }

// // function calculatePartValues(part: Partial<Part>) {
// //   const paintCostPerPiece = (part.blankSizeSqft || 0) * (part.sheetCost || 0)
// //   const totalPrice = paintCostPerPiece * (part.qty || 0)
// //   const totalWeight = (part.weight || 0) * (part.qty || 0)
  
// //   return { 
// //     paintCostPerPiece, 
// //     totalPrice,
// //     totalWeight
// //   }
// // }

// // function calculateOrderTotal(parts: FormattedPart[]) {
// //   return parts.reduce((sum, part) => sum + (part.totalPrice || 0), 0)
// // }

// // function calculateOrderTotalWeight(parts: FormattedPart[]) {
// //   return parts.reduce((sum, part) => sum + (part.totalWeight || 0), 0)
// // }

// // // Helper function to update store stock - ONLY ADDITIONAL OUTWARD quantity
// // async function updateStoreStockForOutward(parts: Part[], existingReceivedQtyMap?: Map<string, number>) {
// //   const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
// //   for (const part of parts) {
// //     // Calculate ONLY the additional quantity (new outward - already received)
// //     let additionalQty = part.completedQty || part.qty || 0
    
// //     // If we have existing received quantity, subtract it to get only additional
// //     if (existingReceivedQtyMap && existingReceivedQtyMap.has(part.partNo)) {
// //       const alreadyReceived = existingReceivedQtyMap.get(part.partNo) || 0
// //       additionalQty = (part.completedQty || part.qty || 0) - alreadyReceived
// //     }
    
// //     if (additionalQty <= 0) {
// //       console.log(`⚠️ No additional quantity for ${part.partName}, skipping stock update (already received: ${existingReceivedQtyMap?.get(part.partNo) || 0})`)
// //       continue
// //     }

// //     if (!part.storeItemId && !part.partNo) {
// //       console.warn(`No storeItemId or partNo for part: ${part.partName}, skipping stock update`)
// //       continue
// //     }

// //     try {
// //       const storeItem = await client.fetch(
// //         `*[_type in ["storeItem", "store"] && (storeItemId == $storeItemId || partNumber == $partNumber)][0] { 
// //           _id, 
// //           partNumber, 
// //           partName, 
// //           stockInStore,
// //           unitOfMeasure,
// //           _type
// //         }`,
// //         { 
// //           storeItemId: part.storeItemId,
// //           partNumber: part.partNo 
// //         }
// //       ) as StoreItem | null

// //       if (!storeItem) {
// //         console.error(`Store item not found for part: ${part.partName}, PartNo: ${part.partNo}`)
// //         results.push({ success: false, partName: part.partName, error: 'Store item not found' })
// //         continue
// //       }

// //       // OUTWARD: Add ONLY additional quantity to store
// //       const newStock = (storeItem.stockInStore || 0) + additionalQty
// //       console.log(`📦 OUTWARD (Additional): Adding ${additionalQty} to store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)

// //       await writeClient
// //         .patch(storeItem._id)
// //         .set({ stockInStore: newStock })
// //         .commit()

// //       results.push({ success: true, partName: part.partName, newStock })
      
// //     } catch (error) {
// //       console.error(`Error updating stock for part ${part.partName}:`, error)
// //       results.push({ success: false, partName: part.partName, error: String(error) })
// //     }
// //   }

// //   return results
// // }

// // // Helper function to remove additional stock (for delete/update)
// // async function removeStoreStockForOutward(parts: Part[], existingReceivedQtyMap?: Map<string, number>) {
// //   const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
// //   for (const part of parts) {
// //     let additionalQty = part.completedQty || part.qty || 0
    
// //     if (existingReceivedQtyMap && existingReceivedQtyMap.has(part.partNo)) {
// //       const alreadyReceived = existingReceivedQtyMap.get(part.partNo) || 0
// //       additionalQty = (part.completedQty || part.qty || 0) - alreadyReceived
// //     }
    
// //     if (additionalQty <= 0) {
// //       continue
// //     }

// //     if (!part.storeItemId && !part.partNo) {
// //       continue
// //     }

// //     try {
// //       const storeItem = await client.fetch(
// //         `*[_type in ["storeItem", "store"] && (storeItemId == $storeItemId || partNumber == $partNumber)][0] { 
// //           _id, 
// //           partNumber, 
// //           partName, 
// //           stockInStore,
// //           unitOfMeasure,
// //           _type
// //         }`,
// //         { 
// //           storeItemId: part.storeItemId,
// //           partNumber: part.partNo 
// //         }
// //       ) as StoreItem | null

// //       if (!storeItem) {
// //         console.error(`Store item not found for part: ${part.partName}`)
// //         results.push({ success: false, partName: part.partName, error: 'Store item not found' })
// //         continue
// //       }

// //       const newStock = Math.max(0, (storeItem.stockInStore || 0) - additionalQty)
// //       console.log(`📦 Removing additional ${additionalQty} from store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)

// //       await writeClient
// //         .patch(storeItem._id)
// //         .set({ stockInStore: newStock })
// //         .commit()

// //       results.push({ success: true, partName: part.partName, newStock })
      
// //     } catch (error) {
// //       console.error(`Error removing stock for part ${part.partName}:`, error)
// //       results.push({ success: false, partName: part.partName, error: String(error) })
// //     }
// //   }

// //   return results
// // }

// // // Helper function to get existing received quantities from inward order
// // async function getExistingReceivedQuantities(inwardOrderId: string): Promise<Map<string, number>> {
// //   const receivedMap = new Map<string, number>()
  
// //   if (!inwardOrderId) return receivedMap
  
// //   try {
// //     const inwardOrder = await client.fetch(
// //       `*[_type == "paint-in-opr" && _id == $id][0] {
// //         parts[] {
// //           partNo,
// //           receivedQty
// //         }
// //       }`,
// //       { id: inwardOrderId }
// //     ) as { parts: { partNo: string; receivedQty: number }[] } | null
    
// //     if (inwardOrder?.parts) {
// //       for (const part of inwardOrder.parts) {
// //         receivedMap.set(part.partNo, part.receivedQty || 0)
// //       }
// //     }
// //   } catch (error) {
// //     console.error('Error getting existing received quantities:', error)
// //   }
  
// //   return receivedMap
// // }

// // // Helper function to update inward order - adds to receivedQty
// // async function updateInwardOrder(inwardOrderId: string, outwardParts: Part[]) {
// //   try {
// //     const inwardOrder = await client.fetch(
// //       `*[_type == "paint-in-opr" && _id == $id][0] {
// //         _id,
// //         workOrderNo,
// //         parts[] {
// //           _key,
// //           partNo,
// //           partName,
// //           qty,
// //           receivedQty,
// //           remainingQty,
// //           blankWidth,
// //           blankLength,
// //           blankSizeSqft,
// //           gauge,
// //           material,
// //           storeItemId
// //         }
// //       }`,
// //       { id: inwardOrderId }
// //     ) as InwardOrder | null

// //     if (!inwardOrder) {
// //       console.error('Inward order not found:', inwardOrderId)
// //       return false
// //     }

// //     console.log('📦 Current inward order state BEFORE update:')
// //     inwardOrder.parts.forEach((p: InwardPart) => {
// //       console.log(`   ${p.partName}: Qty=${p.qty}, Received=${p.receivedQty || 0}, Remaining=${p.remainingQty}`)
// //     })

// //     const outwardPartsMap = new Map<string, number>()
// //     for (const outPart of outwardParts) {
// //       const outwardQty = outPart.completedQty || outPart.qty || 0
// //       outwardPartsMap.set(outPart.partNo, outwardQty)
// //     }

// //     console.log('📤 Outward quantities to ADD to receivedQty:', Array.from(outwardPartsMap.entries()))

// //     let hasError = false
// //     let updated = false
    
// //     const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
// //       const outwardQty = outwardPartsMap.get(inPart.partNo)
      
// //       if (outwardQty) {
// //         const currentReceivedQty = inPart.receivedQty || 0
// //         const newReceivedQty = currentReceivedQty + outwardQty
        
// //         if (newReceivedQty > inPart.qty) {
// //           console.error(`❌ CRITICAL: Would exceed inward quantity for ${inPart.partNo}!`)
// //           hasError = true
// //           return inPart
// //         }
        
// //         const newRemainingQty = inPart.qty - newReceivedQty
        
// //         console.log(`✅ Updating ${inPart.partName}: Received ${currentReceivedQty} + ${outwardQty} = ${newReceivedQty} (Remaining: ${newRemainingQty})`)
        
// //         updated = true
// //         return {
// //           ...inPart,
// //           receivedQty: newReceivedQty,
// //           remainingQty: newRemainingQty
// //         }
// //       }
// //       return inPart
// //     })

// //     if (hasError) {
// //       return false
// //     }

// //     if (!updated) {
// //       console.log('ℹ️ No parts to update in inward order')
// //       return true
// //     }

// //     await writeClient
// //       .patch(inwardOrderId)
// //       .set({ parts: updatedParts })
// //       .commit()

// //     console.log('✅ Inward order updated successfully!')
// //     return true
// //   } catch (error) {
// //     console.error('Error updating inward order:', error)
// //     return false
// //   }
// // }

// // export async function GET(_req: NextRequest) {
// //   try {
// //     const paintOutwardOps = await client.fetch(`
// //       *[_type == "paint-out-opr"] | order(_createdAt desc) {
// //         _id,
// //         _createdAt,
// //         workOrderNo,
// //         gatepassNo,
// //         inwardChallanNo,
// //         documentRefNo,
// //         dateIssued,
// //         remarks,
// //         inwardOrderId,
// //         total,
// //         totalWeight,
// //         parts[] {
// //           partNo,
// //           partName,
// //           category,
// //           storeLocation,
// //           blankWidth,
// //           blankLength,
// //           blankSizeSqft,
// //           weight,
// //           sheetCost,
// //           gauge,
// //           material,
// //           qty,
// //           remainingQty,
// //           completedQty,
// //           paintCostPerPiece,
// //           totalPrice,
// //           totalWeight,
// //           storeItemId,
// //           inwardPartId,
// //           receivedQty
// //         }
// //       }
// //     `)

// //     return NextResponse.json({ 
// //       data: paintOutwardOps || [], 
// //       success: true 
// //     }, { status: 200 })

// //   } catch (error) {
// //     console.error('Error fetching paint outward operations:', error)
// //     return NextResponse.json(
// //       { error: 'Failed to fetch paint outward operations', success: false, data: [] },
// //       { status: 500 }
// //     )
// //   }
// // }

// // export async function POST(req: NextRequest) {
// //   try {
// //     if (!canWrite()) {
// //       return NextResponse.json(
// //         { error: 'Write token not configured', success: false },
// //         { status: 500 }
// //       )
// //     }

// //     const body = await req.json()
// //     const { 
// //       workOrderNo, 
// //       gatepassNo, 
// //       inwardChallanNo, 
// //       documentRefNo,
// //       dateIssued, 
// //       remarks, 
// //       parts, 
// //       inwardOrderId,
// //       totalWeight 
// //     } = body

// //     console.log('=== 🚀 POST: Creating Paint Outward Operation ===')
// //     console.log('Inward Order ID:', inwardOrderId)
// //     console.log('Document Ref No:', documentRefNo)
// //     console.log('Parts to outward:', parts.map((p: Part) => ({ 
// //       partNo: p.partNo, 
// //       partName: p.partName, 
// //       qty: p.qty,
// //       completedQty: p.completedQty,
// //       remainingQty: p.remainingQty
// //     })))

// //     if (!workOrderNo || workOrderNo.trim() === '') {
// //       return NextResponse.json(
// //         { error: 'Work Order Number is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!gatepassNo || gatepassNo.trim() === '') {
// //       return NextResponse.json(
// //         { error: 'Gate Pass Number is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!documentRefNo || documentRefNo.trim() === '') {
// //       return NextResponse.json(
// //         { error: 'Document Ref No is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!dateIssued) {
// //       return NextResponse.json(
// //         { error: 'Date Issued is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!parts || parts.length === 0) {
// //       return NextResponse.json(
// //         { error: 'At least one part is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     // Check for existing gatepass
// //     const existingGatepass = await client.fetch(
// //       `*[_type == "paint-out-opr" && gatepassNo == $gatepassNo][0] { _id }`,
// //       { gatepassNo }
// //     )

// //     if (existingGatepass) {
// //       return NextResponse.json(
// //         { error: 'Gate pass number already exists', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     // Get existing received quantities to calculate additional only
// //     const existingReceivedMap = await getExistingReceivedQuantities(inwardOrderId || '')

// //     // Process parts
// //     const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
// //       const outwardQty = part.qty || 0
// //       const partForCalc = { ...part, qty: outwardQty }
// //       const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
// //       const remainingQtyValue = part.remainingQty !== undefined ? part.remainingQty : 0
      
// //       return {
// //         _key: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
// //         partNo: part.partNo,
// //         partName: part.partName,
// //         category: part.category || '',
// //         storeLocation: part.storeLocation || '',
// //         blankWidth: part.blankWidth || 0,
// //         blankLength: part.blankLength || 0,
// //         blankSizeSqft: part.blankSizeSqft || 0,
// //         weight: part.weight || 0,
// //         sheetCost: part.sheetCost || 0,
// //         gauge: part.gauge || '',
// //         material: part.material || '',
// //         qty: outwardQty,
// //         remainingQty: remainingQtyValue,
// //         completedQty: outwardQty,
// //         paintCostPerPiece: paintCostPerPiece,
// //         totalPrice: totalPrice,
// //         totalWeight: partTotalWeight,
// //         storeItemId: part.storeItemId || '',
// //         inwardPartId: part.inwardPartId || '',
// //         receivedQty: part.receivedQty || 0
// //       }
// //     })

// //     const total = calculateOrderTotal(formattedParts)
// //     const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

// //     // Create paint outward operation
// //     const result = await writeClient.create({
// //       _type: 'paint-out-opr',
// //       workOrderNo: workOrderNo.trim(),
// //       gatepassNo: gatepassNo.trim(),
// //       inwardChallanNo: inwardChallanNo || '',
// //       documentRefNo: documentRefNo.trim(),
// //       dateIssued: new Date(dateIssued).toISOString(),
// //       remarks: remarks || '',
// //       inwardOrderId: inwardOrderId || '',
// //       parts: formattedParts,
// //       total: total,
// //       totalWeight: calculatedTotalWeight
// //     })

// //     console.log('✅ Paint outward operation created:', result._id)

// //     // ONLY ADD ADDITIONAL QUANTITY TO STORE (not the already received)
// //     const stockUpdateResults = await updateStoreStockForOutward(parts, existingReceivedMap)
// //     const failedStockUpdates = stockUpdateResults.filter(r => !r.success)
// //     if (failedStockUpdates.length > 0) {
// //       console.error('Some stock updates failed:', failedStockUpdates)
// //     } else {
// //       console.log('✅ Store stock updated successfully (added additional quantity to inventory)')
// //     }

// //     // Update inward order's receivedQty and remainingQty
// //     if (inwardOrderId) {
// //       const updated = await updateInwardOrder(inwardOrderId, parts)
// //       if (!updated) {
// //         console.error('❌ Failed to update inward order quantities')
// //       } else {
// //         console.log('✅ Successfully updated inward order')
// //       }
// //     }

// //     return NextResponse.json({
// //       success: true,
// //       message: 'Paint outward operation created successfully. Additional stock added to store.',
// //       data: result
// //     }, { status: 201 })

// //   } catch (error) {
// //     console.error('Error creating paint outward operation:', error)
// //     return NextResponse.json(
// //       { 
// //         error: 'Failed to create paint outward operation', 
// //         success: false,
// //         details: error instanceof Error ? error.message : 'Unknown error'
// //       },
// //       { status: 500 }
// //     )
// //   }
// // }

// // export async function PUT(req: NextRequest) {
// //   try {
// //     if (!canWrite()) {
// //       return NextResponse.json(
// //         { error: 'Write token not configured', success: false },
// //         { status: 500 }
// //       )
// //     }

// //     const body = await req.json()
// //     const { id, workOrderNo, gatepassNo, inwardChallanNo, documentRefNo, dateIssued, remarks, parts, totalWeight } = body

// //     if (!id) {
// //       return NextResponse.json(
// //         { error: 'Work order ID is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!workOrderNo || workOrderNo.trim() === '') {
// //       return NextResponse.json(
// //         { error: 'Work Order Number is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!gatepassNo || gatepassNo.trim() === '') {
// //       return NextResponse.json(
// //         { error: 'Gate Pass Number is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!documentRefNo || documentRefNo.trim() === '') {
// //       return NextResponse.json(
// //         { error: 'Document Ref No is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!dateIssued) {
// //       return NextResponse.json(
// //         { error: 'Date Issued is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     if (!parts || parts.length === 0) {
// //       return NextResponse.json(
// //         { error: 'At least one part is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     // Fetch existing document to restore old stock
// //     const existingDoc = await client.fetch(
// //       `*[_type == "paint-out-opr" && _id == $id][0] { 
// //         _id,
// //         inwardOrderId,
// //         parts[] {
// //           storeItemId,
// //           partNo,
// //           partName,
// //           completedQty,
// //           qty
// //         }
// //       }`,
// //       { id }
// //     ) as { _id: string; inwardOrderId: string; parts: Part[] } | null

// //     if (!existingDoc) {
// //       return NextResponse.json(
// //         { error: 'Paint outward operation not found', success: false },
// //         { status: 404 }
// //       )
// //     }

// //     // Get existing received quantities for calculating additional
// //     const existingReceivedMap = await getExistingReceivedQuantities(existingDoc.inwardOrderId || '')

// //     // Remove old additional stock first
// //     if (existingDoc.parts && existingDoc.parts.length > 0) {
// //       await removeStoreStockForOutward(existingDoc.parts, existingReceivedMap)
// //       console.log('📦 Removed old additional stock from store')
// //     }

// //     // Process new parts
// //     const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
// //       const outwardQty = part.qty || 0
// //       const partForCalc = { ...part, qty: outwardQty }
// //       const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
// //       const existingPart = existingDoc.parts?.find((p: Part) => p.storeItemId === part.storeItemId)
// //       const remainingQtyValue = part.remainingQty !== undefined ? part.remainingQty : outwardQty
      
// //       return {
// //         _key: existingPart?._key || `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
// //         partNo: part.partNo,
// //         partName: part.partName,
// //         category: part.category || '',
// //         storeLocation: part.storeLocation || '',
// //         blankWidth: part.blankWidth || 0,
// //         blankLength: part.blankLength || 0,
// //         blankSizeSqft: part.blankSizeSqft || 0,
// //         weight: part.weight || 0,
// //         sheetCost: part.sheetCost || 0,
// //         gauge: part.gauge || '',
// //         material: part.material || '',
// //         qty: outwardQty,
// //         remainingQty: remainingQtyValue,
// //         completedQty: outwardQty,
// //         paintCostPerPiece: paintCostPerPiece,
// //         totalPrice: totalPrice,
// //         totalWeight: partTotalWeight,
// //         storeItemId: part.storeItemId || '',
// //         receivedQty: part.receivedQty || 0
// //       }
// //     })

// //     const total = calculateOrderTotal(formattedParts)
// //     const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

// //     // Add new additional stock for updated parts
// //     await updateStoreStockForOutward(parts, existingReceivedMap)
// //     console.log('📦 Added new additional stock to store')

// //     // Update the outward operation
// //     const result = await writeClient
// //       .patch(id)
// //       .set({
// //         workOrderNo: workOrderNo.trim(),
// //         gatepassNo: gatepassNo.trim(),
// //         inwardChallanNo: inwardChallanNo || '',
// //         documentRefNo: documentRefNo.trim(),
// //         dateIssued: new Date(dateIssued).toISOString(),
// //         remarks: remarks || '',
// //         parts: formattedParts,
// //         total: total,
// //         totalWeight: calculatedTotalWeight
// //       })
// //       .commit()

// //     return NextResponse.json({
// //       success: true,
// //       message: 'Paint outward operation updated successfully',
// //       data: result
// //     }, { status: 200 })

// //   } catch (error) {
// //     console.error('Error updating paint outward operation:', error)
// //     return NextResponse.json(
// //       { error: 'Failed to update paint outward operation', success: false },
// //       { status: 500 }
// //     )
// //   }
// // }

// // export async function DELETE(req: NextRequest) {
// //   try {
// //     if (!canWrite()) {
// //       return NextResponse.json(
// //         { error: 'Write token not configured', success: false },
// //         { status: 500 }
// //       )
// //     }

// //     const { searchParams } = new URL(req.url)
// //     const id = searchParams.get('id')

// //     if (!id) {
// //       return NextResponse.json(
// //         { error: 'Work order ID is required', success: false },
// //         { status: 400 }
// //       )
// //     }

// //     // Get the work order to restore stock
// //     const workOrder = await client.fetch(
// //       `*[_type == "paint-out-opr" && _id == $id][0] { 
// //         _id,
// //         inwardOrderId,
// //         parts[] {
// //           storeItemId,
// //           partNo,
// //           partName,
// //           completedQty,
// //           qty
// //         }
// //       }`,
// //       { id }
// //     ) as { _id: string; inwardOrderId: string; parts: Part[] } | null

// //     if (!workOrder) {
// //       return NextResponse.json(
// //         { error: 'Paint outward operation not found', success: false },
// //         { status: 404 }
// //       )
// //     }

// //     // Get existing received quantities
// //     const existingReceivedMap = await getExistingReceivedQuantities(workOrder.inwardOrderId || '')

// //     // Remove additional stock for all parts (reverse the addition)
// //     if (workOrder.parts && workOrder.parts.length > 0) {
// //       await removeStoreStockForOutward(workOrder.parts, existingReceivedMap)
// //       console.log('📦 Removed additional stock from store (deleted outward)')
// //     }

// //     // Reverse the inward order quantities
// //     if (workOrder.inwardOrderId && workOrder.parts && workOrder.parts.length > 0) {
// //       const inwardOrder = await client.fetch(
// //         `*[_type == "paint-in-opr" && _id == $id][0] {
// //           _id,
// //           parts[] {
// //             _key,
// //             partNo,
// //             partName,
// //             qty,
// //             receivedQty,
// //             remainingQty
// //           }
// //         }`,
// //         { id: workOrder.inwardOrderId }
// //       ) as InwardOrder | null
      
// //       if (inwardOrder) {
// //         const outwardPartsMap = new Map<string, number>()
// //         for (const outPart of workOrder.parts) {
// //           outwardPartsMap.set(outPart.partNo, outPart.completedQty || outPart.qty || 0)
// //         }
        
// //         const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
// //           const outwardQty = outwardPartsMap.get(inPart.partNo)
// //           if (outwardQty) {
// //             const currentReceived = inPart.receivedQty || 0
// //             const newReceived = Math.max(0, currentReceived - outwardQty)
// //             const newRemaining = inPart.qty - newReceived
            
// //             return {
// //               ...inPart,
// //               receivedQty: newReceived,
// //               remainingQty: newRemaining
// //             }
// //           }
// //           return inPart
// //         })
        
// //         await writeClient
// //           .patch(workOrder.inwardOrderId)
// //           .set({ parts: updatedParts })
// //           .commit()
        
// //         console.log('✅ Reversed inward order quantities')
// //       }
// //     }

// //     await writeClient.delete(id)

// //     return NextResponse.json({
// //       success: true,
// //       message: 'Paint outward operation deleted successfully. Additional stock removed from store.'
// //     }, { status: 200 })

// //   } catch (error) {
// //     console.error('Error deleting paint outward operation:', error)
// //     return NextResponse.json(
// //       { error: 'Failed to delete paint outward operation', success: false },
// //       { status: 500 }
// //     )
// //   }
// // }

// // export const dynamic = 'force-dynamic'


// // app/api/paint-out-opr/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { client, writeClient, canWrite } from '@/sanity/lib/client'

// // Define interfaces
// interface Part {
//   partNo: string;
//   partName: string;
//   category: string;
//   storeLocation: string;
//   _key?: string; 
//   blankWidth?: number;
//   blankLength?: number;
//   blankSizeSqft?: number;
//   weight?: number;
//   sheetCost?: number;
//   gauge?: string;
//   material?: string;
//   qty: number;
//   remainingQty?: number;
//   completedQty?: number;
//   storeItemId?: string;
//   inwardPartId?: string;
//   receivedQty?: number;
//   totalPrice?: number;
//   totalWeight?: number;
// }

// interface FormattedPart extends Part {
//   _key: string;
//   blankWidth: number;
//   blankLength: number;
//   blankSizeSqft: number;
//   weight: number;
//   sheetCost: number;
//   gauge: string;
//   material: string;
//   qty: number;
//   remainingQty: number;
//   completedQty: number;
//   paintCostPerPiece: number;
//   totalPrice: number;
//   totalWeight: number;
//   storeItemId: string;
//   inwardPartId: string;
//   receivedQty: number;
// }

// interface StoreItem {
//   _id: string;
//   partNumber: string;
//   partName: string;
//   stockInStore: number;
//   unitOfMeasure: string;
//   _type: string;
// }

// interface InwardPart {
//   _key?: string;
//   partNo: string;
//   partName: string;
//   qty: number;
//   receivedQty?: number;
//   remainingQty?: number;
//   blankWidth?: number;
//   blankLength?: number;
//   blankSizeSqft?: number;
//   gauge?: string;
//   material?: string;
//   storeItemId?: string;
// }

// interface InwardOrder {
//   _id: string;
//   workOrderNo: string;
//   mwo?: string;
//   parts: InwardPart[];
// }

// function calculatePartValues(part: Partial<Part>) {
//   const paintCostPerPiece = (part.blankSizeSqft || 0) * (part.sheetCost || 0)
//   const totalPrice = paintCostPerPiece * (part.qty || 0)
//   const totalWeight = (part.weight || 0) * (part.qty || 0)
  
//   return { 
//     paintCostPerPiece, 
//     totalPrice,
//     totalWeight
//   }
// }

// function calculateOrderTotal(parts: FormattedPart[]) {
//   return parts.reduce((sum, part) => sum + (part.totalPrice || 0), 0)
// }

// function calculateOrderTotalWeight(parts: FormattedPart[]) {
//   return parts.reduce((sum, part) => sum + (part.totalWeight || 0), 0)
// }

// // Helper function to update store stock - ONLY ADDITIONAL OUTWARD quantity
// async function updateStoreStockForOutward(parts: Part[], existingReceivedQtyMap?: Map<string, number>) {
//   const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
//   for (const part of parts) {
//     // Calculate ONLY the additional quantity (new outward - already received)
//     let additionalQty = part.completedQty || part.qty || 0
    
//     // If we have existing received quantity, subtract it to get only additional
//     if (existingReceivedQtyMap && existingReceivedQtyMap.has(part.partNo)) {
//       const alreadyReceived = existingReceivedQtyMap.get(part.partNo) || 0
//       additionalQty = (part.completedQty || part.qty || 0) - alreadyReceived
//     }
    
//     if (additionalQty <= 0) {
//       console.log(`⚠️ No additional quantity for ${part.partName}, skipping stock update (already received: ${existingReceivedQtyMap?.get(part.partNo) || 0})`)
//       continue
//     }

//     if (!part.storeItemId && !part.partNo) {
//       console.warn(`No storeItemId or partNo for part: ${part.partName}, skipping stock update`)
//       continue
//     }

//     try {
//       const storeItem = await client.fetch(
//         `*[_type in ["storeItem", "store"] && (storeItemId == $storeItemId || partNumber == $partNumber)][0] { 
//           _id, 
//           partNumber, 
//           partName, 
//           stockInStore,
//           unitOfMeasure,
//           _type
//         }`,
//         { 
//           storeItemId: part.storeItemId,
//           partNumber: part.partNo 
//         }
//       ) as StoreItem | null

//       if (!storeItem) {
//         console.error(`Store item not found for part: ${part.partName}, PartNo: ${part.partNo}`)
//         results.push({ success: false, partName: part.partName, error: 'Store item not found' })
//         continue
//       }

//       // OUTWARD: Add ONLY additional quantity to store
//       const newStock = (storeItem.stockInStore || 0) + additionalQty
//       console.log(`📦 OUTWARD (Additional): Adding ${additionalQty} to store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)

//       await writeClient
//         .patch(storeItem._id)
//         .set({ stockInStore: newStock })
//         .commit()

//       results.push({ success: true, partName: part.partName, newStock })
      
//     } catch (error) {
//       console.error(`Error updating stock for part ${part.partName}:`, error)
//       results.push({ success: false, partName: part.partName, error: String(error) })
//     }
//   }

//   return results
// }

// // Helper function to remove additional stock (for delete/update)
// async function removeStoreStockForOutward(parts: Part[], existingReceivedQtyMap?: Map<string, number>) {
//   const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
//   for (const part of parts) {
//     let additionalQty = part.completedQty || part.qty || 0
    
//     if (existingReceivedQtyMap && existingReceivedQtyMap.has(part.partNo)) {
//       const alreadyReceived = existingReceivedQtyMap.get(part.partNo) || 0
//       additionalQty = (part.completedQty || part.qty || 0) - alreadyReceived
//     }
    
//     if (additionalQty <= 0) {
//       continue
//     }

//     if (!part.storeItemId && !part.partNo) {
//       continue
//     }

//     try {
//       const storeItem = await client.fetch(
//         `*[_type in ["storeItem", "store"] && (storeItemId == $storeItemId || partNumber == $partNumber)][0] { 
//           _id, 
//           partNumber, 
//           partName, 
//           stockInStore,
//           unitOfMeasure,
//           _type
//         }`,
//         { 
//           storeItemId: part.storeItemId,
//           partNumber: part.partNo 
//         }
//       ) as StoreItem | null

//       if (!storeItem) {
//         console.error(`Store item not found for part: ${part.partName}`)
//         results.push({ success: false, partName: part.partName, error: 'Store item not found' })
//         continue
//       }

//       const newStock = Math.max(0, (storeItem.stockInStore || 0) - additionalQty)
//       console.log(`📦 Removing additional ${additionalQty} from store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)

//       await writeClient
//         .patch(storeItem._id)
//         .set({ stockInStore: newStock })
//         .commit()

//       results.push({ success: true, partName: part.partName, newStock })
      
//     } catch (error) {
//       console.error(`Error removing stock for part ${part.partName}:`, error)
//       results.push({ success: false, partName: part.partName, error: String(error) })
//     }
//   }

//   return results
// }

// // Helper function to get existing received quantities from inward order
// async function getExistingReceivedQuantities(inwardOrderId: string): Promise<Map<string, number>> {
//   const receivedMap = new Map<string, number>()
  
//   if (!inwardOrderId) return receivedMap
  
//   try {
//     const inwardOrder = await client.fetch(
//       `*[_type == "paint-in-opr" && _id == $id][0] {
//         parts[] {
//           partNo,
//           receivedQty
//         }
//       }`,
//       { id: inwardOrderId }
//     ) as { parts: { partNo: string; receivedQty: number }[] } | null
    
//     if (inwardOrder?.parts) {
//       for (const part of inwardOrder.parts) {
//         receivedMap.set(part.partNo, part.receivedQty || 0)
//       }
//     }
//   } catch (error) {
//     console.error('Error getting existing received quantities:', error)
//   }
  
//   return receivedMap
// }

// // Helper function to update inward order - adds to receivedQty
// async function updateInwardOrder(inwardOrderId: string, outwardParts: Part[]) {
//   try {
//     const inwardOrder = await client.fetch(
//       `*[_type == "paint-in-opr" && _id == $id][0] {
//         _id,
//         workOrderNo,
//         mwo,
//         parts[] {
//           _key,
//           partNo,
//           partName,
//           qty,
//           receivedQty,
//           remainingQty,
//           blankWidth,
//           blankLength,
//           blankSizeSqft,
//           gauge,
//           material,
//           storeItemId
//         }
//       }`,
//       { id: inwardOrderId }
//     ) as InwardOrder | null

//     if (!inwardOrder) {
//       console.error('Inward order not found:', inwardOrderId)
//       return false
//     }

//     console.log('📦 Current inward order state BEFORE update:')
//     inwardOrder.parts.forEach((p: InwardPart) => {
//       console.log(`   ${p.partName}: Qty=${p.qty}, Received=${p.receivedQty || 0}, Remaining=${p.remainingQty}`)
//     })

//     const outwardPartsMap = new Map<string, number>()
//     for (const outPart of outwardParts) {
//       const outwardQty = outPart.completedQty || outPart.qty || 0
//       outwardPartsMap.set(outPart.partNo, outwardQty)
//     }

//     console.log('📤 Outward quantities to ADD to receivedQty:', Array.from(outwardPartsMap.entries()))

//     let hasError = false
//     let updated = false
    
//     const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
//       const outwardQty = outwardPartsMap.get(inPart.partNo)
      
//       if (outwardQty) {
//         const currentReceivedQty = inPart.receivedQty || 0
//         const newReceivedQty = currentReceivedQty + outwardQty
        
//         if (newReceivedQty > inPart.qty) {
//           console.error(`❌ CRITICAL: Would exceed inward quantity for ${inPart.partNo}!`)
//           hasError = true
//           return inPart
//         }
        
//         const newRemainingQty = inPart.qty - newReceivedQty
        
//         console.log(`✅ Updating ${inPart.partName}: Received ${currentReceivedQty} + ${outwardQty} = ${newReceivedQty} (Remaining: ${newRemainingQty})`)
        
//         updated = true
//         return {
//           ...inPart,
//           receivedQty: newReceivedQty,
//           remainingQty: newRemainingQty
//         }
//       }
//       return inPart
//     })

//     if (hasError) {
//       return false
//     }

//     if (!updated) {
//       console.log('ℹ️ No parts to update in inward order')
//       return true
//     }

//     await writeClient
//       .patch(inwardOrderId)
//       .set({ parts: updatedParts })
//       .commit()

//     console.log('✅ Inward order updated successfully!')
//     return true
//   } catch (error) {
//     console.error('Error updating inward order:', error)
//     return false
//   }
// }

// export async function GET(_req: NextRequest) {
//   try {
//     const paintOutwardOps = await client.fetch(`
//       *[_type == "paint-out-opr"] | order(_createdAt desc) {
//         _id,
//         _createdAt,
//         workOrderNo,
//         gatepassNo,
//         inwardChallanNo,
//         mwo,
//         dateIssued,
//         remarks,
//         inwardOrderId,
//         total,
//         totalWeight,
//         parts[] {
//           partNo,
//           partName,
//           category,
//           storeLocation,
//           blankWidth,
//           blankLength,
//           blankSizeSqft,
//           weight,
//           sheetCost,
//           gauge,
//           material,
//           qty,
//           remainingQty,
//           completedQty,
//           paintCostPerPiece,
//           totalPrice,
//           totalWeight,
//           storeItemId,
//           inwardPartId,
//           receivedQty
//         }
//       }
//     `)

//     return NextResponse.json({ 
//       data: paintOutwardOps || [], 
//       success: true 
//     }, { status: 200 })

//   } catch (error) {
//     console.error('Error fetching paint outward operations:', error)
//     return NextResponse.json(
//       { error: 'Failed to fetch paint outward operations', success: false, data: [] },
//       { status: 500 }
//     )
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     if (!canWrite()) {
//       return NextResponse.json(
//         { error: 'Write token not configured', success: false },
//         { status: 500 }
//       )
//     }

//     const body = await req.json()
//     const { 
//       workOrderNo, 
//       gatepassNo, 
//       inwardChallanNo, 
//       mwo,
//       dateIssued, 
//       remarks, 
//       parts, 
//       inwardOrderId,
//       totalWeight 
//     } = body

//     console.log('=== 🚀 POST: Creating Paint Outward Operation ===')
//     console.log('Inward Order ID:', inwardOrderId)
//     console.log('Document Ref No (mwo):', mwo)
//     console.log('Parts to outward:', parts.map((p: Part) => ({ 
//       partNo: p.partNo, 
//       partName: p.partName, 
//       qty: p.qty,
//       completedQty: p.completedQty,
//       remainingQty: p.remainingQty
//     })))

//     if (!workOrderNo || workOrderNo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Work Order Number is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!gatepassNo || gatepassNo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Gate Pass Number is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!mwo || mwo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Document Ref No is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!dateIssued) {
//       return NextResponse.json(
//         { error: 'Date Issued is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!parts || parts.length === 0) {
//       return NextResponse.json(
//         { error: 'At least one part is required', success: false },
//         { status: 400 }
//       )
//     }

//     // Check for existing gatepass
//     const existingGatepass = await client.fetch(
//       `*[_type == "paint-out-opr" && gatepassNo == $gatepassNo][0] { _id }`,
//       { gatepassNo }
//     )

//     if (existingGatepass) {
//       return NextResponse.json(
//         { error: 'Gate pass number already exists', success: false },
//         { status: 400 }
//       )
//     }

//     // Get existing received quantities to calculate additional only
//     const existingReceivedMap = await getExistingReceivedQuantities(inwardOrderId || '')

//     // Process parts
//     const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
//       const outwardQty = part.qty || 0
//       const partForCalc = { ...part, qty: outwardQty }
//       const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
//       const remainingQtyValue = part.remainingQty !== undefined ? part.remainingQty : 0
      
//       return {
//         _key: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
//         partNo: part.partNo,
//         partName: part.partName,
//         category: part.category || '',
//         storeLocation: part.storeLocation || '',
//         blankWidth: part.blankWidth || 0,
//         blankLength: part.blankLength || 0,
//         blankSizeSqft: part.blankSizeSqft || 0,
//         weight: part.weight || 0,
//         sheetCost: part.sheetCost || 0,
//         gauge: part.gauge || '',
//         material: part.material || '',
//         qty: outwardQty,
//         remainingQty: remainingQtyValue,
//         completedQty: outwardQty,
//         paintCostPerPiece: paintCostPerPiece,
//         totalPrice: totalPrice,
//         totalWeight: partTotalWeight,
//         storeItemId: part.storeItemId || '',
//         inwardPartId: part.inwardPartId || '',
//         receivedQty: part.receivedQty || 0
//       }
//     })

//     const total = calculateOrderTotal(formattedParts)
//     const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

//     // Create paint outward operation
//     const result = await writeClient.create({
//       _type: 'paint-out-opr',
//       workOrderNo: workOrderNo.trim(),
//       gatepassNo: gatepassNo.trim(),
//       inwardChallanNo: inwardChallanNo || '',
//       mwo: mwo.trim(),
//       dateIssued: new Date(dateIssued).toISOString(),
//       remarks: remarks || '',
//       inwardOrderId: inwardOrderId || '',
//       parts: formattedParts,
//       total: total,
//       totalWeight: calculatedTotalWeight
//     })

//     console.log('✅ Paint outward operation created:', result._id)

//     // ONLY ADD ADDITIONAL QUANTITY TO STORE (not the already received)
//     const stockUpdateResults = await updateStoreStockForOutward(parts, existingReceivedMap)
//     const failedStockUpdates = stockUpdateResults.filter(r => !r.success)
//     if (failedStockUpdates.length > 0) {
//       console.error('Some stock updates failed:', failedStockUpdates)
//     } else {
//       console.log('✅ Store stock updated successfully (added additional quantity to inventory)')
//     }

//     // Update inward order's receivedQty and remainingQty
//     if (inwardOrderId) {
//       const updated = await updateInwardOrder(inwardOrderId, parts)
//       if (!updated) {
//         console.error('❌ Failed to update inward order quantities')
//       } else {
//         console.log('✅ Successfully updated inward order')
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Paint outward operation created successfully. Additional stock added to store.',
//       data: result
//     }, { status: 201 })

//   } catch (error) {
//     console.error('Error creating paint outward operation:', error)
//     return NextResponse.json(
//       { 
//         error: 'Failed to create paint outward operation', 
//         success: false,
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     )
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     if (!canWrite()) {
//       return NextResponse.json(
//         { error: 'Write token not configured', success: false },
//         { status: 500 }
//       )
//     }

//     const body = await req.json()
//     const { id, workOrderNo, gatepassNo, inwardChallanNo, mwo, dateIssued, remarks, parts, totalWeight } = body

//     if (!id) {
//       return NextResponse.json(
//         { error: 'Work order ID is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!workOrderNo || workOrderNo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Work Order Number is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!gatepassNo || gatepassNo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Gate Pass Number is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!mwo || mwo.trim() === '') {
//       return NextResponse.json(
//         { error: 'Document Ref No is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!dateIssued) {
//       return NextResponse.json(
//         { error: 'Date Issued is required', success: false },
//         { status: 400 }
//       )
//     }

//     if (!parts || parts.length === 0) {
//       return NextResponse.json(
//         { error: 'At least one part is required', success: false },
//         { status: 400 }
//       )
//     }

//     // Fetch existing document to restore old stock
//     const existingDoc = await client.fetch(
//       `*[_type == "paint-out-opr" && _id == $id][0] { 
//         _id,
//         inwardOrderId,
//         parts[] {
//           storeItemId,
//           partNo,
//           partName,
//           completedQty,
//           qty
//         }
//       }`,
//       { id }
//     ) as { _id: string; inwardOrderId: string; parts: Part[] } | null

//     if (!existingDoc) {
//       return NextResponse.json(
//         { error: 'Paint outward operation not found', success: false },
//         { status: 404 }
//       )
//     }

//     // Get existing received quantities for calculating additional
//     const existingReceivedMap = await getExistingReceivedQuantities(existingDoc.inwardOrderId || '')

//     // Remove old additional stock first
//     if (existingDoc.parts && existingDoc.parts.length > 0) {
//       await removeStoreStockForOutward(existingDoc.parts, existingReceivedMap)
//       console.log('📦 Removed old additional stock from store')
//     }

//     // Process new parts
//     const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
//       const outwardQty = part.qty || 0
//       const partForCalc = { ...part, qty: outwardQty }
//       const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
//       const existingPart = existingDoc.parts?.find((p: Part) => p.storeItemId === part.storeItemId)
//       const remainingQtyValue = part.remainingQty !== undefined ? part.remainingQty : outwardQty
      
//       return {
//         _key: existingPart?._key || `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
//         partNo: part.partNo,
//         partName: part.partName,
//         category: part.category || '',
//         storeLocation: part.storeLocation || '',
//         blankWidth: part.blankWidth || 0,
//         blankLength: part.blankLength || 0,
//         blankSizeSqft: part.blankSizeSqft || 0,
//         weight: part.weight || 0,
//         sheetCost: part.sheetCost || 0,
//         gauge: part.gauge || '',
//         material: part.material || '',
//         qty: outwardQty,
//         remainingQty: remainingQtyValue,
//         completedQty: outwardQty,
//         paintCostPerPiece: paintCostPerPiece,
//         totalPrice: totalPrice,
//         totalWeight: partTotalWeight,
//         storeItemId: part.storeItemId || '',
//         receivedQty: part.receivedQty || 0
//       }
//     })

//     const total = calculateOrderTotal(formattedParts)
//     const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

//     // Add new additional stock for updated parts
//     await updateStoreStockForOutward(parts, existingReceivedMap)
//     console.log('📦 Added new additional stock to store')

//     // Update the outward operation
//     const result = await writeClient
//       .patch(id)
//       .set({
//         workOrderNo: workOrderNo.trim(),
//         gatepassNo: gatepassNo.trim(),
//         inwardChallanNo: inwardChallanNo || '',
//         mwo: mwo.trim(),
//         dateIssued: new Date(dateIssued).toISOString(),
//         remarks: remarks || '',
//         parts: formattedParts,
//         total: total,
//         totalWeight: calculatedTotalWeight
//       })
//       .commit()

//     return NextResponse.json({
//       success: true,
//       message: 'Paint outward operation updated successfully',
//       data: result
//     }, { status: 200 })

//   } catch (error) {
//     console.error('Error updating paint outward operation:', error)
//     return NextResponse.json(
//       { error: 'Failed to update paint outward operation', success: false },
//       { status: 500 }
//     )
//   }
// }

// export async function DELETE(req: NextRequest) {
//   try {
//     if (!canWrite()) {
//       return NextResponse.json(
//         { error: 'Write token not configured', success: false },
//         { status: 500 }
//       )
//     }

//     const { searchParams } = new URL(req.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { error: 'Work order ID is required', success: false },
//         { status: 400 }
//       )
//     }

//     // Get the work order to restore stock
//     const workOrder = await client.fetch(
//       `*[_type == "paint-out-opr" && _id == $id][0] { 
//         _id,
//         inwardOrderId,
//         parts[] {
//           storeItemId,
//           partNo,
//           partName,
//           completedQty,
//           qty
//         }
//       }`,
//       { id }
//     ) as { _id: string; inwardOrderId: string; parts: Part[] } | null

//     if (!workOrder) {
//       return NextResponse.json(
//         { error: 'Paint outward operation not found', success: false },
//         { status: 404 }
//       )
//     }

//     // Get existing received quantities
//     const existingReceivedMap = await getExistingReceivedQuantities(workOrder.inwardOrderId || '')

//     // Remove additional stock for all parts (reverse the addition)
//     if (workOrder.parts && workOrder.parts.length > 0) {
//       await removeStoreStockForOutward(workOrder.parts, existingReceivedMap)
//       console.log('📦 Removed additional stock from store (deleted outward)')
//     }

//     // Reverse the inward order quantities
//     if (workOrder.inwardOrderId && workOrder.parts && workOrder.parts.length > 0) {
//       const inwardOrder = await client.fetch(
//         `*[_type == "paint-in-opr" && _id == $id][0] {
//           _id,
//           parts[] {
//             _key,
//             partNo,
//             partName,
//             qty,
//             receivedQty,
//             remainingQty
//           }
//         }`,
//         { id: workOrder.inwardOrderId }
//       ) as InwardOrder | null
      
//       if (inwardOrder) {
//         const outwardPartsMap = new Map<string, number>()
//         for (const outPart of workOrder.parts) {
//           outwardPartsMap.set(outPart.partNo, outPart.completedQty || outPart.qty || 0)
//         }
        
//         const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
//           const outwardQty = outwardPartsMap.get(inPart.partNo)
//           if (outwardQty) {
//             const currentReceived = inPart.receivedQty || 0
//             const newReceived = Math.max(0, currentReceived - outwardQty)
//             const newRemaining = inPart.qty - newReceived
            
//             return {
//               ...inPart,
//               receivedQty: newReceived,
//               remainingQty: newRemaining
//             }
//           }
//           return inPart
//         })
        
//         await writeClient
//           .patch(workOrder.inwardOrderId)
//           .set({ parts: updatedParts })
//           .commit()
        
//         console.log('✅ Reversed inward order quantities')
//       }
//     }

//     await writeClient.delete(id)

//     return NextResponse.json({
//       success: true,
//       message: 'Paint outward operation deleted successfully. Additional stock removed from store.'
//     }, { status: 200 })

//   } catch (error) {
//     console.error('Error deleting paint outward operation:', error)
//     return NextResponse.json(
//       { error: 'Failed to delete paint outward operation', success: false },
//       { status: 500 }
//     )
//   }
// }

// export const dynamic = 'force-dynamic'


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
  storeItemId?: string;
}

interface InwardOrder {
  _id: string;
  workOrderNo: string;
  mwo?: string;
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

// Helper function to update store stock - ONLY ADDITIONAL OUTWARD quantity
async function updateStoreStockForOutward(parts: Part[], existingReceivedQtyMap?: Map<string, number>) {
  const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
  for (const part of parts) {
    let additionalQty = part.completedQty || part.qty || 0
    
    if (existingReceivedQtyMap && existingReceivedQtyMap.has(part.partNo)) {
      const alreadyReceived = existingReceivedQtyMap.get(part.partNo) || 0
      additionalQty = (part.completedQty || part.qty || 0) - alreadyReceived
    }
    
    if (additionalQty <= 0) {
      console.log(`⚠️ No additional quantity for ${part.partName}, skipping stock update`)
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

      const newStock = (storeItem.stockInStore || 0) + additionalQty
      console.log(`📦 OUTWARD (Additional): Adding ${additionalQty} to store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)

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

// Helper function to remove additional stock (for delete/update)
async function removeStoreStockForOutward(parts: Part[], existingReceivedQtyMap?: Map<string, number>) {
  const results: { success: boolean; partName?: string; newStock?: number; error?: string }[] = []
  
  for (const part of parts) {
    let additionalQty = part.completedQty || part.qty || 0
    
    if (existingReceivedQtyMap && existingReceivedQtyMap.has(part.partNo)) {
      const alreadyReceived = existingReceivedQtyMap.get(part.partNo) || 0
      additionalQty = (part.completedQty || part.qty || 0) - alreadyReceived
    }
    
    if (additionalQty <= 0) {
      continue
    }

    if (!part.storeItemId && !part.partNo) {
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
        console.error(`Store item not found for part: ${part.partName}`)
        results.push({ success: false, partName: part.partName, error: 'Store item not found' })
        continue
      }

      const newStock = Math.max(0, (storeItem.stockInStore || 0) - additionalQty)
      console.log(`📦 Removing additional ${additionalQty} from store for ${storeItem.partName}: ${storeItem.stockInStore || 0} -> ${newStock}`)

      await writeClient
        .patch(storeItem._id)
        .set({ stockInStore: newStock })
        .commit()

      results.push({ success: true, partName: part.partName, newStock })
      
    } catch (error) {
      console.error(`Error removing stock for part ${part.partName}:`, error)
      results.push({ success: false, partName: part.partName, error: String(error) })
    }
  }

  return results
}

// Helper function to get existing received quantities from inward order
async function getExistingReceivedQuantities(inwardOrderId: string): Promise<Map<string, number>> {
  const receivedMap = new Map<string, number>()
  
  if (!inwardOrderId) return receivedMap
  
  try {
    const inwardOrder = await client.fetch(
      `*[_type == "paint-in-opr" && _id == $id][0] {
        parts[] {
          partNo,
          receivedQty
        }
      }`,
      { id: inwardOrderId }
    ) as { parts: { partNo: string; receivedQty: number }[] } | null
    
    if (inwardOrder?.parts) {
      for (const part of inwardOrder.parts) {
        receivedMap.set(part.partNo, part.receivedQty || 0)
      }
    }
  } catch (error) {
    console.error('Error getting existing received quantities:', error)
  }
  
  return receivedMap
}

// Helper function to update inward order - adds to receivedQty
async function updateInwardOrder(inwardOrderId: string, outwardParts: Part[]) {
  try {
    const inwardOrder = await client.fetch(
      `*[_type == "paint-in-opr" && _id == $id][0] {
        _id,
        workOrderNo,
        mwo,
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

    console.log('📦 Current inward order state BEFORE update:')
    inwardOrder.parts.forEach((p: InwardPart) => {
      console.log(`   ${p.partName}: Qty=${p.qty}, Received=${p.receivedQty || 0}, Remaining=${p.remainingQty}`)
    })

    const outwardPartsMap = new Map<string, number>()
    for (const outPart of outwardParts) {
      const outwardQty = outPart.completedQty || outPart.qty || 0
      outwardPartsMap.set(outPart.partNo, outwardQty)
    }

    console.log('📤 Outward quantities to ADD to receivedQty:', Array.from(outwardPartsMap.entries()))

    let hasError = false
    let updated = false
    
    const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
      const outwardQty = outwardPartsMap.get(inPart.partNo)
      
      if (outwardQty) {
        const currentReceivedQty = inPart.receivedQty || 0
        const newReceivedQty = currentReceivedQty + outwardQty
        
        if (newReceivedQty > inPart.qty) {
          console.error(`❌ CRITICAL: Would exceed inward quantity for ${inPart.partNo}!`)
          hasError = true
          return inPart
        }
        
        const newRemainingQty = inPart.qty - newReceivedQty
        
        console.log(`✅ Updating ${inPart.partName}: Received ${currentReceivedQty} + ${outwardQty} = ${newReceivedQty} (Remaining: ${newRemainingQty})`)
        
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

    console.log('✅ Inward order updated successfully!')
    return true
  } catch (error) {
    console.error('Error updating inward order:', error)
    return false
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
        mwo,
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

    // Debug log to check if data has required fields
    if (paintOutwardOps && paintOutwardOps.length > 0 && paintOutwardOps[0].parts && paintOutwardOps[0].parts.length > 0) {
      console.log('Sample part data from API:', {
        partName: paintOutwardOps[0].parts[0].partName,
        material: paintOutwardOps[0].parts[0].material,
        gauge: paintOutwardOps[0].parts[0].gauge,
        blankWidth: paintOutwardOps[0].parts[0].blankWidth,
        blankLength: paintOutwardOps[0].parts[0].blankLength,
        blankSizeSqft: paintOutwardOps[0].parts[0].blankSizeSqft
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
      mwo,
      dateIssued, 
      remarks, 
      parts, 
      inwardOrderId,
      totalWeight 
    } = body

    console.log('=== 🚀 POST: Creating Paint Outward Operation ===')
    console.log('Inward Order ID:', inwardOrderId)
    console.log('Document Ref No (mwo):', mwo)
    console.log('Parts to outward:', parts.map((p: Part) => ({ 
      partNo: p.partNo, 
      partName: p.partName, 
      qty: p.qty,
      completedQty: p.completedQty,
      remainingQty: p.remainingQty,
      blankWidth: p.blankWidth,
      blankLength: p.blankLength,
      blankSizeSqft: p.blankSizeSqft,
      material: p.material,
      gauge: p.gauge
    })))

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

    if (!mwo || mwo.trim() === '') {
      return NextResponse.json(
        { error: 'Document Ref No (MWO) is required', success: false },
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

    // Get existing received quantities to calculate additional only
    const existingReceivedMap = await getExistingReceivedQuantities(inwardOrderId || '')

    // Process parts
    const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
      const outwardQty = part.qty || 0
      const partForCalc = { ...part, qty: outwardQty }
      const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
      const remainingQtyValue = part.remainingQty !== undefined ? part.remainingQty : 0
      
      return {
        _key: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
        partNo: part.partNo,
        partName: part.partName,
        category: part.category || '',
        storeLocation: part.storeLocation || '',
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft || 0,
        weight: part.weight || 0,
        sheetCost: part.sheetCost || 0,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: outwardQty,
        remainingQty: remainingQtyValue,
        completedQty: outwardQty,
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
      mwo: mwo.trim(),
      dateIssued: new Date(dateIssued).toISOString(),
      remarks: remarks || '',
      inwardOrderId: inwardOrderId || '',
      parts: formattedParts,
      total: total,
      totalWeight: calculatedTotalWeight
    })

    console.log('✅ Paint outward operation created:', result._id)

    // ONLY ADD ADDITIONAL QUANTITY TO STORE (not the already received)
    const stockUpdateResults = await updateStoreStockForOutward(parts, existingReceivedMap)
    const failedStockUpdates = stockUpdateResults.filter(r => !r.success)
    if (failedStockUpdates.length > 0) {
      console.error('Some stock updates failed:', failedStockUpdates)
    } else {
      console.log('✅ Store stock updated successfully (added additional quantity to inventory)')
    }

    // Update inward order's receivedQty and remainingQty
    if (inwardOrderId) {
      const updated = await updateInwardOrder(inwardOrderId, parts)
      if (!updated) {
        console.error('❌ Failed to update inward order quantities')
      } else {
        console.log('✅ Successfully updated inward order')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Paint outward operation created successfully. Additional stock added to store.',
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
    const { id, workOrderNo, gatepassNo, inwardChallanNo, mwo, dateIssued, remarks, parts, totalWeight } = body

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

    if (!mwo || mwo.trim() === '') {
      return NextResponse.json(
        { error: 'Document Ref No (MWO) is required', success: false },
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

    // Fetch existing document to restore old stock
    const existingDoc = await client.fetch(
      `*[_type == "paint-out-opr" && _id == $id][0] { 
        _id,
        inwardOrderId,
        parts[] {
          storeItemId,
          partNo,
          partName,
          completedQty,
          qty
        }
      }`,
      { id }
    ) as { _id: string; inwardOrderId: string; parts: Part[] } | null

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Paint outward operation not found', success: false },
        { status: 404 }
      )
    }

    // Get existing received quantities for calculating additional
    const existingReceivedMap = await getExistingReceivedQuantities(existingDoc.inwardOrderId || '')

    // Remove old additional stock first
    if (existingDoc.parts && existingDoc.parts.length > 0) {
      await removeStoreStockForOutward(existingDoc.parts, existingReceivedMap)
      console.log('📦 Removed old additional stock from store')
    }

    // Process new parts
    const formattedParts: FormattedPart[] = parts.map((part: Part, index: number) => {
      const outwardQty = part.qty || 0
      const partForCalc = { ...part, qty: outwardQty }
      const { paintCostPerPiece, totalPrice, totalWeight: partTotalWeight } = calculatePartValues(partForCalc)
      
      const existingPart = existingDoc.parts?.find((p: Part) => p.storeItemId === part.storeItemId)
      const remainingQtyValue = part.remainingQty !== undefined ? part.remainingQty : outwardQty
      
      return {
        _key: existingPart?._key || `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
        partNo: part.partNo,
        partName: part.partName,
        category: part.category || '',
        storeLocation: part.storeLocation || '',
        blankWidth: part.blankWidth || 0,
        blankLength: part.blankLength || 0,
        blankSizeSqft: part.blankSizeSqft || 0,
        weight: part.weight || 0,
        sheetCost: part.sheetCost || 0,
        gauge: part.gauge || '',
        material: part.material || '',
        qty: outwardQty,
        remainingQty: remainingQtyValue,
        completedQty: outwardQty,
        paintCostPerPiece: paintCostPerPiece,
        totalPrice: totalPrice,
        totalWeight: partTotalWeight,
        storeItemId: part.storeItemId || '',
        receivedQty: part.receivedQty || 0
      }
    })

    const total = calculateOrderTotal(formattedParts)
    const calculatedTotalWeight = totalWeight || calculateOrderTotalWeight(formattedParts)

    // Add new additional stock for updated parts
    await updateStoreStockForOutward(parts, existingReceivedMap)
    console.log('📦 Added new additional stock to store')

    // Update the outward operation
    const result = await writeClient
      .patch(id)
      .set({
        workOrderNo: workOrderNo.trim(),
        gatepassNo: gatepassNo.trim(),
        inwardChallanNo: inwardChallanNo || '',
        mwo: mwo.trim(),
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
        inwardOrderId,
        parts[] {
          storeItemId,
          partNo,
          partName,
          completedQty,
          qty
        }
      }`,
      { id }
    ) as { _id: string; inwardOrderId: string; parts: Part[] } | null

    if (!workOrder) {
      return NextResponse.json(
        { error: 'Paint outward operation not found', success: false },
        { status: 404 }
      )
    }

    // Get existing received quantities
    const existingReceivedMap = await getExistingReceivedQuantities(workOrder.inwardOrderId || '')

    // Remove additional stock for all parts (reverse the addition)
    if (workOrder.parts && workOrder.parts.length > 0) {
      await removeStoreStockForOutward(workOrder.parts, existingReceivedMap)
      console.log('📦 Removed additional stock from store (deleted outward)')
    }

    // Reverse the inward order quantities
    if (workOrder.inwardOrderId && workOrder.parts && workOrder.parts.length > 0) {
      const inwardOrder = await client.fetch(
        `*[_type == "paint-in-opr" && _id == $id][0] {
          _id,
          parts[] {
            _key,
            partNo,
            partName,
            qty,
            receivedQty,
            remainingQty
          }
        }`,
        { id: workOrder.inwardOrderId }
      ) as InwardOrder | null
      
      if (inwardOrder) {
        const outwardPartsMap = new Map<string, number>()
        for (const outPart of workOrder.parts) {
          outwardPartsMap.set(outPart.partNo, outPart.completedQty || outPart.qty || 0)
        }
        
        const updatedParts = inwardOrder.parts.map((inPart: InwardPart) => {
          const outwardQty = outwardPartsMap.get(inPart.partNo)
          if (outwardQty) {
            const currentReceived = inPart.receivedQty || 0
            const newReceived = Math.max(0, currentReceived - outwardQty)
            const newRemaining = inPart.qty - newReceived
            
            return {
              ...inPart,
              receivedQty: newReceived,
              remainingQty: newRemaining
            }
          }
          return inPart
        })
        
        await writeClient
          .patch(workOrder.inwardOrderId)
          .set({ parts: updatedParts })
          .commit()
        
        console.log('✅ Reversed inward order quantities')
      }
    }

    await writeClient.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Paint outward operation deleted successfully. Additional stock removed from store.'
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting paint outward operation:', error)
    return NextResponse.json(
      { error: 'Failed to delete paint outward operation', success: false },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'