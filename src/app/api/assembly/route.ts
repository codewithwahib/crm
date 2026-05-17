import { client, writeClient } from '@/sanity/lib/client'
import { NextResponse } from 'next/server'

// Define types
interface Part {
  partNo: string;
  partName: string;
  category: string;
  storeLocation: string;
  blankWidth: number;
  blankLength: number;
  blankWidthMM: number;
  blankLengthMM: number;
  blankSizeSqft: number;
  sheetCost: number;
  gauge: string;
  material: string;
  qty: number;
  completedQty: number;
  remainingQty: number;
  storeItemId: string;
}

// AssemblyOrder interface removed - not used

interface CreateAssemblyRequest {
  workOrderNo: string;
  gatepassNo: string;
  dateIssued: string;
  assemblyDate?: string | null;
  remarks?: string;
  parts: Partial<Part>[];
  status?: string;
}

interface UpdateAssemblyRequest {
  id: string;
  workOrderNo?: string;
  gatepassNo?: string;
  dateIssued?: string;
  assemblyDate?: string | null;
  remarks?: string;
  parts?: Partial<Part>[];
  status?: string;
}

interface DeleteAssemblyRequest {
  id: string;
}

// GET - Fetch all assembly orders
export async function GET() {
  try {
    const query = `*[_type == "assembly"] | order(_createdAt desc) {
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
        blankSizeSqft,
        sheetCost,
        gauge,
        material,
        qty,
        completedQty,
        remainingQty,
        storeItemId
      },
      status
    }`
    
    const assemblies = await client.fetch(query)
    return NextResponse.json(assemblies || [])
    
  } catch (error) {
    console.error('Error fetching assembly orders:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// POST - Create a new assembly order
export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateAssemblyRequest
    const { workOrderNo, gatepassNo, dateIssued, assemblyDate, remarks, parts, status } = body
    
    // Validate required fields
    const missingFields = []
    if (!workOrderNo) missingFields.push('workOrderNo')
    if (!gatepassNo) missingFields.push('gatepassNo')
    if (!dateIssued) missingFields.push('dateIssued')
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: 'At least one part is required' },
        { status: 400 }
      )
    }
    
    // Prepare parts with all required fields
    const partsWithRequiredFields: Part[] = parts.map((part) => ({
      partNo: part.partNo || '',
      partName: part.partName || '',
      category: part.category || '',
      storeLocation: part.storeLocation || '',
      blankWidth: part.blankWidth || 0,
      blankLength: part.blankLength || 0,
      blankWidthMM: part.blankWidthMM || 0,
      blankLengthMM: part.blankLengthMM || 0,
      blankSizeSqft: part.blankSizeSqft || 0,
      sheetCost: part.sheetCost || 0,
      gauge: part.gauge || '',
      material: part.material || '',
      qty: part.qty || 0,
      completedQty: part.completedQty || 0,
      remainingQty: (part.qty || 0) - (part.completedQty || 0),
      storeItemId: part.storeItemId || ''
    }))
    
    // Create document in Sanity
    const doc = {
      _type: 'assembly',
      workOrderNo,
      gatepassNo,
      dateIssued,
      assemblyDate: assemblyDate || null,
      remarks: remarks || '',
      parts: partsWithRequiredFields,
      status: status || 'pending'
    }
    
    const result = await writeClient.create(doc)
    
    return NextResponse.json({
      success: true,
      message: 'Assembly order created successfully',
      data: result
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating assembly order:', error)
    const err = error as Error
    return NextResponse.json(
      { 
        error: 'Failed to create assembly order', 
        details: err.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update an existing assembly order
export async function PUT(request: Request) {
  try {
    const body = await request.json() as UpdateAssemblyRequest
    const { id, workOrderNo, gatepassNo, dateIssued, assemblyDate, remarks, parts, status } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }
    
    const partsWithRemaining: Part[] = parts?.map((part) => ({
      partNo: part.partNo || '',
      partName: part.partName || '',
      category: part.category || '',
      storeLocation: part.storeLocation || '',
      blankWidth: part.blankWidth || 0,
      blankLength: part.blankLength || 0,
      blankWidthMM: part.blankWidthMM || 0,
      blankLengthMM: part.blankLengthMM || 0,
      blankSizeSqft: part.blankSizeSqft || 0,
      sheetCost: part.sheetCost || 0,
      gauge: part.gauge || '',
      material: part.material || '',
      qty: part.qty || 0,
      completedQty: part.completedQty || 0,
      remainingQty: (part.qty || 0) - (part.completedQty || 0),
      storeItemId: part.storeItemId || ''
    })) || []
    
    const result = await writeClient
      .patch(id)
      .set({
        workOrderNo,
        gatepassNo,
        dateIssued,
        assemblyDate: assemblyDate || null,
        remarks: remarks || '',
        parts: partsWithRemaining,
        status: status || 'pending'
      })
      .commit()
    
    return NextResponse.json({
      success: true,
      message: 'Assembly order updated successfully',
      data: result
    })
    
  } catch (error) {
    console.error('Error updating assembly order:', error)
    const err = error as Error
    return NextResponse.json(
      { 
        error: 'Failed to update assembly order', 
        details: err.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete an assembly order
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json() as DeleteAssemblyRequest
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }
    
    const result = await writeClient.delete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Assembly order deleted successfully',
      data: result
    })
    
  } catch (error) {
    console.error('Error deleting assembly order:', error)
    const err = error as Error
    return NextResponse.json(
      { 
        error: 'Failed to delete assembly order', 
        details: err.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}