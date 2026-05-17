// schemas/workOrder.ts

import { defineField, defineType } from 'sanity'

// Define interface for part object
interface Part {
  qty?: number;
  weight?: number;
  [key: string]: unknown;
}

// Define interface for preview selection
interface PreviewSelection {
  title?: string;
  subtitle?: string;
  date?: string;
  parts?: Part[];
}

export const mechanicalop = defineType({
  name: 'mechanical-op',
  title: 'Mechanical Opr',
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
      initialValue: () => {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        return `M-WO-${year}${month}${day}-${random}`
      },
    }),

    defineField({
      name: 'dateIssued',
      title: 'Date Issued',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
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

            // New fields for dimensions
            defineField({
              name: 'blankWidth',
              title: 'Blank Width (mm)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
              description: 'Width of the blank in inches',
            }),

            defineField({
              name: 'blankLength',
              title: 'Blank Length (mm)',
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

            // New field for weight per piece
            defineField({
              name: 'weight',
              title: 'Weight (kg)',
              type: 'number',
              validation: (Rule) => Rule.min(0).precision(3),
              description: 'Weight of the part in kilograms per piece',
            }),

            // New field for total weight (calculated)
            defineField({
              name: 'totalWeight',
              title: 'Total Weight (kg)',
              type: 'number',
              readOnly: true,
              description: 'Auto-calculated: Weight × Quantity',
            }),

            defineField({
              name: 'sheetCost',
              title: 'Sheet Cost Per Piece',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
              description: 'Sheet cost per piece (from store inventory)',
            }),

            defineField({
              name: 'paintCostPerPiece',
              title: 'Paint Cost Per Piece',
              type: 'number',
              validation: (Rule) => Rule.min(0).precision(2),
              description: 'Calculated paint cost per piece (blankSizeSqft × todayPaintCost)',
              readOnly: true,
            }),
            
            defineField({
              name: 'todayPaintCost',
              title: "Today's Paint Cost (per sqft)",
              type: 'number',
              validation: (Rule) => Rule.min(0).precision(2),
              description: 'Current market paint price per square foot at time of creating this work order',
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
              name: 'completedQty',
              title: 'Completed Quantity',
              type: 'number',
              validation: (Rule) => Rule.integer().min(0),
              initialValue: 0,
              description: 'Number of units completed so far',
            }),
            
            defineField({
              name: 'remainingQty',
              title: 'Remaining Quantity',
              type: 'number',
              readOnly: true,
              initialValue: 0,
              description: 'Auto-calculated: Quantity - Completed Quantity',
            }),
            
            defineField({
              name: 'totalCost',
              title: 'Total Cost',
              type: 'number',
              readOnly: true,
              initialValue: 0,
              description: 'Auto-calculated: Sheet Cost × Quantity',
            }),

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
              sqft: 'blankSizeSqft'
            },
            prepare(selection: { title?: string; subtitle?: string; quantity?: number; weight?: number; sqft?: number }) {
              const { title, subtitle, quantity, weight, sqft } = selection
              return {
                title: `${title} (${subtitle})`,
                subtitle: `Qty: ${quantity || 0} | Weight: ${weight || 0}kg | SQFT: ${sqft || 0}`,
              }
            },
          },
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'workOrderNo',
      subtitle: 'gatepassNo',
      date: 'dateIssued',
      parts: 'parts'
    },
    prepare(selection: PreviewSelection) {
      const { title, subtitle, date, parts } = selection
      const formattedDate = date ? new Date(date).toLocaleDateString() : ''
      const totalParts = parts?.length || 0
      const totalQty = parts?.reduce((sum: number, part: Part) => sum + (part.qty || 0), 0) || 0
      const totalWeight = parts?.reduce((sum: number, part: Part) => sum + ((part.weight || 0) * (part.qty || 0)), 0) || 0
      
      return {
        title: title || 'No Work Order',
        subtitle: `${subtitle || 'No Gate Pass'} | ${formattedDate} | ${totalParts} parts | ${totalQty} qty | ${totalWeight.toFixed(2)} kg`,
      }
    },
  },
})