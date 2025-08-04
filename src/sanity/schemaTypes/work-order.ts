import { defineType, defineField } from 'sanity'

// Define the type for work order status
type WorkOrderStatus = 
  | 'mechanical' 
  | 'powder_paint' 
  | 'assembling' 
  | 'delivered' 
  | 'bill' 
  | 'paint' 
  | 'wiring';

// Create the status map with proper typing
const statusMap: Record<WorkOrderStatus, string> = {
  mechanical: '🔧 Mechanical',
  powder_paint: '🎨 Powder Paint',
  assembling: '🛠️ Assembling',
  delivered: '🚚 Delivered',
  bill: '💰 Bill',
  paint: '🎨 Paint',
  wiring: '🔌 Wiring'
};

export default defineType({
  name: 'workOrderSalesOrder',
  title: 'Work Order, Sales Order & PO',
  type: 'document',
  fields: [
    /* ===========================
       WORK ORDER SECTION
    ============================ */
    defineField({
      name: 'workOrderSection',
      title: 'Work Order Section',
      type: 'object',
      fields: [
        defineField({
          name: 'workOrderNumber',
          title: 'Work Order Number',
          type: 'string',
          validation: (Rule) => Rule.required().error('Work Order Number is required'),
        }),
        defineField({
          name: 'clientName',
          title: 'Client Name',
          type: 'string',
          validation: (Rule) => Rule.required().error('Client name is required'),
        }),
        defineField({
          name: 'jobReference',
          title: 'Job Reference',
          type: 'string',
        }),
        defineField({
          name: 'clientPONumber',
          title: 'Client PO Number',
          type: 'string',
        }),
        defineField({
          name: 'date',
          title: 'Date',
          type: 'date',
          options: { dateFormat: 'DD-MM-YYYY' },
          validation: (Rule) => Rule.required().error('Date is required'),
        }),
        defineField({
          name: 'deliveryDate',
          title: 'Delivery Date',
          type: 'date',
          options: { dateFormat: 'DD-MM-YYYY' },
        }),

        // Products List for Work Order
        defineField({
          name: 'products',
          title: 'Products List',
          type: 'array',
          of: [
            defineField({
              name: 'productItem',
              title: 'Product Item',
              type: 'object',
              fields: [
                defineField({ name: 'serialNumber', title: 'Serial Number', type: 'string' }),
                defineField({ name: 'itemDescription', title: 'Item Description', type: 'text', rows: 2 }),
                defineField({ name: 'quantity', title: 'Quantity', type: 'number', validation: (Rule) => Rule.min(1).error('Quantity must be at least 1') }),
                defineField({ name: 'remarks', title: 'Remarks', type: 'string' }),
              ],
            }),
          ],
        }),

        /* ===========================
           WORK ORDER STATUS SECTION
        ============================ */
        defineField({
          name: 'status',
          title: 'Work Order Status',
          type: 'object',
          fields: [
            defineField({
              name: 'currentStatus',
              title: 'Current Status',
              type: 'string',
              options: {
                list: [
                  { title: 'Mechanical', value: 'mechanical' },
                  { title: 'Powder Paint', value: 'powder_paint' },
                  { title: 'Assembling', value: 'assembling' },
                  { title: 'Delivered', value: 'delivered' },
                  { title: 'Bill', value: 'bill' },
                  { title: 'Paint', value: 'paint' },
                  { title: 'Wiring', value: 'wiring' },
                ],
                layout: 'dropdown',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'statusHistory',
              title: 'Status History',
              type: 'array',
              of: [
                defineField({
                  name: 'statusUpdate',
                  title: 'Status Update',
                  type: 'object',
                  fields: [
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
                          { title: 'Wiring', value: 'wiring' },
                        ],
                      },
                    }),
                    defineField({
                      name: 'date',
                      title: 'Date',
                      type: 'datetime',
                      options: {
                        dateFormat: 'DD-MM-YYYY',
                        timeFormat: 'HH:mm',
                      },
                    }),
                    defineField({
                      name: 'notes',
                      title: 'Notes',
                      type: 'text',
                      rows: 2,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    /* ===========================
       SALES ORDER SECTION
    ============================ */
    defineField({
      name: 'salesOrderSection',
      title: 'Sales Order Section',
      type: 'object',
      fields: [
        // Customer Information
        defineField({
          name: 'customerInfo',
          title: 'Customer Information',
          type: 'object',
          fields: [
            defineField({ name: 'customerName', title: 'Customer Name', type: 'string' }),
            defineField({ name: 'salesPerson', title: 'Sales Person', type: 'string' }),
            defineField({ name: 'contactPerson', title: 'Contact Person', type: 'string' }),
            defineField({ name: 'mobileNo', title: 'Mobile No', type: 'string' }),
            defineField({ name: 'phoneNo', title: 'Phone No', type: 'string' }),
            defineField({ name: 'email', title: 'Email Address', type: 'string' }),
          ],
        }),

        // Order Details (Enhanced with PO and approval dates)
        defineField({
          name: 'orderDetails',
          title: 'Order Details',
          type: 'object',
          fields: [
            defineField({ 
              name: 'productType', 
              title: 'Product Type', 
              type: 'string',
              description: 'Type of product being ordered'
            }),
            defineField({ 
              name: 'poNumber', 
              title: 'P.O Number', 
              type: 'string',
              validation: (Rule) => Rule.required().error('PO Number is required')
            }),
            defineField({
              name: 'poDate',
              title: 'P.O Date',
              type: 'date',
              options: { dateFormat: 'DD-MM-YYYY' },
              validation: (Rule) => Rule.required().error('PO Date is required')
            }),
            defineField({ 
              name: 'poValue', 
              title: 'P.O Value (PKR)', 
              type: 'number',
              validation: (Rule) => Rule.required().positive().error('PO Value must be a positive number'),
              description: 'Total value of the purchase order in PKR'
            }),
            defineField({
              name: 'deliveryDate',
              title: 'Delivery Date',
              type: 'date',
              options: { dateFormat: 'DD-MM-YYYY' },
              validation: (Rule) => Rule.required().error('Delivery Date is required')
            }),
            defineField({
              name: 'shopDrawingApproval',
              title: 'Shop Drawing Approval',
              type: 'boolean',
              initialValue: false,
              description: 'Has the shop drawing been approved?',
            }),
            defineField({
              name: 'shopDrawingApprovalDate',
              title: 'Shop Drawing Approval Date',
              type: 'date',
              options: { dateFormat: 'DD-MM-YYYY' },
              description: 'Date when shop drawing was approved',
              hidden: ({ parent }) => !parent?.shopDrawingApproval
            }),
            defineField({
              name: 'expectedCompletionDate',
              title: 'Expected Completion Date',
              type: 'date',
              options: { dateFormat: 'DD-MM-YYYY' },
              description: 'Estimated date when order will be completed'
            }),
            defineField({
              name: 'specialInstructions',
              title: 'Special Instructions',
              type: 'text',
              rows: 3,
              description: 'Any special instructions for this order'
            })
          ],
        }),

        // Terms & Conditions
        defineField({
          name: 'termsAndConditions',
          title: 'Terms & Conditions',
          type: 'object',
          fields: [
            defineField({
              name: 'paymentType',
              title: 'Payment Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Before Delivery', value: 'beforeDelivery' },
                  { title: 'After Delivery', value: 'afterDelivery' },
                  { title: 'Partial Payment', value: 'partialPayment' },
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required().error('Payment type is required')
            }),
            defineField({ 
              name: 'pricesIncludeGST', 
              title: 'Prices Include GST?', 
              type: 'boolean',
              initialValue: true 
            }),
            defineField({
              name: 'gstPercentage',
              title: 'GST Percentage',
              type: 'number',
              initialValue: 17,
              validation: (Rule) => Rule.min(0).max(100).precision(2),
              description: 'GST percentage to be applied (e.g., 17 for 17%)',
              hidden: ({ parent }) => !parent?.pricesIncludeGST
            }),
            defineField({
              name: 'deliveryMethod',
              title: 'Delivery Method',
              type: 'string',
              options: {
                list: [
                  { title: 'By Company', value: 'company' },
                  { title: 'By Customer', value: 'customer' },
                  { title: 'Third Party', value: 'thirdParty' },
                ],
              },
            }),
            defineField({
              name: 'warrantyPeriod',
              title: 'Warranty Period',
              type: 'string',
              description: 'Warranty period in months/years',
              options: {
                list: [
                  { title: '1 Year', value: '1year' },
                  { title: '2 Years', value: '2years' },
                  { title: '5 Years', value: '5years' },
                  { title: '10 Years', value: '10years' },
                ]
              }
            }),
          ],
        }),

        // Required Documents
        defineField({
          name: 'requiredDocuments',
          title: 'Required Documents',
          type: 'object',
          fields: [
            defineField({
              name: 'quotationWithFinalPrice',
              title: 'Quotation with Final Price',
              type: 'file',
              options: { storeOriginalFilename: true },
            }),
            defineField({
              name: 'approvedShopDrawing',
              title: 'Approved Shop Drawing',
              type: 'file',
              options: { storeOriginalFilename: true },
            }),
            defineField({
              name: 'componentList',
              title: 'Component List',
              type: 'file',
              options: { storeOriginalFilename: true },
            }),
            defineField({
              name: 'customerPOCopy',
              title: 'Customer PO Copy',
              type: 'file',
              options: { storeOriginalFilename: true },
              validation: (Rule) => Rule.required().error('Customer PO copy is required')
            }),
            defineField({
              name: 'technicalSpecifications',
              title: 'Technical Specifications',
              type: 'file',
              options: { storeOriginalFilename: true },
            }),
          ],
        }),

        // Authorized By
        defineField({
          name: 'authorizedBy',
          title: 'Authorized By (Sales Person)',
          type: 'string',
          validation: (Rule) => Rule.required().error('Authorized by field is required')
        }),
      ],
    }),

    /* ===========================
       PURCHASE ORDER (PO) SECTION
    ============================ */
    defineField({
      name: 'purchaseOrderSection',
      title: 'Purchase Order (PO) Section',
      type: 'object',
      fields: [
        defineField({
          name: 'poTable',
          title: 'PO Table (Items List)',
          type: 'array',
          of: [
            defineField({
              name: 'poItem',
              title: 'PO Item',
              type: 'object',
              fields: [
                defineField({ 
                  name: 'description', 
                  title: 'Description', 
                  type: 'text', 
                  rows: 2,
                  validation: (Rule) => Rule.required().error('Description is required')
                }),
                defineField({ 
                  name: 'unit', 
                  title: 'Unit', 
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Piece', value: 'piece' },
                      { title: 'Set', value: 'set' },
                      { title: 'Meter', value: 'meter' },
                      { title: 'Kg', value: 'kg' },
                    ]
                  }
                }),
                defineField({ 
                  name: 'quantity', 
                  title: 'Quantity', 
                  type: 'number',
                  validation: (Rule) => Rule.required().min(1).error('Quantity must be at least 1')
                }),
                defineField({ 
                  name: 'unitRatePKR', 
                  title: 'Unit Rate (PKR)', 
                  type: 'number',
                  validation: (Rule) => Rule.required().positive().error('Unit rate must be positive')
                }),
                defineField({ 
                  name: 'gstApplicable', 
                  title: 'GST Applicable', 
                  type: 'boolean',
                  initialValue: true,
                  description: 'Whether GST applies to this item'
                }),
                defineField({ 
                  name: 'gstPercentage', 
                  title: 'GST Percentage', 
                  type: 'number',
                  initialValue: 17,
                  validation: (Rule) => Rule.min(0).max(100).precision(2),
                  description: 'GST percentage for this item (e.g., 17 for 17%)',
                  hidden: ({ parent }) => !parent?.gstApplicable
                }),
                defineField({ 
                  name: 'gstAmount', 
                  title: 'GST Amount (PKR)', 
                  type: 'number',
                  readOnly: true,
                  description: 'Automatically calculated GST amount',
                  initialValue: 0
                }),
                defineField({ 
                  name: 'totalAmountPKR', 
                  title: 'Total Amount (PKR)', 
                  type: 'number',
                  validation: (Rule) => Rule.required().positive().error('Total amount must be positive')
                }),
              ],
            }),
          ],
        }),
        
        // GST Summary
        defineField({
          name: 'gstSummary',
          title: 'GST Summary',
          type: 'object',
          fields: [
            defineField({
              name: 'subtotal',
              title: 'Subtotal (Before GST)',
              type: 'number',
              readOnly: true,
              description: 'Sum of all items before GST',
              initialValue: 0
            }),
            defineField({
              name: 'totalGST',
              title: 'Total GST Amount',
              type: 'number',
              readOnly: true,
              description: 'Sum of all GST amounts',
              initialValue: 0
            }),
            defineField({
              name: 'grandTotal',
              title: 'Grand Total (Including GST)',
              type: 'number',
              readOnly: true,
              description: 'Subtotal + GST',
              initialValue: 0
            }),
          ]
        }),
        
        defineField({
          name: 'shipTo',
          title: 'Ship To',
          type: 'text',
          rows: 3,
          description: 'Shipping address or location details',
          validation: (Rule) => Rule.required().error('Shipping address is required')
        }),
        defineField({
          name: 'paymentTerms',
          title: 'Payment Terms',
          type: 'text',
          rows: 2,
          description: 'Payment terms and conditions'
        }),
        defineField({
          name: 'deliveryTerms',
          title: 'Delivery Terms',
          type: 'text',
          rows: 2,
          description: 'Delivery terms and conditions'
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'workOrderSection.workOrderNumber',
      subtitle: 'salesOrderSection.customerInfo.customerName',
      poNumber: 'salesOrderSection.orderDetails.poNumber',
      poDate: 'salesOrderSection.orderDetails.poDate',
      poValue: 'salesOrderSection.orderDetails.poValue',
      includesGST: 'salesOrderSection.termsAndConditions.pricesIncludeGST',
      status: 'workOrderSection.status.currentStatus',
    },
    prepare(selection) {
      const {
        title,
        subtitle,
        poNumber,
        poDate,
        poValue,
        includesGST,
        status
      } = selection;

      const formattedPoDate = poDate ? new Date(poDate).toLocaleDateString() : 'No PO date';
      const formattedValue = poValue ? 
        new Intl.NumberFormat('en-PK', { 
          style: 'currency', 
          currency: 'PKR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(poValue).replace('PKR', 'Rs ') : 'No value';
      
      // Type-safe status display
      const statusDisplay = status && isWorkOrderStatus(status) 
        ? statusMap[status] 
        : 'No status';

      return {
        title: title || 'Work/Sales/PO',
        subtitle: [
          subtitle ? `Customer: ${subtitle}` : 'No customer info',
          poNumber ? `PO: ${poNumber}` : 'No PO number',
          `PO Date: ${formattedPoDate}`,
          `Value: ${formattedValue}`,
          includesGST ? '(incl. GST)' : '(excl. GST)',
          `Status: ${statusDisplay}`
        ].join(' | ')
      };
    },
  },
});

// Type guard for WorkOrderStatus
function isWorkOrderStatus(status: any): status is WorkOrderStatus {
  return status in statusMap;
}