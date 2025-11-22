import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/client';

// Define interface for item
interface InwardItem {
  serialNumber?: number;
  description?: string;
  width?: number;
  length?: number;
  qty?: number;
  availableQty?: number;
  receivedQty?: number;
  remainingQty?: number;
  sqft?: number;
  ratePerSqft?: number;
  rate?: number;
  amount?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'getNextNumber') {
      // Get the latest inward challan number
      const query = `*[_type == "inwardChallan"] | order(autoChallanNumber desc)[0] {
        autoChallanNumber
      }`;

      const latestChallan = await writeClient.fetch(query);

      let nextNumber = 1;
      if (latestChallan?.autoChallanNumber) {
        const match = latestChallan.autoChallanNumber.match(/IC-(\d+)-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[2]) + 1;
        }
      }

      const year = new Date().getFullYear();
      const nextChallanNumber = `IC-${year}-${nextNumber.toString().padStart(3, '0')}`;

      return NextResponse.json({
        success: true,
        nextChallanNumber
      });
    }

    // Get all inward challans
    const query = `*[_type == "inwardChallan"] | order(date desc, _createdAt desc) {
      _id,
      autoChallanNumber,
      outwardChallanNumber,
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
        availableQty,
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

    const inwardChallans = await writeClient.fetch(query);

    return NextResponse.json({
      success: true,
      data: inwardChallans
    });

  } catch (error) {
    console.error('Error in inward-challan API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      autoChallanNumber,
      outwardChallanNumber,
      date,
      time,
      workOrderNumber,
      paintColor,
      items,
      totalPieces,
      totalReceivedPieces,
      totalRemainingPieces,
      totalAmount,
      summary
    } = body;

    // Validate required fields
    if (!autoChallanNumber || !outwardChallanNumber || !date || !workOrderNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Create the inward challan document
    const inwardChallan = {
      _type: 'inwardChallan',
      autoChallanNumber,
      outwardChallanNumber,
      date,
      time: time || new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      workOrderNumber,
      paintColor: paintColor || 'RAL 7035',
      items: items.map((item: InwardItem) => ({
        _type: 'inwardItem',
        serialNumber: item.serialNumber || 0,
        description: item.description || '',
        width: item.width || 0,
        length: item.length || 0,
        qty: item.qty || 0,
        availableQty: item.availableQty || 0,
        receivedQty: item.receivedQty || 0,
        remainingQty: item.remainingQty || 0,
        sqft: item.sqft || 0,
        ratePerSqft: item.ratePerSqft || 0,
        rate: item.rate || 0,
        amount: item.amount || 0
      })),
      totalPieces: totalPieces || 0,
      totalReceivedPieces: totalReceivedPieces || 0,
      totalRemainingPieces: totalRemainingPieces || 0,
      totalAmount: totalAmount || 0,
      summary: summary || '',
      _createdAt: new Date().toISOString()
    };

    // Save to Sanity
    const result = await writeClient.create(inwardChallan);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Inward challan created successfully'
    });

  } catch (error) {
    console.error('Error creating inward challan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create inward challan' },
      { status: 500 }
    );
  }
}