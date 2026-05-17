// sanity/lib/client.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// ✅ Type definitions
interface SanityImageSource {
  asset?: {
    _ref?: string;
    _type?: string;
  };
  [key: string]: unknown;
}

interface StoreItemData {
  partNumber: string;
  partName: string;
  category: string;
  storeLocation: string;
  gauge?: string;
  material?: string;
  blankWidth?: number;
  blankLength?: number;
  blankWidthMM?: number;
  blankLengthMM?: number;
  blankWidthInch?: number;
  blankLengthInch?: number;
  sqft?: number;
  todaySheetCost?: number;
  todayPaintCost?: number;
  sheetCostPerPiece?: number;
  paintCostPerPiece?: number;
  stockInStore: number;
  minimumStockLevel?: number;
  unitOfMeasure?: string;
  returnStockOrders?: string[];
  gatepasses?: string[];
  [key: string]: unknown;
}

interface StoreUpdateData {
  [key: string]: unknown;
}

interface StockUpdate {
  id: string;
  quantity: number;
  partName: string;
}

interface StockResult {
  partName: string;
  success: boolean;
  error?: string;
  oldStock?: number;
  newStock?: number;
  deducted?: number;
}

interface Part {
  partNo: string;
  partName: string;
  category: string;
  storeLocation: string;
  blankWidth?: number;
  blankLength?: number;
  blankWidthMM?: number;
  blankLengthMM?: number;
  blankWidthInch?: number;
  blankLengthInch?: number;
  blankSizeSqft?: number;
  sheetCost?: number;
  gauge?: string;
  material?: string;
  qty: number;
  completedQty?: number;
  remainingQty?: number;
  storeItemId?: string;
  paintCostPerSqft?: number;
  paintCostPerPiece?: number;
  totalPrice?: number;
}

interface AssemblyOrderData {
  workOrderNo: string;
  gatepassNo: string;
  dateIssued: string;
  assemblyDate?: string | null;
  remarks?: string;
  parts: Part[];
  status?: string;
}

interface WorkOrderData {
  workOrderNo: string;
  gatepassNo: string;
  dateIssued: string;
  remarks?: string;
  parts: Part[];
  overallStatus?: string;
}

// ✅ Environment validation
const requiredEnvVars = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  writeToken: process.env.SANITY_API_TOKEN,
}

// ✅ Check for missing env vars
export const checkWritePermissions = (): string | null => {
  if (!requiredEnvVars.projectId) return 'NEXT_PUBLIC_SANITY_PROJECT_ID is missing'
  if (!requiredEnvVars.dataset) return 'NEXT_PUBLIC_SANITY_DATASET is missing'
  if (!requiredEnvVars.writeToken) return 'SANITY_API_TOKEN is missing - writing disabled'
  return null
}

// ✅ READ CLIENT
export const client = createClient({
  projectId: requiredEnvVars.projectId!,
  dataset: requiredEnvVars.dataset!,
  apiVersion: '2024-07-01',
  useCdn: true,
})

// ✅ WRITE CLIENT
export const writeClient = createClient({
  projectId: requiredEnvVars.projectId!,
  dataset: requiredEnvVars.dataset!,
  apiVersion: '2024-07-01',
  token: requiredEnvVars.writeToken,
  useCdn: false,
})

// ✅ Image builder
const builder = imageUrlBuilder(client)
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ✅ Helper
export const canWrite = () => !!requiredEnvVars.writeToken

// =====================================================
// ✅ STORE HELPERS
// =====================================================

