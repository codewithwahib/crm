import { NextResponse } from "next/server"
import { writeClient } from "@/sanity/lib/sanity.client"
import { parseFormData } from "@/utils/parseFormData" // Only import what's needed

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

// GROQ fetch query
const WORK_ORDER_QUERY = `
  *[_type == "workOrderSalesOrder" && _id == $id][0]{
    _id,
    workOrderSection,
    salesOrderSection,
    purchaseOrderSection
  }
`

// GET: Fetch existing work order by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id

    if (!workOrderId) {
      return NextResponse.json({ error: "Missing work order ID" }, { status: 400 })
    }

    const workOrder = await writeClient.fetch<WorkOrderDocument | null>(WORK_ORDER_QUERY, { id: workOrderId })

    if (!workOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }

    return NextResponse.json(workOrder)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch work order"
    console.error("Error fetching work order:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PUT: Update existing work order
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id

    // Parse incoming FormData (JSON + files)
    const { jsonData, files } = await parseFormData(req)

    if (!jsonData) {
      return NextResponse.json({ error: "Missing JSON data" }, { status: 400 })
    }

    const parsedData: {
      workOrderSection: WorkOrderSection,
      salesOrderSection: SalesOrderSection,
      purchaseOrderSection: PurchaseOrderSection
    } = JSON.parse(jsonData)

    // Handle file uploads if needed
    if (files.length > 0) {
      console.log("Received files:", files.map(f => f.filename))
      // Add your file handling logic here
    }

    // Update Sanity document
    await writeClient
      .patch(workOrderId)
      .set({
        workOrderSection: parsedData.workOrderSection,
        salesOrderSection: parsedData.salesOrderSection,
        purchaseOrderSection: parsedData.purchaseOrderSection,
      })
      .commit()

    return NextResponse.json({ success: true, message: "Work order updated successfully" })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update work order"
    console.error("Error updating work order:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}