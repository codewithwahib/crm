import { writeClient } from "@/sanity/lib/sanity.client"

export async function uploadFileToSanity(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())

  const asset = await writeClient.assets.upload("file", buffer, {
    filename: file.name,
    contentType: file.type,
  })

  return asset._id // ✅ Return the uploaded file asset ID
}
