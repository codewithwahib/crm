// import { defineType, defineField } from "sanity";

// export const outwardChallan = defineType({
//   name: "outwardChallan",
//   title: "Outward Challan",
//   type: "document",
//   fields: [
//     // 🔹 Auto Challan Number (Only this will be saved as main item)
//     defineField({
//       name: "autoChallanNumber",
//       title: "Auto Challan Number",
//       type: "string",
//       description: "Auto-generated outward challan number (e.g., OC-2024-001)",
//       validation: (Rule) => Rule.required(),
//     }),

//     // 🔹 Inward Section
//     defineField({
//       name: "inwardSection",
//       title: "Inward Section Details",
//       type: "object",
//       fields: [
//         defineField({
//           name: "date",
//           title: "Inward Date",
//           type: "date",
//           options: { dateFormat: "YYYY-MM-DD" },
//           validation: (Rule) => Rule.required(),
//         }),
//         defineField({
//           name: "time",
//           title: "Inward Time",
//           type: "string",
//           description: "Enter time in HH:MM format (e.g., 14:30)",
//           validation: (Rule) => Rule.required(),
//         }),
//         defineField({
//           name: "workOrderNumber",
//           title: "Work Order Number",
//           type: "string",
//           validation: (Rule) => Rule.required(),
//         }),
//         defineField({
//           name: "paintColor",
//           title: "Paint Color Number",
//           type: "string",
//           initialValue: "RAL 7035",
//           validation: (Rule) => Rule.required(),
//         }),
//         defineField({
//           name: "inwardItems",
//           title: "Inward Items",
//           type: "array",
//           of: [
//             {
//               type: "object",
//               name: "inwardItem",
//               title: "Inward Item",
//               fields: [
//                 defineField({ name: "serialNumber", title: "S.No", type: "number", validation: (Rule) => Rule.min(1) }),
//                 defineField({ name: "description", title: "Description", type: "string" }),
//                 defineField({ name: "width", title: "Width (inches)", type: "number", initialValue: 0 }),
//                 defineField({ name: "length", title: "Length (inches)", type: "number", initialValue: 0 }),
//                 defineField({ name: "sqft", title: "SQFT", type: "number", initialValue: 0 }),
//                 defineField({ name: "rate", title: "Rate (Rs)", type: "number", initialValue: 0 }),
//                 defineField({ name: "amount", title: "Amount (Rs)", type: "number", initialValue: 0 }),
//                 defineField({ 
//                   name: "totalPieces", 
//                   title: "Total Pieces", 
//                   type: "number", 
//                   initialValue: 0,
//                   validation: (Rule) => Rule.min(0) 
//                 }),
//                 defineField({ name: "summary", title: "Summary / Remarks", type: "text", rows: 3 }),
//               ],
//             },
//           ],
//         }),
//       ],
//     }),

//     // 🔹 Outward Section
//     defineField({
//       name: "outwardSection",
//       title: "Outward Section Details",
//       type: "object",
//       fields: [
//         defineField({
//           name: "date",
//           title: "Outward Date",
//           type: "date",
//           options: { dateFormat: "YYYY-MM-DD" },
//           validation: (Rule) => Rule.required(),
//         }),
//         defineField({
//           name: "time",
//           title: "Outward Time",
//           type: "string",
//           description: "Enter time in HH:MM format (e.g., 14:30)",
//           validation: (Rule) => Rule.required(),
//         }),
//         defineField({
//           name: "workOrderNumber",
//           title: "Work Order Number",
//           type: "string",
//           validation: (Rule) => Rule.required(),
//         }),
//         defineField({
//           name: "paintColor",
//           title: "Paint Color Number",
//           type: "string",
//           initialValue: "RAL 7035",
//           validation: (Rule) => Rule.required(),
//         }),
//         defineField({
//           name: "outwardItems",
//           title: "Outward Items",
//           type: "array",
//           of: [
//             {
//               type: "object",
//               name: "outwardItem",
//               title: "Outward Item",
//               fields: [
//                 defineField({ name: "serialNumber", title: "S.No", type: "number", validation: (Rule) => Rule.min(1) }),
//                 defineField({ name: "description", title: "Description", type: "string" }),
//                 defineField({ name: "width", title: "Width (inches)", type: "number", initialValue: 0 }),
//                 defineField({ name: "length", title: "Length (inches)", type: "number", initialValue: 0 }),
//                 defineField({ name: "sqft", title: "SQFT", type: "number", initialValue: 0 }),
//                 defineField({ name: "rate", title: "Rate (Rs)", type: "number", initialValue: 0 }),
//                 defineField({ name: "amount", title: "Amount (Rs)", type: "number", initialValue: 0 }),
//                 defineField({ 
//                   name: "totalPieces", 
//                   title: "Total Pieces", 
//                   type: "number", 
//                   initialValue: 0,
//                   validation: (Rule) => Rule.min(0) 
//                 }),
//                 defineField({ name: "summary", title: "Summary / Remarks", type: "text", rows: 3 }),
//               ],
//             },
//           ],
//         }),
//       ],
//     }),
//   ],

//   // 🔹 Preview Configuration
//   preview: {
//     select: {
//       title: "autoChallanNumber",
//       inwardWorkOrder: "inwardSection.workOrderNumber",
//       outwardWorkOrder: "outwardSection.workOrderNumber",
//       inwardDate: "inwardSection.date",
//       outwardDate: "outwardSection.date",
//       paintColor: "inwardSection.paintColor",
//     },
//     prepare({ title, inwardWorkOrder, outwardWorkOrder, inwardDate, outwardDate, paintColor }) {
//       return {
//         title: `OC - ${title || "No CN"}`,
//         subtitle: `In: ${inwardWorkOrder || "No WO"} (${inwardDate || "No date"}) | Out: ${outwardWorkOrder || "No WO"} (${outwardDate || "No date"}) | ${paintColor || "No color"}`,
//       };
//     },
//   },
// });