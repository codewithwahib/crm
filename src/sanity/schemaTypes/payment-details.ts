import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'paymentDetails',
  title: 'Payment Details',
  type: 'document',
  fields: [
    defineField({
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      options: {
        list: [
          { title: 'Cash', value: 'cash' },
          { title: 'Bank Transfer', value: 'bank_transfer' },
          { title: 'Credit Card', value: 'credit_card' },
          { title: 'Cheque', value: 'cheque' },
          { title: 'Online Payment', value: 'online' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'paymentDate',
      title: 'Payment Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'amount',
      title: 'Amount Paid',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),

    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [
          { title: 'USD', value: 'USD' },
          { title: 'EUR', value: 'EUR' },
          { title: 'PKR', value: 'PKR' },
          { title: 'GBP', value: 'GBP' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'USD',
    }),

    defineField({
      name: 'transactionId',
      title: 'Transaction ID / Reference',
      type: 'string',
    }),

    defineField({
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Completed', value: 'completed' },
          { title: 'Failed', value: 'failed' },
          { title: 'Refunded', value: 'refunded' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'notes',
      title: 'Additional Notes',
      type: 'text',
    }),
  ],
})
