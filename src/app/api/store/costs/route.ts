// app/api/store/costs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client, writeClient, canWrite } from '@/sanity/lib/client'

export async function POST(req: NextRequest) {
  try {
    if (!canWrite()) {
      return NextResponse.json({ error: 'Write token not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { paintPrice, sheetPrices, effectiveDate } = body

    if (paintPrice === undefined) {
      return NextResponse.json({ error: 'Missing paint price' }, { status: 400 })
    }

    let existingCostDoc = null
    try {
      existingCostDoc = await client.fetch(`*[_type == "cost"][0] { _id }`)
    } catch (fetchError) {
      console.error('Error checking existing cost document:', fetchError)
    }

    let result

    const costData = {
      paintSection: {
        todayPaintCost: Number(paintPrice),
        paintEffectiveDate: effectiveDate || new Date().toISOString()
      },
      sheetSection: {
        sheetPrices: sheetPrices || [],
        sheetEffectiveDate: effectiveDate || new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }

    if (existingCostDoc) {
      result = await writeClient
        .patch(existingCostDoc._id)
        .set(costData)
        .commit()
    } else {
      result = await writeClient.create({
        _type: 'cost',
        ...costData,
        createdAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      message: existingCostDoc ? 'Costs updated successfully' : 'Costs created successfully',
      data: result
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating costs:', error)
    return NextResponse.json({ error: 'Failed to update costs' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const costData = await client.fetch(`
      *[_type == "cost"][0] {
        _id,
        paintSection {
          todayPaintCost,
          paintEffectiveDate
        },
        sheetSection {
          sheetPrices[] {
            material,
            gauge,
            pricePerSheet
          },
          sheetEffectiveDate
        }
      }
    `)

    if (!costData) {
      return NextResponse.json({
        paintPrice: 0,
        sheetPrices: [],
        message: 'No cost data found'
      }, { status: 200 })
    }

    return NextResponse.json({
      paintPrice: costData.paintSection?.todayPaintCost || 0,
      paintEffectiveDate: costData.paintSection?.paintEffectiveDate,
      sheetPrices: costData.sheetSection?.sheetPrices || [],
      sheetEffectiveDate: costData.sheetSection?.sheetEffectiveDate,
      _id: costData._id
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching costs:', error)
    return NextResponse.json({ error: 'Failed to fetch costs' }, { status: 500 })
  }
}