export const storeHelpers = {
  createStoreItem: async (itemData: StoreItemData) => {
    if (!canWrite()) throw new Error('Write token not configured')

    return await writeClient.create({
      _type: 'store',
      ...itemData,
      returnStockOrders: itemData.returnStockOrders || [],
      gatepasses: itemData.gatepasses || [],
    })
  },

  updateStoreItem: async (id: string, updates: StoreUpdateData) => {
    if (!canWrite()) throw new Error('Write token not configured')
    return await writeClient.patch(id).set(updates).commit()
  },

  deleteStoreItem: async (id: string) => {
    if (!canWrite()) throw new Error('Write token not configured')
    return await writeClient.delete(id)
  },

  getAllStoreItems: async () => {
    return await client.fetch(`
      *[_type == "store"] | order(_createdAt desc) {
        _id,
        _createdAt,
        partNumber,
        partName,
        category,
        storeLocation,
        gauge,
        material,
        blankWidth,
        blankLength,
        blankWidthMM,
        blankLengthMM,
        blankWidthInch,
        blankLengthInch,
        sqft,
        todaySheetCost,
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
  },

  getStoreItemById: async (id: string) => {
    return await client.fetch(
      `*[_type == "store" && _id == $id][0]`,
      { id }
    )
  },

  updateStock: async (id: string, qty: number) => {
    if (!canWrite()) throw new Error('Write token not configured')
    return await writeClient.patch(id).set({ stockInStore: qty }).commit()
  },

  // ✅ Deduct stock from multiple items at once
  deductStock: async (updates: StockUpdate[]) => {
    if (!canWrite()) throw new Error('Write token not configured')
    
    const results: StockResult[] = []
    
    for (const update of updates) {
      try {
        // Get current item
        const currentItem = await client.fetch(
          `*[_type == "store" && _id == $id][0]{ _id, partNumber, partName, stockInStore, unitOfMeasure }`,
          { id: update.id }
        )
        
        if (!currentItem) {
          results.push({ 
            partName: update.partName, 
            success: false, 
            error: 'Item not found' 
          })
          continue
        }
        
        const newStock = currentItem.stockInStore - update.quantity
        
        if (newStock < 0) {
          results.push({
            partName: update.partName,
            success: false,
            error: `Insufficient stock. Available: ${currentItem.stockInStore} ${currentItem.unitOfMeasure || 'units'}`
          })
          continue
        }
        
        await writeClient.patch(update.id).set({ stockInStore: newStock }).commit()
        
        results.push({
          partName: update.partName,
          success: true,
          oldStock: currentItem.stockInStore,
          newStock: newStock,
          deducted: update.quantity
        })
        
      } catch (error) {
        results.push({
          partName: update.partName,
          success: false,
          error: (error as Error).message
        })
      }
    }
    
    return results
  },
}

// =====================================================
// ✅ ASSEMBLY OPERATIONS HELPERS
// =====================================================

export const assemblyHelpers = {
  // ✅ Get all assembly orders
  getAllAssemblyOrders: async () => {
    return await client.fetch(`
      *[_type == "assembly"] | order(_createdAt desc) {
        _id,
        _createdAt,
        workOrderNo,
        gatepassNo,
        dateIssued,
        assemblyDate,
        remarks,
        parts[] {
          partNo,
          partName,
          category,
          storeLocation,
          blankWidth,
          blankLength,
          blankWidthMM,
          blankLengthMM,
          blankWidthInch,
          blankLengthInch,
          blankSizeSqft,
          sheetCost,
          gauge,
          material,
          qty,
          completedQty,
          remainingQty,
          storeItemId,
          "totalCost": sheetCost * qty
        },
        status
      }
    `)
  },

  // ✅ Get single assembly order
  getAssemblyOrderById: async (id: string) => {
    return await client.fetch(
      `*[_type == "assembly" && _id == $id][0] {
        _id,
        _createdAt,
        workOrderNo,
        gatepassNo,
        dateIssued,
        assemblyDate,
        remarks,
        parts[] {
          partNo,
          partName,
          category,
          storeLocation,
          blankWidth,
          blankLength,
          blankWidthMM,
          blankLengthMM,
          blankWidthInch,
          blankLengthInch,
          blankSizeSqft,
          sheetCost,
          gauge,
          material,
          qty,
          completedQty,
          remainingQty,
          storeItemId,
          "totalCost": sheetCost * qty
        },
        status
      }`,
      { id }
    )
  },

  // ✅ Create assembly order
  createAssemblyOrder: async (data: AssemblyOrderData) => {
    if (!canWrite()) throw new Error('Write token not configured')

    return await writeClient.create({
      _type: 'assembly',
      workOrderNo: data.workOrderNo,
      gatepassNo: data.gatepassNo,
      dateIssued: data.dateIssued,
      assemblyDate: data.assemblyDate || null,
      remarks: data.remarks || '',
      parts: data.parts.map((p: Part) => ({
        _type: 'object',
        partNo: p.partNo,
        partName: p.partName,
        category: p.category,
        storeLocation: p.storeLocation,
        blankWidth: p.blankWidth || 0,
        blankLength: p.blankLength || 0,
        blankWidthMM: p.blankWidthMM || 0,
        blankLengthMM: p.blankLengthMM || 0,
        blankWidthInch: p.blankWidthInch || 0,
        blankLengthInch: p.blankLengthInch || 0,
        blankSizeSqft: p.blankSizeSqft || 0,
        sheetCost: p.sheetCost || 0,
        gauge: p.gauge || '',
        material: p.material || '',
        qty: p.qty,
        completedQty: p.completedQty || 0,
        remainingQty: p.remainingQty ?? (p.qty - (p.completedQty || 0)),
        storeItemId: p.storeItemId || '',
      })),
      status: data.status || 'pending',
    })
  },

  // ✅ Update assembly order
  updateAssemblyOrder: async (id: string, data: AssemblyOrderData) => {
    if (!canWrite()) throw new Error('Write token not configured')

    const exists = await client.fetch(
      `*[_type == "assembly" && _id == $id][0]`,
      { id }
    )
    if (!exists) throw new Error('Assembly order not found')

    return await writeClient
      .patch(id)
      .set({
        workOrderNo: data.workOrderNo,
        gatepassNo: data.gatepassNo,
        dateIssued: data.dateIssued,
        assemblyDate: data.assemblyDate || null,
        remarks: data.remarks || '',
        parts: data.parts.map((p: Part) => ({
          _type: 'object',
          partNo: p.partNo,
          partName: p.partName,
          category: p.category,
          storeLocation: p.storeLocation,
          blankWidth: p.blankWidth || 0,
          blankLength: p.blankLength || 0,
          blankWidthMM: p.blankWidthMM || 0,
          blankLengthMM: p.blankLengthMM || 0,
          blankWidthInch: p.blankWidthInch || 0,
          blankLengthInch: p.blankLengthInch || 0,
          blankSizeSqft: p.blankSizeSqft || 0,
          sheetCost: p.sheetCost || 0,
          gauge: p.gauge || '',
          material: p.material || '',
          qty: p.qty,
          completedQty: p.completedQty || 0,
          remainingQty: p.remainingQty ?? (p.qty - (p.completedQty || 0)),
          storeItemId: p.storeItemId || '',
        })),
        status: data.status || 'pending',
      })
      .commit()
  },

  // ✅ Delete assembly order
  deleteAssemblyOrder: async (id: string) => {
    if (!canWrite()) throw new Error('Write token not configured')
    return await writeClient.delete(id)
  },

  // ✅ Update part completion status
  updatePartCompletion: async (orderId: string, partIndex: number, completedQty: number) => {
    if (!canWrite()) throw new Error('Write token not configured')
    
    // Get current order
    const order = await client.fetch(
      `*[_type == "assembly" && _id == $id][0]{ parts }`,
      { id: orderId }
    ) as { parts: Part[] } | null
    
    if (!order) throw new Error('Assembly order not found')
    
    const updatedParts = [...order.parts]
    const part = updatedParts[partIndex]
    
    if (!part) throw new Error('Part not found')
    
    const newCompletedQty = Math.min(completedQty, part.qty)
    const newRemainingQty = part.qty - newCompletedQty
    
    updatedParts[partIndex] = {
      ...part,
      completedQty: newCompletedQty,
      remainingQty: newRemainingQty
    }
    
    // Calculate overall status
    const totalQty = updatedParts.reduce((sum: number, p: Part) => sum + p.qty, 0)
    const totalCompleted = updatedParts.reduce((sum: number, p: Part) => sum + (p.completedQty || 0), 0)
    let status = 'pending'
    if (totalCompleted === 0) status = 'pending'
    else if (totalCompleted >= totalQty) status = 'completed'
    else status = 'in-progress'
    
    return await writeClient
      .patch(orderId)
      .set({ parts: updatedParts, status })
      .commit()
  },
}

// =====================================================
// ✅ MECHANICAL OPERATIONS HELPERS
// =====================================================

export const mechanicalOpHelpers = {
  // ✅ Get all work orders
  getAllWorkOrders: async () => {
    return await client.fetch(`
      *[_type == "mechanical-op"] | order(dateIssued desc) {
        _id,
        _createdAt,
        workOrderNo,
        gatepassNo,
        dateIssued,
        remarks,
        parts[] {
          partNo,
          partName,
          category,
          blankSizeSqft,
          sheetCost,
          gauge,
          material,
          qty,
          completedQty,
          remainingQty,
          storeItemId,
          "totalCost": sheetCost * qty
        },
        overallStatus
      }
    `)
  },

  // ✅ Get single
  getWorkOrderById: async (id: string) => {
    return await client.fetch(
      `*[_type == "mechanical-op" && _id == $id][0] {
        _id,
        _createdAt,
        workOrderNo,
        gatepassNo,
        dateIssued,
        remarks,
        parts[] {
          partNo,
          partName,
          category,
          blankSizeSqft,
          sheetCost,
          gauge,
          material,
          qty,
          completedQty,
          remainingQty,
          storeItemId,
          "totalCost": sheetCost * qty
        },
        overallStatus
      }`,
      { id }
    )
  },

  // ✅ Create
  createWorkOrder: async (data: WorkOrderData) => {
    if (!canWrite()) throw new Error('Write token not configured')

    return await writeClient.create({
      _type: 'mechanical-op',
      workOrderNo: data.workOrderNo,
      gatepassNo: data.gatepassNo,
      dateIssued: data.dateIssued,
      remarks: data.remarks || '',
      parts: data.parts.map((p: Part) => ({
        _type: 'object',
        partNo: p.partNo,
        partName: p.partName,
        category: p.category,
        storeLocation: p.storeLocation,
        blankSizeSqft: p.blankSizeSqft,
        sheetCost: p.sheetCost,
        gauge: p.gauge,
        material: p.material,
        qty: p.qty,
        completedQty: p.completedQty || 0,
        remainingQty: p.remainingQty ?? (p.qty - (p.completedQty || 0)),
        storeItemId: p.storeItemId,
      })),
      overallStatus: data.overallStatus || 'not-started',
    })
  },

  // ✅ Update
  updateWorkOrder: async (id: string, data: WorkOrderData) => {
    if (!canWrite()) throw new Error('Write token not configured')

    const exists = await client.fetch(
      `*[_type == "mechanical-op" && _id == $id][0]`,
      { id }
    )
    if (!exists) throw new Error('Work order not found')

    return await writeClient
      .patch(id)
      .set({
        workOrderNo: data.workOrderNo,
        gatepassNo: data.gatepassNo,
        dateIssued: data.dateIssued,
        remarks: data.remarks,
        parts: data.parts.map((p: Part) => ({
          _type: 'object',
          partNo: p.partNo,
          partName: p.partName,
          category: p.category,
          storeLocation: p.storeLocation,
          blankSizeSqft: p.blankSizeSqft,
          sheetCost: p.sheetCost,
          gauge: p.gauge,
          material: p.material,
          qty: p.qty,
          completedQty: p.completedQty || 0,
          remainingQty: p.remainingQty ?? (p.qty - (p.completedQty || 0)),
          storeItemId: p.storeItemId,
        })),
        overallStatus: data.overallStatus || 'in-progress',
      })
      .commit()
  },

  // ✅ Delete
  deleteWorkOrder: async (id: string) => {
    if (!canWrite()) throw new Error('Write token not configured')
    return await writeClient.delete(id)
  },
}

// =====================================================

export { requiredEnvVars }