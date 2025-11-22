import { defineType, defineField } from "sanity";

export const inwardChallan = defineType({
  name: "inwardChallan",
  title: "Inward Challan",
  type: "document",
  fields: [
    // 🔹 Auto Challan Number
    defineField({
      name: "autoChallanNumber",
      title: "Auto Challan Number",
      type: "string",
      description: "Auto-generated inward challan number (e.g., IC-2024-001)",
      validation: (Rule) => Rule.required(),
    }),

    // 🔹 Outward Challan Reference
    defineField({
      name: "outwardChallanNumber",
      title: "Outward Challan Number",
      type: "string",
      description: "Reference to the outward challan number (e.g., OC-2024-001)",
      validation: (Rule) => Rule.required(),
    }),

    // 🔹 Inward Details
    defineField({
      name: "date",
      title: "Inward Date",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "time",
      title: "Inward Time",
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

    // 🔹 Inward Items
    defineField({
      name: "items",
      title: "Inward Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "item",
          title: "Inward Item",
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
              validation: (Rule) => Rule.required(),
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
              title: "Product Quantity",
              type: "number",
              initialValue: 1,
              validation: (Rule) => Rule.min(1),
              description: "Product quantity for calculation purposes (DO NOT EDIT)",
            }),
            defineField({
              name: "receivedQty",
              title: "Received Pieces",
              type: "number",
              initialValue: 0,
              description: "Number of physical pieces received back",
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: "remainingQty",
              title: "Remaining Pieces",
              type: "number",
              initialValue: 0,
              description: "Physical pieces not yet received back",
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
              description: "Calculated amount (Rate × Received Qty)",
            }),
          ],
        },
      ],
    }),

    // 🔹 Total Pieces as summary field
    defineField({
      name: "totalPieces",
      title: "Total Pieces",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description: "Total number of physical pieces in this inward challan",
    }),

    // ✅ Total Received Pieces
    defineField({
      name: "totalReceivedPieces",
      title: "Total Received Pieces",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description: "Total number of received physical pieces",
    }),

    // ✅ Total Remaining Pieces
    defineField({
      name: "totalRemainingPieces",
      title: "Total Remaining Pieces",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description: "Total number of remaining physical pieces",
    }),

    // 🔹 Total Amount for the entire challan
    defineField({
      name: "totalAmount",
      title: "Total Amount (Rs)",
      type: "number",
      initialValue: 0,
      description: "Grand total amount for all received items in this challan",
    }),

    // 🔹 Summary for whole challan
    defineField({
      name: "summary",
      title: "Challan Summary / Remarks",
      type: "text",
      rows: 4,
      description: "General summary or remarks for this inward challan",
    }),
  ],

  // 🔹 Preview Configuration
  preview: {
    select: {
      title: "autoChallanNumber",
      workOrder: "workOrderNumber",
      outwardChallan: "outwardChallanNumber",
      date: "date",
      paintColor: "paintColor",
      totalPieces: "totalPieces",
      totalReceived: "totalReceivedPieces",
      totalRemaining: "totalRemainingPieces",
      totalAmount: "totalAmount",
    },
    prepare({ title, workOrder, outwardChallan, date, paintColor, totalPieces, totalReceived, totalRemaining, totalAmount }) {
      return {
        title: `IC - ${title || "No CN"}`,
        subtitle: `WO: ${workOrder || "No WO"} | Outward: ${outwardChallan || "No OC"} | Date: ${
          date || "No date"
        } | ${paintColor || "No color"} | Total: ${totalPieces || 0} | Received: ${totalReceived || 0} | Remaining: ${totalRemaining || 0} | Amount: ₹${totalAmount || 0}`,
      };
    },
  },
});