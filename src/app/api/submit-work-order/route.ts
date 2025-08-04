// /app/api/submit-work-order/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      workOrderNumber,
      clientName,
      jobReference,
      poNumber,
      deliveryDate,
      status,
      items,
    } = body

    if (!workOrderNumber || !clientName || !status || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newWorkOrder = {
      _type: 'workOrderStatus', // This should match your Sanity schema type
      workOrderNumber,
      clientName,
      jobReference,
      poNumber,
      deliveryDate,
      status,
      items,
    }

    const created = await client.create(newWorkOrder)

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('API error submitting work order:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
