import { NextResponse } from "next/server"
import { writeClient } from "@/sanity/lib/sanity.client"
import { parseFormData } from "@/utils/parseFormData"

interface WorkOrderSection {
  [key: string]: unknown
}

interface SalesOrderSection {
  [key: string]: unknown
}

interface PurchaseOrderSection {
  [key: string]: unknown
}

interface WorkOrderDocument {
  _id: string
  workOrderSection: WorkOrderSection
  salesOrderSection: SalesOrderSection
  purchaseOrderSection: PurchaseOrderSection
}

const WORK_ORDER_QUERY = `
  *[_type == "workOrderSalesOrder" && _id == $id][0]{
    _id,
    workOrderSection,
    salesOrderSection,
    purchaseOrderSection
  }
`

// ✅ FIXED: context.params is now a Promise in Next.js 15
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: workOrderId } = await context.params

    if (!workOrderId) {
      return NextResponse.json(
        { error: "Missing work order ID" },
        { status: 400 }
      )
    }

    const workOrder = await writeClient.fetch<WorkOrderDocument | null>(
      WORK_ORDER_QUERY,
      { id: workOrderId }
    )

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(workOrder)
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch work order"
    console.error("Error fetching work order:", errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: workOrderId } = await context.params
    const { jsonData, files } = await parseFormData(request)

    if (!jsonData) {
      return NextResponse.json(
        { error: "Missing JSON data" },
        { status: 400 }
      )
    }

    const parsedData = JSON.parse(jsonData) as {
      workOrderSection: WorkOrderSection
      salesOrderSection: SalesOrderSection
      purchaseOrderSection: PurchaseOrderSection
    }

    if (files.length > 0) {
      console.log("Received files:", files.map(f => f.filename))
      // TODO: handle file uploads if needed
    }

    await writeClient
      .patch(workOrderId)
      .set({
        workOrderSection: parsedData.workOrderSection,
        salesOrderSection: parsedData.salesOrderSection,
        purchaseOrderSection: parsedData.purchaseOrderSection,
      })
      .commit()

    return NextResponse.json({
      success: true,
      message: "Work order updated successfully",
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update work order"
    console.error("Error updating work order:", errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
