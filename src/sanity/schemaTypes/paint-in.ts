// // schemas/workOrder.ts
// import { defineField, defineType } from 'sanity'

// // Define interface for part object
// interface Part {
//   qty?: number;
//   [key: string]: unknown;
// }

// // Define interface for preview selection
// interface PreviewSelection {
//   title?: string;
//   subtitle?: string;
//   total?: number;
//   parts?: Part[];
// }

// export const paintinop = defineType({
//   name: 'paint-in-opr',
//   title: 'Paint Inward Opr',
//   type: 'document',

//   fields: [
//     defineField({
//       name: 'workOrderNo',
//       title: 'Work Order Number',
//       type: 'string',
//       validation: (Rule) => Rule.required(),
//     }),

//     defineField({
//       name: 'gatepassNo',
//       title: 'Gate Pass Number',
//       type: 'string',
//       validation: (Rule) => Rule.required(),
//     }),

//     defineField({
//       name: 'dateIssued',
//       title: 'Date Issued',
//       type: 'datetime',
//       validation: (Rule) => Rule.required(),
//     }),

//     defineField({
//       name: 'remarks',
//       title: 'Remarks',
//       type: 'text',
//       rows: 3,
//     }),

//     defineField({
//       name: 'parts',
//       title: 'Parts',
//       type: 'array',
//       of: [
//         {
//           type: 'object',
//           name: 'partItem',
//           title: 'Part Item',

//           fields: [
//             defineField({
//               name: 'partNo',
//               title: 'Part Number',
//               type: 'string',
//               validation: (Rule) => Rule.required(),
//             }),

//             defineField({
//               name: 'partName',
//               title: 'Part Name',
//               type: 'string',
//               validation: (Rule) => Rule.required(),
//             }),

//             defineField({
//               name: 'category',
//               title: 'Category',
//               type: 'string',
//               validation: (Rule) => Rule.required(),
//             }),

//             defineField({
//               name: 'storeLocation',
//               title: 'Store Location',
//               type: 'string',
//               validation: (Rule) => Rule.required(),
//             }),

//             // Blank Dimensions
//             defineField({
//               name: 'blankWidth',
//               title: 'Blank Width (inches)',
//               type: 'number',
//               validation: (Rule) => Rule.min(0),
//               description: 'Width of the blank in inches',
//             }),

//             defineField({
//               name: 'blankLength',
//               title: 'Blank Length (inches)',
//               type: 'number',
//               validation: (Rule) => Rule.min(0),
//               description: 'Length of the blank in inches',
//             }),

//             defineField({
//               name: 'blankSizeSqft',
//               title: 'Blank Size (sqft)',
//               type: 'number',
//               validation: (Rule) => Rule.required().positive(),
//               description: 'Area in square feet (calculated from width × length ÷ 144)',
//             }),

//             // Paint Cost per sqft
//             defineField({
//               name: 'paintCostPerSqft',
//               title: 'Paint Cost (per sqft)',
//               type: 'number',
//               description: 'Paint cost per square foot',
//               validation: (Rule) => Rule.required().min(0),
//             }),

//             // Paint Cost Per Piece (calculated: blankSizeSqft × paintCostPerSqft)
//             defineField({
//               name: 'paintCostPerPiece',
//               title: 'Paint Cost Per Piece',
//               type: 'number',
//               description: 'Paint cost per individual piece (blankSizeSqft × paintCostPerSqft)',
//               validation: (Rule) => Rule.required().min(0),
//               readOnly: true,
//             }),

//             defineField({
//               name: 'gauge',
//               title: 'Gauge',
//               type: 'string',
//               validation: (Rule) => Rule.required(),
//             }),

//             defineField({
//               name: 'material',
//               title: 'Material',
//               type: 'string',
//               validation: (Rule) => Rule.required(),
//             }),

//             defineField({
//               name: 'qty',
//               title: 'Quantity',
//               type: 'number',
//               description: 'Number of pieces',
//               validation: (Rule) => Rule.required().integer().positive(),
//             }),

//             // Received Quantity
//             defineField({
//               name: 'receivedQty',
//               title: 'Received Quantity',
//               type: 'number',
//               validation: (Rule) => Rule.integer().min(0),
//               initialValue: 0,
//             }),

