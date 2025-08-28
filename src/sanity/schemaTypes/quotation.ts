import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'quotation',
  title: 'Quotation',
  type: 'document',
  fields: [
    defineField({
      name: 'quotationId',
      title: 'Quotation ID',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'referenceNo',
      title: 'Reference Number',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'ferencNumber',
      title: 'FERENC Number',
      type: 'string',
      description: 'Financial reference number'
    }),
    defineField({
      name: 'date',
      title: 'Quotation Date',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'status',
      title: 'Quotation Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'Draft' },
          { title: 'Sent', value: 'Sent' },
          { title: 'Accepted', value: 'Accepted' },
          { title: 'Rejected', value: 'Rejected' },
          { title: 'Expired', value: 'Expired' }
        ],
        layout: 'radio'
      },
      initialValue: 'Draft'
    }),
    defineField({
      name: 'client',
      title: 'Customer Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'company',
      title: 'Company Name',
      type: 'string'
    }),
    defineField({
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string',
      validation: Rule => Rule.email()
    }),
    defineField({
      name: 'customerPhone',
      title: 'Customer Phone Number',
      type: 'string'
    }),
    defineField({
      name: 'address',
      title: 'Customer Address',
      type: 'text'
    }),
    defineField({
      name: 'projectName',
      title: 'Project Name',
      type: 'string'
    }),
    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
      description: 'Quotation subject/title'
    }),
    defineField({
      name: 'sentDate',
      title: 'Sent Date',
      type: 'datetime'
    }),
    defineField({
      name: 'receivingDate',
      title: 'Receiving Date',
      type: 'datetime'
    }),
    defineField({
      name: 'revision',
      title: 'Revision Number',
      type: 'string'
    }),
    defineField({
      name: 'revisionDate',
      title: 'Revision Date',
      type: 'datetime'
    }),
    defineField({
      name: 'salesPerson',
      title: 'Sales Person',
      type: 'string'
    }),
    defineField({
      name: 'preparedBy',
      title: 'Prepared By',
      type: 'string'
    }),

    // ✅ Products array
    defineField({
      name: 'products',
      title: 'Quoted Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'itemName',
              title: 'Item Name',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text'
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              initialValue: 1,
              validation: Rule => Rule.min(1).required()
            }),
            defineField({
              name: 'unitPrice',
              title: 'Unit Price',
              type: 'number',
              validation: Rule => Rule.min(0).required()
            }),
            defineField({
              name: 'totalPrice',
              title: 'Total Price',
              type: 'number',
              readOnly: true,
              description: 'Calculated as quantity × unit price'
            })
          ],
          preview: {
            select: {
              title: 'itemName',
              subtitle: 'description',
              qty: 'quantity',
              price: 'unitPrice',
              total: 'totalPrice'
            },
            prepare({ title, subtitle, qty, price, total }) {
              return {
                title,
                subtitle: `${qty} × Rs.${price?.toFixed(2)} = Rs.${total?.toFixed(
                  2
                )} | ${subtitle || 'No description'}`
              }
            }
          }
        }
      ],
      validation: Rule => Rule.min(1)
    }),

    defineField({
      name: 'subtotal',
      title: 'Subtotal',
      type: 'number',
      description: 'Sum of all items before taxes and discounts'
    }),
    defineField({
      name: 'discount',
      title: 'Discount Amount',
      type: 'number',
      description: 'Discount amount to be subtracted from subtotal',
      initialValue: 0
    }),
    defineField({
      name: 'gst',
      title: 'GST Amount',
      type: 'number',
      description: 'Tax amount'
    }),
    defineField({
      name: 'totalPrice',
      title: 'Total Amount',
      type: 'number',
      description: 'Subtotal - Discount + Taxes'
    }),

    defineField({
      name: 'termsAndConditions',
      title: 'Terms and Conditions',
      type: 'array',
      of: [{ type: 'block' }]
    }),

    // ✅ Match frontend: quotationDocs -> quotationAttachments
    defineField({
      name: 'quotationAttachments',
      title: 'Quotation Attachments',
      type: 'array',
      of: [{ type: 'file' }],
      description: 'Uploaded quotation documents'
    }),

    // ✅ Match frontend: technicalDrawings -> drawingAttachments
    defineField({
      name: 'drawingAttachments',
      title: 'Drawing Attachments',
      type: 'array',
      of: [{ type: 'file' }],
      description: 'Technical drawings or specifications'
    }),

    // ✅ Match frontend: sldFile -> sldDocument
    defineField({
      name: 'sldDocument',
      title: 'SLD (Single Line Diagram)',
      type: 'file',
      description: 'Upload the Single Line Diagram document',
      options: {
        accept: '.pdf,.dwg,.dxf,.png,.jpg,.jpeg'
      }
    }),

    // ✅ Other Documents section
    defineField({
      name: 'otherDocuments',
      title: 'Other Documents',
      type: 'array',
      of: [{ type: 'file' }],
      description: 'Any other relevant documents related to this quotation'
    }),

    defineField({
      name: 'notes',
      title: 'Internal Notes',
      type: 'text'
    })
  ],

  preview: {
    select: {
      title: 'quotationId',
      client: 'client',
      company: 'company',
      date: 'date',
      status: 'status'
    },
    prepare({ title, client, company, date, status }) {
      return {
        title: `Quotation #${title}`,
        subtitle: `${client}${company ? ` (${company})` : ''} | ${new Date(
          date
        ).toLocaleDateString()} | ${status}`
      }
    }
  },

  orderings: [
    {
      title: 'Date, New',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }]
    },
    {
      title: 'Date, Old',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }]
    }
  ]
})