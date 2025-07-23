import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/sanity.client'
import { createReadStream } from 'node:fs'
import { createClient } from '@sanity/client'
import { tmpdir } from 'os'
import { writeFile } from 'fs/promises'
import path from 'path'

// Sanity client for asset uploads
const sanityUploadClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_WRITE_TOKEN!,
  useCdn: false,
  apiVersion: '2025-07-01',
})

export async function POST(req: Request) {
  try {
    console.log("📥 Incoming request")

    const formData = await req.formData()
    console.log("✅ FormData parsed")

    const title = formData.get("title")?.toString()
    const documentType = formData.get("documentType")?.toString()
    const file = formData.get("file") as File | null

    if (!title || !documentType || !file) {
      console.error("❌ Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("✅ File received:", file.name, file.size)

    const buffer = Buffer.from(await file.arrayBuffer())
    console.log("✅ File buffer created, size:", buffer.length)

    // Upload to sanity
    const asset = await sanityUploadClient.assets.upload(
      "file",
      buffer, // ✅ Directly upload buffer (no tmp file)
      { filename: file.name }
    )
    console.log("✅ Sanity asset uploaded:", asset._id)

    // Create doc
    const newDoc = {
      _type: "documentFile",
      title,
      documentType,
      uploadedDate: new Date().toISOString(),
      uploadedBy: formData.get("uploadedBy")?.toString() || "Admin",
      relatedCustomer: formData.get("relatedCustomer")?.toString(),
      relatedProject: formData.get("relatedProject")?.toString(),
      notes: formData.get("notes")?.toString(),
      uploadedFile: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
    }

    const created = await writeClient.create(newDoc)
    console.log("✅ Document created:", created._id)

    return NextResponse.json({ success: true, document: created })
  } catch (error: any) {
    console.error("❌ Upload API Error:", error.message, error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