//             // Remaining Quantity
//             defineField({
//               name: 'remainingQty',
//               title: 'Remaining Quantity',
//               type: 'number',
//               readOnly: true,
//               initialValue: 0,
//             }),

//             // Today's Paint Cost Reference
//             defineField({
//               name: 'todayPaintCost',
//               title: "Today's Paint Cost (per sqft)",
//               type: 'number',
//               validation: (Rule) => Rule.min(0).precision(2),
//               description: 'Current market paint price per square foot at time of creating this work order',
//             }),

//             // Total Price (calculated: paintCostPerPiece × qty)
//             defineField({
//               name: 'totalPrice',
//               title: 'Total Price',
//               type: 'number',
//               description: 'Total price for this part (paintCostPerPiece × qty)',
//               validation: (Rule) => Rule.required().min(0),
//               readOnly: true,
//             }),

//             // Store Item ID Reference
//             defineField({
//               name: 'storeItemId',
//               title: 'Store Item ID',
//               type: 'string',
//               description: 'Reference to the original store item',
//             }),
//           ],

//           // Preview for individual part items
//           preview: {
//             select: {
//               title: 'partName',
//               subtitle: 'partNo',
//               quantity: 'qty',
//               paintCostPerPiece: 'paintCostPerPiece',
//               sqft: 'blankSizeSqft'
//             },
//             prepare(selection: { title?: string; subtitle?: string; quantity?: number; paintCostPerPiece?: number; sqft?: number }) {
//               const { title, subtitle, quantity, paintCostPerPiece, sqft } = selection
//               return {
//                 title: `${title} (${subtitle})`,
//                 subtitle: `Qty: ${quantity || 0} | Paint Cost: Rs ${paintCostPerPiece?.toLocaleString() || 0} | SQFT: ${sqft || 0}`,
//               }
//             },
//           },
//         },
//       ],
//     }),

//     defineField({
//       name: 'total',
//       title: 'Total Amount',
//       type: 'number',
//       description: 'Total amount for the entire work order (sum of all parts total price)',
//       validation: (Rule) => Rule.min(0),
//       readOnly: true,
//     }),
//   ],

//   preview: {
//     select: {
//       title: 'workOrderNo',
//       subtitle: 'gatepassNo',
//       total: 'total',
//       parts: 'parts'
//     },
//     prepare(selection: PreviewSelection) {
//       const { title, subtitle, total, parts } = selection
//       const totalQty = parts?.reduce((sum: number, part: Part) => sum + (part.qty || 0), 0) || 0
//       return {
//         title: title || 'Untitled Work Order',
//         subtitle: `${subtitle || 'No Gate Pass'} | Qty: ${totalQty} | Total: Rs ${total?.toLocaleString() || 0}`,
//       }
//     },
//   },
// })


// schemas/paintInward.ts
import { defineField, defineType } from 'sanity'

// Define interface for part object
interface Part {
  qty?: number;
  [key: string]: unknown;
}

// Define interface for preview selection
interface PreviewSelection {
  title?: string;
  subtitle?: string;
  total?: number;
  parts?: Part[];
}

