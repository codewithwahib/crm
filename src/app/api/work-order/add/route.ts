import { NextResponse } from "next/server"
import { writeClient } from "@/sanity/lib/client"

// Types for Sanity file references
interface SanityFileReference {
  _type: "file"
  asset: {
    _type: "reference"
    _ref: string
  }
}

// Helper to upload file to Sanity
async function uploadFileToSanity(file: File): Promise<SanityFileReference> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const asset = await writeClient.assets.upload("file", buffer, {
    filename: file.name,
  })
  return {
    _type: "file",
    asset: { _type: "reference", _ref: asset._id },
  }
}

interface RequiredDocuments {
  [key: string]: File | SanityFileReference | null
}

interface SalesOrderSection {
  requiredDocuments: RequiredDocuments
}

interface WorkOrderData {
  salesOrderSection: SalesOrderSection
  [key: string]: unknown // For other properties
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    // 1. Parse JSON data
    const jsonData = formData.get("jsonData") as string
    if (!jsonData) {
      return NextResponse.json({ error: "Missing work order data" }, { status: 400 })
    }
    const parsedData: WorkOrderData = JSON.parse(jsonData)

    // 2. Upload all files (if present)
    const requiredDocs = parsedData.salesOrderSection.requiredDocuments
    for (const key of Object.keys(requiredDocs)) {
      const file = formData.get(`salesOrderSection.requiredDocuments.${key}`) as File | null
      if (file && file.size > 0) {
        const uploadedFile = await uploadFileToSanity(file)
        requiredDocs[key] = uploadedFile
      } else {
        requiredDocs[key] = null
      }
    }

    // 3. Create the document in Sanity
    const newWorkOrder = await writeClient.create({
      _type: "workOrderSalesOrder",
      ...parsedData,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "✅ Work order created successfully!",
      data: newWorkOrder,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ Error creating work order:", error)
    return NextResponse.json(
      { error: "Failed to create work order", details: errorMessage },
      { status: 500 }
    )
  }
}