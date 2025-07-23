// import { NextResponse } from "next/server";
// import { writeClient } from "@/sanity/lib/sanity.client";

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
    
//     // List of file fields we expect
//     const fileFields = [
//       'quotationWithFinalPrice',
//       'approvedShopDrawing',
//       'componentList',
//       'customerPOCopy',
//       'technicalSpecifications'
//     ];

//     // Handle file uploads
//     const fileUploads: Record<string, any> = {};
    
//     for (const field of fileFields) {
//       const file = formData.get(`salesOrderSection.requiredDocuments.${field}`) as File;
//       if (file && file.size > 0) {
//         const uploadedFile = await writeClient.assets.upload('file', file, {
//           filename: file.name,
//           contentType: file.type
//         });
//         fileUploads[field] = {
//           _type: 'file',
//           asset: {
//             _type: 'reference',
//             _ref: uploadedFile._id
//           }
//         };
//       }
//     }

//     // Get the JSON data
//     const jsonData = JSON.parse(formData.get('jsonData') as string);

//     // Validate required fields
//     if (!jsonData?.workOrderSection?.workOrderNumber) {
//       return NextResponse.json({ error: "Missing Work Order Number" }, { status: 400 });
//     }

//     // Merge file references into the data
//     const finalData = {
//       ...jsonData,
//       salesOrderSection: {
//         ...jsonData.salesOrderSection,
//         requiredDocuments: {
//           ...jsonData.salesOrderSection.requiredDocuments,
//           ...fileUploads
//         }
//       }
//     };

//     // Create document in Sanity
//     const result = await writeClient.create({
//       _type: "workOrderSalesOrder",
//       ...finalData,
//     });

//     return NextResponse.json({ message: "Work Order Created", result }, { status: 201 });
//   } catch (err: any) {
//     console.error("❌ Sanity Save Error:", err);
//     return NextResponse.json(
//       { error: err.message || "Failed to save work order" }, 
//       { status: 500 }
//     );
//   }
// }