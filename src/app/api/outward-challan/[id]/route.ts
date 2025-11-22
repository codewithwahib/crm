// app/api/outward-challan/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

const query = groq`
  *[_type == "outwardChallan" && _id == $id][0] {
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
  }
`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Challan ID is required' },
        { status: 400 }
      );
    }

    const challan = await client.fetch(query, { id });

    if (!challan) {
      return NextResponse.json(
        { success: false, error: 'Challan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: challan });
  } catch (error) {
    console.error('Error fetching outward challan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}