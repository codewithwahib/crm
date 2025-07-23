// import { NextResponse } from "next/server"
// import { writeClient } from "@/sanity/lib/sanity.client"

// export async function POST(req: Request) {
//   try {
//     const form = await req.formData()
//     const id = form.get("id") as string
//     const jsonData = JSON.parse(form.get("jsonData") as string)

//     if (!id) return NextResponse.json({ error: "Missing work order ID" }, { status: 400 })

//     // ✅ Process uploaded files (if any)
//     const fileUploads: Record<string, string> = {}
//     for (const [key, value] of form.entries()) {
//       if (key.startsWith("salesOrderSection.requiredDocuments") && value instanceof File) {
//         // Upload file to storage
//         const buffer = await value.arrayBuffer()
//         const fileName = `${Date.now()}-${value.name}`
//         // 👉 Upload to S3, Cloudinary or Sanity assets
//         // const uploadedUrl = await uploadFileToStorage(buffer, fileName)

//         // For now just mock
//         const uploadedUrl = `/uploads/${fileName}`
//         fileUploads[key] = uploadedUrl
//       }
//     }

//     // ✅ Merge updated file URLs into jsonData
//     for (const [key, url] of Object.entries(fileUploads)) {
//       const docKey = key.split(".").pop()!
//       jsonData.salesOrderSection.requiredDocuments[docKey] = url
//     }

//     // ✅ Update in Sanity
//     await writeClient
//       .patch(id)
//       .set(jsonData)
//       .commit()

//     return NextResponse.json({ success: true })
//   } catch (err: any) {
//     console.error(err)
//     return NextResponse.json({ error: "Failed to update work order" }, { status: 500 })
//   }
// }
