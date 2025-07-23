// // ✅ No external dependencies needed
// export async function parseFormData(req: Request) {
//   const formData = await req.formData();

//   let jsonData: string | null = null;
//   const files: {
//     field: string;
//     filename: string;
//     buffer: Buffer;
//     mimetype: string;
//   }[] = [];

//   for (const [field, value] of formData.entries()) {
//     // ✅ JSON payload
//     if (field === "jsonData" && typeof value === "string") {
//       jsonData = value;
//     }

//     // ✅ File uploads
//     else if (value instanceof File) {
//       const arrayBuffer = await value.arrayBuffer();
//       files.push({
//         field,
//         filename: value.name,
//         mimetype: value.type,
//         buffer: Buffer.from(arrayBuffer),
//       });
//     }
//   }

//   return { jsonData, files };
// }
