import { NextResponse } from 'next/server'
import { client, writeClient } from '@/sanity/lib/sanity.client'

// ✅ Fetch single work order by ID
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing work order ID' }, { status: 400 })
  }

  try {
    const data = await client.fetch(
      `*[_type == "workOrderSalesOrder" && _id == $id][0]{
        _id,
        workOrderSection->{
          workOrderNumber,
          clientName,
          projectName,
          poNumber,
          poValue,
          startDate,
          endDate,
          status,
          notes
        }
      }`,
      { id }
    )

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // ✅ Flatten the nested structure
    return NextResponse.json({
      _id: data._id,
      ...data.workOrderSection
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch work order' }, { status: 500 })
  }
}

// ✅ Update work order
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing work order ID' }, { status: 400 })
    }

    const patchData = {
      workOrderSection: {
        workOrderNumber: fields.workOrderNumber,
        clientName: fields.clientName,
        projectName: fields.projectName,
        poNumber: fields.poNumber,
        poValue: Number(fields.poValue || 0),
        startDate: fields.startDate,
        endDate: fields.endDate,
        status: fields.status,
        notes: fields.notes
      }
    }

    await writeClient.patch(id).set(patchData).commit()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Update error:', err)
    return NextResponse.json({ error: err.message || 'Failed to update work order' }, { status: 500 })
  }
}
