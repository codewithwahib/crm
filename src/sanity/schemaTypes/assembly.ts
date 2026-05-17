// schemas/assemblyOperation.ts

import { defineField, defineType } from 'sanity'

export const assembly = defineType({
  name: 'assembly',
  title: 'Assembly Operation',
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
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')

        return `A-ASM-${year}${month}${day}-${random}`
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
      name: 'assemblyDate',
      title: 'Assembly Date',
      type: 'date',
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
        defineField({
          type: 'object',
          name: 'assemblyPartItem',
          title: 'Assembly Part Item',

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

            // NEW FIELD: Blank Width
            defineField({
              name: 'blankWidth',
              title: 'Blank Width (inches)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
              description: 'Width of the blank in inches',
            }),

            // NEW FIELD: Blank Length
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

            defineField({
              name: 'sheetCost',
              title: 'Sheet Cost',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
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
              validation: (Rule) => Rule.min(0),
              initialValue: 0,
            }),

            defineField({
              name: 'remainingQty',
              title: 'Remaining Quantity',
              type: 'number',
              readOnly: true,
              initialValue: 0,
            }),

            defineField({
              name: 'storeItemId',
              title: 'Store Item ID',
              type: 'string',
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'In Progress', value: 'in-progress' },
          { title: 'Completed', value: 'completed' },
          { title: 'On Hold', value: 'on-hold' },
        ],
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'workOrderNo',
      subtitle: 'gatepassNo',
      date: 'dateIssued',
    },

    prepare(selection) {
      const { title, subtitle, date } = selection
      const formattedDate = date
        ? new Date(date).toLocaleDateString()
        : ''

      return {
        title: title || 'No Work Order',
        subtitle: `${subtitle || 'No Gate Pass'} | ${formattedDate}`,
      }
    },
  },
})