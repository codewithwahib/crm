import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'workOrderStatus',
  title: 'Work Order Status',
  type: 'document',
  fields: [
    defineField({
      name: 'workOrderNumber',
      title: 'Work Order Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientName',
      title: 'Client Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'jobReference',
      title: 'Job Reference',
      type: 'string',
    }),
    defineField({
      name: 'poNumber',
      title: 'PO Number',
      type: 'string',
    }),
    defineField({
      name: 'deliveryDate',
      title: 'Delivery Date',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineField({
          name: 'item',
          title: 'Item',
          type: 'object',
          fields: [
            defineField({
              name: 'description',
              title: 'Item Description',
              type: 'string',
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
            }),
            defineField({
              name: 'remarks',
              title: 'Remarks',
              type: 'text',
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
          { title: 'Mechanical', value: 'mechanical' },
          { title: 'Powder Paint', value: 'powder_paint' },
          { title: 'Assembling', value: 'assembling' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Bill', value: 'bill' },
          { title: 'Paint', value: 'paint' },
          { title: 'Assembling', value: 'assembling' },
          { title: 'Wiring', value: 'wiring' },
          { title: 'Delivered', value: 'delivered' },


        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
})
