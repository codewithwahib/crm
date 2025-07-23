// import { NextResponse } from "next/server";
// import { client } from "@/sanity/lib/client"; // ✅ Your sanity read client
// import { writeClient } from "@/sanity/lib/sanity.client"; // ✅ If you use a write client
// import { parseFormData } from "@/utils/parseFormData";

// // ----------------------
// // ✅ GET /api/work-order/[id]
// // ----------------------
// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id;

//   if (!id) {
//     return NextResponse.json({ error: "Missing work order ID" }, { status: 400 });
//   }

//   try {
//     const query = `*[_type == "workOrderSalesOrder" && _id == $id][0]{
//       _id,
//       workOrderSection,
//       salesOrderSection,
//       purchaseOrderSection
//     }`;

//     const workOrder = await client.fetch(query, { id });

//     if (!workOrder) {
//       return NextResponse.json({ error: "Work order not found" }, { status: 404 });
//     }

//     return NextResponse.json(workOrder);
//   } catch (error: any) {
//     console.error("GET work order error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // ----------------------
// // ✅ PUT /api/work-order/[id]
// // ----------------------
// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id;

//   if (!id) {
//     return NextResponse.json({ error: "Missing work order ID" }, { status: 400 });
//   }

//   try {
//     const { jsonData, files } = await parseFormData(req);

//     if (!jsonData) {
//       return NextResponse.json({ error: "Missing jsonData" }, { status: 400 });
//     }

//     const parsedData = JSON.parse(jsonData);

//     // ✅ Upload files somewhere if needed
//     for (const file of files) {
//       console.log("Received file:", file.filename, file.mimetype, file.buffer.length);
//       // Example: Upload to Sanity asset
//       /*
//       const sanityAsset = await writeClient.assets.upload('file', file.buffer, {
//         filename: file.filename,
//         contentType: file.mimetype,
//       });
//       console.log("Sanity file uploaded:", sanityAsset);
//       */
//     }

//     // ✅ Update Sanity document
//     await writeClient
//       .patch(id)
//       .set(parsedData) // set fields like workOrderSection, salesOrderSection
//       .commit();

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error("PUT work order error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
