import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'inquiryRegister',
  title: 'Inquiry Register',
  type: 'document',
  fields: [
    // Keep only inquiry number at root
    defineField({
      name: 'inquiryNumber',
      title: 'Inquiry Number',
      type: 'string',
    }),

    // All details go inside revisions
    defineField({
      name: 'revisions',
      title: 'Revisions',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'revision',
          title: 'Revision',
          fields: [
            { name: 'revisionNumber', title: 'Revision Number', type: 'string' },
            { name: 'companyName', title: 'Company Name', type: 'string' },
            { name: 'clientName', title: 'Client Name', type: 'string' },
            { name: 'salesPerson', title: 'Sales Person', type: 'string' },
            { name: 'preparedBy', title: 'Prepared By', type: 'string' },
            { name: 'receivingDate', title: 'Receiving Date', type: 'datetime' },
            { name: 'sendingDate', title: 'Sending Date', type: 'datetime' },
            {
              name: 'status',
              title: 'Status',
              type: 'string',
              options: {
                list: [
                  { title: 'Pending', value: 'pending' },
                  { title: 'Sent', value: 'sent' },
                ],
                layout: 'radio',
              },
            },
            {
              name: 'result',
              title: 'Result',
              type: 'string',
              options: {
                list: [
                  { title: 'Win', value: 'win' },
                  { title: 'Loss', value: 'loss' },
                ],
                layout: 'radio',
              },
            },
            { name: 'totalAmount', title: 'Total Amount', type: 'number' },
            { name: 'receivedVia', title: 'Received Via', type: 'string' },
            { name: 'receivedBySalesPerson', title: 'Received By Sales Person', type: 'string' },
            { name: 'remarks', title: 'Remarks / Notes', type: 'text' },
          ],
        },
      ],
    }),
  ],
})