export const paintinop = defineType({
  name: 'paint-in-opr',
  title: 'Paint Inward Opr',
  type: 'document',

  fields: [
    defineField({
      name: 'workOrderNo',
      title: 'Work Order Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'gatepassNo',
      title: 'Gate Pass Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'mwo',
      title: 'Document Ref No#',
      type: 'string',
      description: 'Reference to Mechanical Work Order Number',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'dateIssued',
      title: 'Date Issued',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'remarks',
      title: 'Remarks',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'parts',
      title: 'Parts',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'partItem',
          title: 'Part Item',

          fields: [
            defineField({
              name: 'partNo',
              title: 'Part Number',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'partName',
              title: 'Part Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'storeLocation',
              title: 'Store Location',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            // Blank Dimensions
            defineField({
              name: 'blankWidth',
              title: 'Blank Width (inches)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
              description: 'Width of the blank in inches',
            }),

            defineField({
              name: 'blankLength',
              title: 'Blank Length (inches)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
              description: 'Length of the blank in inches',
            }),

            defineField({
              name: 'blankSizeSqft',
              title: 'Blank Size (sqft)',
              type: 'number',
              validation: (Rule) => Rule.required().positive(),
              description: 'Area in square feet (calculated from width × length ÷ 144)',
            }),

            // Paint Cost per sqft
            defineField({
              name: 'paintCostPerSqft',
              title: 'Paint Cost (per sqft)',
              type: 'number',
              description: 'Paint cost per square foot',
              validation: (Rule) => Rule.required().min(0),
            }),

            // Paint Cost Per Piece (calculated: blankSizeSqft × paintCostPerSqft)
            defineField({
              name: 'paintCostPerPiece',
              title: 'Paint Cost Per Piece',
              type: 'number',
              description: 'Paint cost per individual piece (blankSizeSqft × paintCostPerSqft)',
              validation: (Rule) => Rule.required().min(0),
              readOnly: true,
            }),

            defineField({
              name: 'gauge',
              title: 'Gauge',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'material',
              title: 'Material',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'qty',
              title: 'Quantity',
              type: 'number',
              description: 'Number of pieces',
              validation: (Rule) => Rule.required().integer().positive(),
            }),

            // Received Quantity
            defineField({
              name: 'receivedQty',
              title: 'Received Quantity',
              type: 'number',
              validation: (Rule) => Rule.integer().min(0),
              initialValue: 0,
            }),

            // Remaining Quantity
            defineField({
              name: 'remainingQty',
              title: 'Remaining Quantity',
              type: 'number',
              readOnly: true,
              initialValue: 0,
            }),

            // Today's Paint Cost Reference
            defineField({
              name: 'todayPaintCost',
              title: "Today's Paint Cost (per sqft)",
              type: 'number',
              validation: (Rule) => Rule.min(0).precision(2),
              description: 'Current market paint price per square foot at time of creating this work order',
            }),

            // Total Price (calculated: paintCostPerPiece × qty)
            defineField({
              name: 'totalPrice',
              title: 'Total Price',
              type: 'number',
              description: 'Total price for this part (paintCostPerPiece × qty)',
              validation: (Rule) => Rule.required().min(0),
              readOnly: true,
            }),

            // Store Item ID Reference
            defineField({
              name: 'storeItemId',
              title: 'Store Item ID',
              type: 'string',
              description: 'Reference to the original store item',
            }),
          ],

          // Preview for individual part items
          preview: {
            select: {
              title: 'partName',
              subtitle: 'partNo',
              quantity: 'qty',
              paintCostPerPiece: 'paintCostPerPiece',
              sqft: 'blankSizeSqft'
            },
            prepare(selection: { title?: string; subtitle?: string; quantity?: number; paintCostPerPiece?: number; sqft?: number }) {
              const { title, subtitle, quantity, paintCostPerPiece, sqft } = selection
              return {
                title: `${title} (${subtitle})`,
                subtitle: `Qty: ${quantity || 0} | Paint Cost: Rs ${paintCostPerPiece?.toLocaleString() || 0} | SQFT: ${sqft || 0}`,
              }
            },
          },
        },
      ],
    }),

    defineField({
      name: 'total',
      title: 'Total Amount',
      type: 'number',
      description: 'Total amount for the entire work order (sum of all parts total price)',
      validation: (Rule) => Rule.min(0),
      readOnly: true,
    }),

    defineField({
      name: 'totalWeight',
      title: 'Total Weight',
      type: 'number',
      description: 'Total weight for the entire work order',
      validation: (Rule) => Rule.min(0),
      readOnly: true,
    }),
  ],

  preview: {
    select: {
      title: 'workOrderNo',
      subtitle: 'gatepassNo',
      total: 'total',
      parts: 'parts'
    },
    prepare(selection: PreviewSelection) {
      const { title, subtitle, total, parts } = selection
      const totalQty = parts?.reduce((sum: number, part: Part) => sum + (part.qty || 0), 0) || 0
      return {
        title: title || 'Untitled Work Order',
        subtitle: `${subtitle || 'No Gate Pass'} | Qty: ${totalQty} | Total: Rs ${total?.toLocaleString() || 0}`,
      }
    },
  },
})