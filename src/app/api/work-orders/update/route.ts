import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'

interface WorkOrderSection {
  workOrderNumber?: string
  clientName?: string
  jobReference?: string
  clientPONumber?: string
  date?: string
  deliveryDate?: string
  products?: unknown[]
}

interface RequestData {
  _id: string
  workOrderSection?: WorkOrderSection
}

export async function POST(req: Request) {
  try {
    const data: RequestData = await req.json()

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
  } catch (err: unknown) {
    console.error('Failed to update work order:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to update'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}