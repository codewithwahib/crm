import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/client';

// Define types for the items
interface ChallanItem {
  serialNumber: number;
  description: string;
  width: number;
  length: number;
  qty: number;
  receivedQty: number;
  remainingQty: number;
  sqft: number;
  ratePerSqft: number;
  rate: number;
  amount: number;
}

interface ReceivedItem {
  serialNumber: number;
  receivedQty: number;
}

interface ChallanDocument {
  _type: string;
  autoChallanNumber: string;
  date: string;
  time: string;
  workOrderNumber: string;
  paintColor: string;
  items: Array<{
    _type: string;
    serialNumber: number;
    description: string;
    width: number;
    length: number;
    qty: number;
    sqft: number;
    ratePerSqft: number;
    rate: number;
    amount: number;
    receivedQty: number;
    remainingQty: number;
  }>;
  totalPieces: number;
  totalReceivedPieces: number;
  totalRemainingPieces: number;
  totalAmount: number;
  summary?: string;
  _createdAt: string;
}

// GET - Get next challan number or fetch challans
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'getNextNumber') {
      // Find the latest challan number
      const query = `*[_type == "outwardChallan"] | order(autoChallanNumber desc)[0]{
        autoChallanNumber
      }`;

      const latestChallan = await writeClient.fetch(query);
      
      let nextNumber = 1;
      if (latestChallan?.autoChallanNumber) {
        // Extract number from format like "OC-2024-001"
        const match = latestChallan.autoChallanNumber.match(/OC-(\d+)-(\d+)/);
        if (match && match[2]) {
          nextNumber = parseInt(match[2]) + 1;
        }
      }

      const year = new Date().getFullYear();
      const nextChallanNumber = `OC-${year}-${nextNumber.toString().padStart(3, '0')}`;

      return NextResponse.json({
        success: true,
        nextChallanNumber,
        latestChallan: latestChallan?.autoChallanNumber || 'None'
      });
    }

    // Default: Fetch all outward challans
    const query = `*[_type == "outwardChallan"] | order(date desc, _createdAt desc){
      _id,
      autoChallanNumber,
      date,
      time,
      workOrderNumber,
      paintColor,
      items[] {
        serialNumber,
        description,
        width,
        length,
        qty,
        receivedQty,
        remainingQty,
        sqft,
        ratePerSqft,
        rate,
        amount
      },
      totalPieces,
      totalReceivedPieces,
      totalRemainingPieces,
      totalAmount,
      summary,
      _createdAt
    }`;

    const challans = await writeClient.fetch(query);
    
    return NextResponse.json({
      success: true,
      data: challans
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/outward-challan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// POST - Create new outward challan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      autoChallanNumber,
      date,
      time,
      workOrderNumber,
      paintColor,
      items,
      totalPieces,
      totalAmount,
      summary
    } = body;

    console.log('Received data:', {
      autoChallanNumber,
      totalPieces,
      totalAmount,
      items: items?.map((item: ChallanItem) => ({
        qty: item.qty,
        ratePerSqft: item.ratePerSqft,
        amount: item.amount
      }))
    });

    // Validate required fields
    if (!autoChallanNumber || !date || !time || !workOrderNumber || !paintColor) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one item is required'
      }, { status: 400 });
    }

    // Calculate total remaining pieces
    const totalRemainingPieces = items.reduce((total: number, item: ChallanItem) => {
      return total + (item.qty || 0);
    }, 0);

    // Prepare the document for Sanity
    const document: ChallanDocument = {
      _type: 'outwardChallan',
      autoChallanNumber,
      date,
      time,
      workOrderNumber,
      paintColor,
      items: items.map((item: ChallanItem) => ({
        _type: 'object',
        serialNumber: item.serialNumber || 0,
        description: item.description || '',
        width: item.width || 0,
        length: item.length || 0,
        qty: item.qty || 1,
        sqft: item.sqft || 0,
        ratePerSqft: item.ratePerSqft || 0,
        rate: item.rate || 0,
        amount: item.amount || 0,
        receivedQty: 0, // Initialize received quantity
        remainingQty: item.qty || 1 // Initialize remaining quantity as total quantity
      })),
      totalPieces: totalPieces || 0,
      totalReceivedPieces: 0, // Initialize total received pieces
      totalRemainingPieces: totalRemainingPieces,
      totalAmount: totalAmount || 0,
      _createdAt: new Date().toISOString()
    };

    // Add summary if provided
    if (summary) {
      document.summary = summary;
    }

    console.log('Creating document:', document);

    // Create the document in Sanity
    const result = await writeClient.create(document);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Outward challan created successfully'
    });

  } catch (error: unknown) {
    console.error('Error creating outward challan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// PUT - Update outward challan with received quantities
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      outwardChallanId,
      receivedItems,
      totalReceivedPieces, // ADDED
      totalRemainingPieces // ADDED
    } = body;

    console.log('Updating outward challan:', {
      outwardChallanId,
      receivedItems,
      totalReceivedPieces,
      totalRemainingPieces
    });

    if (!outwardChallanId || !receivedItems) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: outwardChallanId and receivedItems are required'
      }, { status: 400 });
    }

    // Get current outward challan
    const currentChallan = await writeClient.fetch(`*[_type == "outwardChallan" && _id == $id][0]{
      _id,
      autoChallanNumber,
      items,
      totalReceivedPieces,
      totalRemainingPieces
    }`, { id: outwardChallanId });
    
    if (!currentChallan) {
      return NextResponse.json({
        success: false,
        error: 'Outward challan not found'
      }, { status: 404 });
    }

    // Update items with received quantities
    const updatedItems = currentChallan.items.map((item: ChallanItem) => {
      const receivedItem = receivedItems.find((ri: ReceivedItem) => ri.serialNumber === item.serialNumber);
      if (receivedItem) {
        const newReceivedQty = (item.receivedQty || 0) + receivedItem.receivedQty;
        const newRemainingQty = Math.max(0, (item.remainingQty || item.qty) - receivedItem.receivedQty);
        
        return {
          ...item,
          receivedQty: newReceivedQty,
          remainingQty: newRemainingQty
        };
      }
      return item;
    });

    // Calculate total received pieces and total remaining pieces
    const calculatedTotalReceivedPieces = updatedItems.reduce((total: number, item: ChallanItem) => 
      total + (item.receivedQty || 0), 0
    );

    const calculatedTotalRemainingPieces = updatedItems.reduce((total: number, item: ChallanItem) => 
      total + (item.remainingQty || 0), 0
    );

    console.log('Updating with:', {
      updatedItems,
      calculatedTotalReceivedPieces,
      calculatedTotalRemainingPieces,
      providedTotalReceivedPieces: totalReceivedPieces,
      providedTotalRemainingPieces: totalRemainingPieces
    });

    // Update the outward challan - include totalReceivedPieces in the update
    const result = await writeClient
      .patch(outwardChallanId)
      .set({ 
        items: updatedItems,
        totalReceivedPieces: totalReceivedPieces || calculatedTotalReceivedPieces, // Use provided or calculated
        totalRemainingPieces: totalRemainingPieces || calculatedTotalRemainingPieces, // Use provided or calculated
        lastUpdated: new Date().toISOString()
      })
      .commit();

    return NextResponse.json({
      success: true,
      data: result,
      totalReceivedPieces: totalReceivedPieces || calculatedTotalReceivedPieces,
      totalRemainingPieces: totalRemainingPieces || calculatedTotalRemainingPieces,
      message: 'Outward challan updated with received quantities'
    });

  } catch (error: unknown) {
    console.error('Error updating outward challan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// DELETE - Delete outward challan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Challan ID is required'
      }, { status: 400 });
    }

    // Check if challan exists
    const existingChallan = await writeClient.fetch(`*[_type == "outwardChallan" && _id == $id][0]{
      _id,
      autoChallanNumber
    }`, { id });

    if (!existingChallan) {
      return NextResponse.json({
        success: false,
        error: 'Outward challan not found'
      }, { status: 404 });
    }

    // Delete the challan
    await writeClient.delete(id);

    return NextResponse.json({
      success: true,
      message: `Outward challan ${existingChallan.autoChallanNumber} deleted successfully`
    });

  } catch (error: unknown) {
    console.error('Error deleting outward challan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}