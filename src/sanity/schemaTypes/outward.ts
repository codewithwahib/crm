import { defineType, defineField } from "sanity";

export const outwardChallan = defineType({
  name: "outwardChallan",
  title: "Outward Challan",
  type: "document",
  fields: [
    // 🔹 Auto Challan Number
    defineField({
      name: "autoChallanNumber",
      title: "Auto Challan Number",
      type: "string",
      description: "Auto-generated outward challan number (e.g., OC-2024-001)",
      validation: (Rule) => Rule.required(),
    }),

    // 🔹 Outward Details
    defineField({
      name: "date",
      title: "Outward Date",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "time",
      title: "Outward Time",
      type: "string",
      description: "Enter time in HH:MM format (e.g., 14:30)",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "workOrderNumber",
      title: "Work Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "paintColor",
      title: "Paint Color Number",
      type: "string",
      initialValue: "RAL 7035",
      validation: (Rule) => Rule.required(),
    }),

    // 🔹 Outward Items (with remaining and received quantity fields)
    defineField({
      name: "items",
      title: "Outward Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "item",
          title: "Outward Item",
          fields: [
            defineField({
              name: "serialNumber",
              title: "S.No",
              type: "number",
              validation: (Rule) => Rule.min(1),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "string",
            }),
            defineField({
              name: "width",
              title: "Width (mm)",
              type: "number",
              initialValue: 0,
              description: "Width in millimeters",
            }),
            defineField({
              name: "length",
              title: "Length (mm)",
              type: "number",
              initialValue: 0,
              description: "Length in millimeters",
            }),
            defineField({
              name: "qty",
              title: "Quantity",
              type: "number",
              initialValue: 1,
              validation: (Rule) => Rule.min(1),
              description: "Number of pieces sent outward",
            }),
            // ✅ Received Qty field
            defineField({
              name: "receivedQty",
              title: "Received Qty",
              type: "number",
              initialValue: 0,
              description: "Number of pieces received back",
              validation: (Rule) => Rule.min(0),
            }),
            // ✅ Remaining Qty field
            defineField({
              name: "remainingQty",
              title: "Remaining Qty",
              type: "number",
              initialValue: 0,
              description: "Pieces not yet received back / still remaining",
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: "sqft",
              title: "SQFT",
              type: "number",
              initialValue: 0,
              description: "Total square feet (calculated from dimensions)",
            }),
            defineField({
              name: "ratePerSqft",
              title: "Rate Per SQFT (Rs)",
              type: "number",
              initialValue: 0,
              description: "Rate per square foot in rupees",
            }),
            defineField({
              name: "rate",
              title: "Rate (Rs)",
              type: "number",
              initialValue: 0,
              description: "Total rate for the item",
            }),
            defineField({
              name: "amount",
              title: "Amount (Rs)",
              type: "number",
              initialValue: 0,
              description: "Calculated amount (SQFT × Rate Per SQFT × Qty)",
            }),
          ],
        },
      ],
    }),

    // 🔹 Totals
    defineField({
      name: "totalPieces",
      title: "Total Pieces",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description: "Total number of pieces in this outward challan",
    }),

    // ✅ Total Received Pieces
    defineField({
      name: "totalReceivedPieces",
      title: "Total Received Pieces",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description: "Total number of received pieces (sum of all receivedQty)",
    }),

    // ✅ Total Remaining Pieces
    defineField({
      name: "totalRemainingPieces",
      title: "Total Remaining Pieces",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description: "Total number of remaining pieces (sum of all remainingQty)",
    }),

    // 🔹 Total Amount for the entire challan
    defineField({
      name: "totalAmount",
      title: "Total Amount (Rs)",
      type: "number",
      initialValue: 0,
      description: "Grand total amount for all items in this challan",
    }),

    // 🔹 Summary for whole challan
    defineField({
      name: "summary",
      title: "Challan Summary / Remarks",
      type: "text",
      rows: 4,
      description: "General summary or remarks for this outward challan",
    }),
  ],

  // 🔹 Preview Configuration
  preview: {
    select: {
      title: "autoChallanNumber",
      workOrder: "workOrderNumber",
      date: "date",
      paintColor: "paintColor",
      totalPieces: "totalPieces",
      totalReceived: "totalReceivedPieces",
      totalRemaining: "totalRemainingPieces",
      totalAmount: "totalAmount",
      relatedInward: "relatedInwardChallan.autoChallanNumber",
    },
    prepare({
      title,
      workOrder,
      date,
      paintColor,
      totalPieces,
      totalReceived,
      totalRemaining,
      totalAmount,
      relatedInward,
    }) {
      return {
        title: `OC - ${title || "No CN"}`,
        subtitle: `WO: ${workOrder || "No WO"} | Date: ${
          date || "No date"
        } | ${paintColor || "No color"} | Sent: ${totalPieces || 0} | Received: ${
          totalReceived || 0
        } | Remaining: ${totalRemaining || 0} | Amount: ₹${totalAmount || 0}${
          relatedInward ? ` | From: ${relatedInward}` : ""
        }`,
      };
    },
  },
});