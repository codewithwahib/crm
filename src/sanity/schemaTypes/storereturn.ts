// sanity/schemas/storeReturn.ts
import { defineType, defineField } from 'sanity'

export const storeReturn = defineType({
  name: 'storeReturn',
  type: 'document',
  title: 'Store Return Records',
  icon: () => '📦',
  
  fields: [
    // ========== RETURN BASIC INFO ==========
    defineField({
      name: 'returnNumber',
      type: 'string',
      title: 'Return Number',
      description: 'Auto-generated return tracking number',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'returnDate',
      type: 'datetime',
      title: 'Return Date',
      description: 'Date and time when the return was processed',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'returnType',
      type: 'string',
      title: 'Return Type',
      options: {
        list: [
          { title: 'Production Return', value: 'production_return' },
          { title: 'Customer Return', value: 'customer_return' },
          { title: 'Quality Return', value: 'quality_return' },
          { title: 'Excess Stock Return', value: 'excess_return' },
          { title: 'Damaged Return', value: 'damaged_return' },
          { title: 'Other', value: 'other' }
        ]
      },
      initialValue: 'production_return'
    }),
    
    // ========== PRODUCT INFORMATION ==========
    defineField({
      name: 'partNumber',
      type: 'string',
      title: 'Part Number',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'partName',
      type: 'string',
      title: 'Part Name',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      options: {
        list: [
          { title: 'Raw Material', value: 'raw' },
          { title: 'Finished Goods', value: 'finished' },
          { title: 'Packaging', value: 'packaging' }
        ]
      }
    }),
    defineField({
      name: 'storeLocation',
      type: 'string',
      title: 'Store Location',
      description: 'Rack/Shelf/Bin number where item is stored',
      validation: Rule => Rule.required()
    }),
    
    // ========== MATERIAL SPECIFICATIONS ==========
    defineField({
      name: 'gauge',
      type: 'string',
      title: 'Gauge',
      description: 'Thickness of material (e.g., 20G, 22G, 24G)'
    }),
    defineField({
      name: 'material',
      type: 'string',
      title: 'Material',
      description: 'Type of material',
      options: {
        list: [
          { title: 'GI (Galvanized Iron)', value: 'GI' },
          { title: 'CR (Cold Rolled)', value: 'CR' },
          { title: 'Aluminum', value: 'Aluminum' },
          { title: 'Stainless Steel', value: 'StainlessSteel' },
          { title: 'Other', value: 'Other' }
        ]
      }
    }),
    defineField({
      name: 'blankWidthMM',
      type: 'number',
      title: 'Blank Width (mm)',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'blankLengthMM',
      type: 'number',
      title: 'Blank Length (mm)',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'blankWidthInch',
      type: 'number',
      title: 'Blank Width (Inch)',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'blankLengthInch',
      type: 'number',
      title: 'Blank Length (Inch)',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'sqft',
      type: 'number',
      title: 'Square Feet (Sqft)',
      description: 'Area of the part',
      validation: Rule => Rule.min(0)
    }),
    
    // ========== WEIGHT ==========
    defineField({
      name: 'weight',
      type: 'number',
      title: 'Weight (kg)',
      description: 'Weight of the part in kilograms',
      validation: Rule => Rule.min(0).precision(3)
    }),
    
    // ========== COST INFORMATION ==========
    defineField({
      name: 'sheetCostPerPiece',
      type: 'number',
      title: 'Sheet Cost Per Piece',
      description: 'Sheet cost for each individual piece',
      validation: Rule => Rule.min(0).precision(2)
    }),
    defineField({
      name: 'paintCostPerPiece',
      type: 'number',
      title: 'Paint Cost Per Piece',
      description: 'Paint cost for each individual piece',
      validation: Rule => Rule.min(0).precision(2)
    }),
    defineField({
      name: 'todaySheetCost',
      type: 'number',
      title: "Today's Sheet Cost",
      description: 'Current market sheet cost at the time of return',
      validation: Rule => Rule.min(0).precision(2)
    }),
    defineField({
      name: 'todayPaintCost',
      type: 'number',
      title: "Today's Paint Cost",
      description: 'Current market paint cost at the time of return',
      validation: Rule => Rule.min(0).precision(2)
    }),
    
    // ========== RETURN DETAILS ==========
    defineField({
      name: 'returnedQuantity',
      type: 'number',
      title: 'Returned Quantity',
      description: 'Quantity being returned to store',
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'returnReason',
      type: 'string',
      title: 'Return Reason',
      description: 'Reason for returning the item',
      options: {
        list: [
          { title: 'Production Defect', value: 'Production Defect' },
          { title: 'Quality Issue', value: 'Quality Issue' },
          { title: 'Wrong Item Issued', value: 'Wrong Item Issued' },
          { title: 'Excess from Production', value: 'Excess from Production' },
          { title: 'Damaged During Production', value: 'Damaged During Production' },
          { title: 'Project Completion Return', value: 'Project Completion Return' },
          { title: 'Inventory Adjustment', value: 'Inventory Adjustment' },
          { title: 'Customer Return', value: 'Customer Return' },
          { title: 'Other', value: 'Other' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'returnedBy',
      type: 'string',
      title: 'Returned By',
      description: 'Name of the person returning the item',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'receivedBy',
      type: 'string',
      title: 'Received By',
      description: 'Store staff who received the return'
    }),
    defineField({
      name: 'fromDepartment',
      type: 'string',
      title: 'From Department',
      description: 'Department returning the item',
      options: {
        list: [
          { title: 'Production', value: 'Production' },
          { title: 'Quality Control', value: 'Quality Control' },
          { title: 'Maintenance', value: 'Maintenance' },
          { title: 'R&D', value: 'R&D' },
          { title: 'Packaging', value: 'Packaging' },
          { title: 'Customer', value: 'Customer' },
          { title: 'Other', value: 'Other' }
        ]
      }
    }),
    
    // ========== STOCK INFORMATION ==========
    defineField({
      name: 'originalStock',
      type: 'number',
      title: 'Original Stock (Before Return)',
      description: 'Stock quantity before adding returned items',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'newStock',
      type: 'number',
      title: 'New Stock (After Return)',
      description: 'Stock quantity after adding returned items',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'unitOfMeasure',
      type: 'string',
      title: 'Unit of Measure',
      options: {
        list: ['Pieces', 'Kg', 'Liters', 'Meters', 'Boxes', 'Sheets']
      },
      initialValue: 'Pieces'
    }),
    defineField({
      name: 'minimumStockLevel',
      type: 'number',
      title: 'Minimum Stock Level',
      description: 'Alert level for low stock',
      validation: Rule => Rule.min(0)
    }),
    
    // ========== REFERENCE FIELDS ==========
    defineField({
      name: 'storeItemId',
      type: 'string',
      title: 'Store Item ID',
      description: 'Reference to the original store item'
    }),
    defineField({
      name: 'gatepassReference',
      type: 'string',
      title: 'Gatepass Reference',
      description: 'Reference to the original gatepass if applicable'
    }),
    
    // ========== ADDITIONAL INFORMATION ==========
    defineField({
      name: 'condition',
      type: 'string',
      title: 'Item Condition',
      description: 'Condition of the returned items',
      options: {
        list: [
          { title: 'Excellent', value: 'Excellent' },
          { title: 'Good', value: 'Good' },
          { title: 'Fair', value: 'Fair' },
          { title: 'Poor', value: 'Poor' },
          { title: 'Damaged', value: 'Damaged' },
          { title: 'Scrap', value: 'Scrap' }
        ]
      },
      initialValue: 'Good'
    }),
    defineField({
      name: 'remarks',
      type: 'text',
      title: 'Remarks / Additional Notes',
      description: 'Any additional information about the return',
      rows: 3
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Return Status',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Completed', value: 'completed' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Cancelled', value: 'cancelled' }
        ]
      },
      initialValue: 'completed'
    })
  ],

  preview: {
    select: {
      title: 'partName',
      subtitle: 'partNumber',
      quantity: 'returnedQuantity',
      date: 'returnDate',
      reason: 'returnReason',
      returnedBy: 'returnedBy',
      returnNumber: 'returnNumber'
    },
    prepare(selection) {
      const { title, subtitle, quantity, date, reason, returnedBy, returnNumber } = selection
      const dateFormatted = date ? new Date(date).toLocaleDateString() : 'No date'
      const shortReason = reason ? (reason.length > 20 ? reason.substring(0, 20) + '...' : reason) : ''
      
      return {
        title: `${returnNumber || 'RETURN'} - ${title} (${subtitle})`,
        subtitle: `📦 ${quantity} pcs | ${shortReason} | By: ${returnedBy || 'N/A'} | ${dateFormatted}`
      }
    }
  },

  orderings: [
    {
      title: 'Return Date (Newest First)',
      name: 'returnDateDesc',
      by: [{ field: 'returnDate', direction: 'desc' }]
    },
    {
      title: 'Return Date (Oldest First)',
      name: 'returnDateAsc',
      by: [{ field: 'returnDate', direction: 'asc' }]
    },
    {
      title: 'Part Number (A-Z)',
      name: 'partNumberAsc',
      by: [{ field: 'partNumber', direction: 'asc' }]
    },
    {
      title: 'Quantity (Highest First)',
      name: 'quantityDesc',
      by: [{ field: 'returnedQuantity', direction: 'desc' }]
    }
  ],

  initialValue: {
    category: 'raw',
    unitOfMeasure: 'Pieces',
    condition: 'Good',
    status: 'completed',
    returnType: 'production_return',
    returnDate: new Date().toISOString()
  }
})
