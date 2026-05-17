import { defineType, defineField } from 'sanity'

export const gatepassSchema = defineType({
  name: 'gatepass',
  type: 'document',
  title: 'Gatepass Management',
  fields: [
    defineField({
      name: 'gatepassNumber',
      type: 'string',
      title: 'Gatepass Number',
      description: 'Unique gatepass number (auto-generated)',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'date',
      type: 'date',
      title: 'Gatepass Date',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'time',
      type: 'string',
      title: 'Time',
      description: 'Time of issuance'
    }),
    defineField({
      name: 'purpose',
      type: 'string',
      title: 'Purpose of Outgoing',
      options: {
        list: [
          { title: 'Production', value: 'Production' },
          { title: 'Maintenance', value: 'Maintenance' },
          { title: 'Quality Control', value: 'Quality Control' },
          { title: 'R&D', value: 'R&D' },
          { title: 'External Processing', value: 'External Processing' },
          { title: 'Sales Delivery', value: 'Sales Delivery' },
          { title: 'Transfer to Another Store', value: 'Transfer' },
          { title: 'Return to Supplier', value: 'Return to Supplier' },
          { title: 'Sample', value: 'Sample' },
          { title: 'Other', value: 'Other' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'issuedTo',
      type: 'string',
      title: 'Issued To',
      description: 'Person or Department receiving the items',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'authorizedBy',
      type: 'string',
      title: 'Authorized By',
      description: 'Person authorizing this gatepass',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'remarks',
      type: 'text',
      title: 'Additional Remarks',
      description: 'Any additional notes or instructions'
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items Issued',
      of: [
        defineField({
          name: 'gatepassItem',
          type: 'object',
          fields: [
            defineField({
              name: 'serialNumber',
              type: 'number',
              title: 'Serial Number'
            }),
            defineField({
              name: 'itemId',
              type: 'reference',
              title: 'Store Item',
              to: [{ type: 'store' }],
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'partNumber',
              type: 'string',
              title: 'Part Number',
              description: 'Auto-filled from store item'
            }),
            defineField({
              name: 'partName',
              type: 'string',
              title: 'Part Name',
              description: 'Auto-filled from store item'
            }),
            defineField({
              name: 'quantity',
              type: 'number',
              title: 'Quantity',
              validation: Rule => Rule.required().min(1)
            }),
            defineField({
              name: 'unitOfMeasure',
              type: 'string',
              title: 'Unit of Measure',
              description: 'Auto-filled from store item'
            }),
            defineField({
              name: 'stockBefore',
              type: 'number',
              title: 'Stock Before Issuance'
            }),
            defineField({
              name: 'stockAfter',
              type: 'number',
              title: 'Stock After Issuance'
            })
          ],
          preview: {
            select: {
              title: 'partName',
              subtitle: 'partNumber',
              quantity: 'quantity'
            },
            prepare(selection) {
              const { title, subtitle, quantity } = selection
              return {
                title: `${title} (${subtitle})`,
                subtitle: `Quantity: ${quantity}`
              }
            }
          }
        })
      ]
    }),
    defineField({
      name: 'totalItems',
      type: 'number',
      title: 'Total Items Count',
      description: 'Total number of individual items issued',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Gatepass Status',
      options: {
        list: [
          { title: 'Issued', value: 'issued' },
          { title: 'Partially Returned', value: 'partial_return' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' }
        ]
      },
      initialValue: 'issued'
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'createdBy',
      type: 'string',
      title: 'Created By',
      description: 'User who created this gatepass'
    }),
    defineField({
      name: 'updatedAt',
      type: 'datetime',
      title: 'Updated At'
    })
  ],
  
  preview: {
    select: {
      title: 'gatepassNumber',
      subtitle: 'issuedTo',
      date: 'date',
      total: 'totalItems'
    },
    prepare(selection) {
      const { title, subtitle, date, total } = selection
      return {
        title: `${title}`,
        subtitle: `${subtitle} | Date: ${date} | Items: ${total || 0}`
      }
    }
  },
  
  orderings: [
    {
      title: 'Gatepass Number',
      name: 'gatepassNumberAsc',
      by: [{ field: 'gatepassNumber', direction: 'asc' }]
    },
    {
      title: 'Date (Newest First)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }]
    }
  ]
})