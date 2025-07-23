import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data._id) {
      return NextResponse.json({ error: 'Missing work order ID' }, { status: 400 })
    }

    const patchData = {
      workOrderSection: {
        workOrderNumber: data.workOrderSection?.workOrderNumber || '',
        clientName: data.workOrderSection?.clientName || '',
        jobReference: data.workOrderSection?.jobReference || '',
        clientPONumber: data.workOrderSection?.clientPONumber || '',
        date: data.workOrderSection?.date || '',
        deliveryDate: data.workOrderSection?.deliveryDate || '',
        products: data.workOrderSection?.products || [],
      },
    }

    await writeClient.patch(data._id).set(patchData).commit()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Failed to update work order:', err)
    return NextResponse.json({ error: err.message || 'Failed to update' }, { status: 500 })
  }
}
