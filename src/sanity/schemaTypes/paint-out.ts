// schemas/workOrder.ts

import { defineField, defineType } from 'sanity'

// Define interface for part object
interface Part {
  qty?: number;
  completedQty?: number;
  weight?: number;
  [key: string]: unknown;
}

// Define interface for preview selection
interface PreviewSelection {
  title?: string;
  subtitle?: string;
  total?: number;
  totalWeight?: number;
  parts?: Part[];
}

export const paintoutop = defineType({
  name: 'paint-out-opr',
  title: 'Paint Outward Opr',
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

            // Weight field
            defineField({
              name: 'weight',
              title: 'Weight (kg)',
              type: 'number',
              validation: (Rule) => Rule.min(0).precision(3),
              description: 'Weight per piece in kilograms',
            }),

            // Total Weight field (calculated: weight × qty)
            defineField({
              name: 'totalWeight',
              title: 'Total Weight (kg)',
              type: 'number',
              validation: (Rule) => Rule.min(0).precision(3),
              description: 'Total weight for this part (weight × qty)',
              readOnly: true,
            }),

            defineField({
              name: 'sheetCost',
              title: 'Sheet Cost Per Piece',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
              description: 'Cost per piece from store inventory',
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
              validation: (Rule) => Rule.required().integer().positive(),
            }),

            defineField({
              name: 'remainingQty',
              title: 'Remaining Quantity',
              type: 'number',
              description: 'Quantity remaining to be completed',
              validation: (Rule) => Rule.integer().min(0),
              initialValue: 0,
            }),

            defineField({
              name: 'completedQty',
              title: 'Completed Quantity',
              type: 'number',
              description: 'Quantity already completed',
              validation: (Rule) => Rule.integer().min(0),
              initialValue: 0,
            }),

            // Total Price (calculated: sheetCost × qty)
            defineField({
              name: 'totalPrice',
              title: 'Total Price',
              type: 'number',
              description: 'Total price for this part (sheetCost × qty)',
              validation: (Rule) => Rule.min(0),
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
              weight: 'weight',
              sheetCost: 'sheetCost',
              sqft: 'blankSizeSqft'
            },
            prepare(selection: { title?: string; subtitle?: string; quantity?: number; weight?: number; sheetCost?: number; sqft?: number }) {
              const { title, subtitle, quantity, weight, sheetCost, sqft } = selection
              return {
                title: `${title} (${subtitle})`,
                subtitle: `Qty: ${quantity || 0} | Weight: ${weight || 0}kg | Cost: Rs ${sheetCost?.toLocaleString() || 0} | SQFT: ${sqft || 0}`,
              }
            },
          },
        },
      ],
    }),

    // Total Amount for the entire work order
    defineField({
      name: 'total',
      title: 'Total Amount',
      type: 'number',
      description: 'Total amount for the entire work order (sum of all parts total price)',
      validation: (Rule) => Rule.min(0),
      readOnly: true,
    }),

    // Total Weight for the entire work order
    defineField({
      name: 'totalWeight',
      title: 'Total Weight (kg)',
      type: 'number',
      description: 'Total weight for the entire work order (sum of all parts total weight)',
      validation: (Rule) => Rule.min(0),
      readOnly: true,
    }),
  ],

  preview: {
    select: {
      title: 'workOrderNo',
      subtitle: 'gatepassNo',
      total: 'total',
      totalWeight: 'totalWeight',
      parts: 'parts'
    },
    prepare(selection: PreviewSelection) {
      const { title, subtitle, total, totalWeight, parts } = selection
      const totalQty = parts?.reduce((sum: number, part: Part) => sum + (part.qty || 0), 0) || 0
      const totalCompletedQty = parts?.reduce((sum: number, part: Part) => sum + (part.completedQty || 0), 0) || 0
      const progressPercent = totalQty > 0 ? Math.round((totalCompletedQty / totalQty) * 100) : 0
      
      return {
        title: title || 'Untitled Work Order',
        subtitle: `${subtitle || 'No Gate Pass'} | Qty: ${totalQty} | Progress: ${progressPercent}% | Weight: ${totalWeight || 0}kg | Total: Rs ${total?.toLocaleString() || 0}`,
      }
    },
  },
})