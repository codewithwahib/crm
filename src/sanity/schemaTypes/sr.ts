import { defineType, defineField } from 'sanity'

export const sr = defineType({
  name: 'sr',
  type: 'document',
  title: 'Store Return',
  fields: [
    // Basic Product Info
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
      description: 'Rack/Shelf/Bin number',
      validation: Rule => Rule.required()
    }),
    
    // Material Specifications
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
      description: 'Type of material (e.g., GI, CR, Aluminum, Stainless Steel)',
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
      name: 'blankWidth',
      type: 'number',
      title: 'Blank Width (mm/inches)',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'blankLength',
      type: 'number',
      title: 'Blank Length (mm/inches)',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'sqft',
      type: 'number',
      title: 'Square Feet (Sqft)',
      description: 'Area of the part',
      validation: Rule => Rule.min(0)
    }),
    
    // Weight Field
    defineField({
      name: 'weight',
      type: 'number',
      title: 'Weight (kg)',
      description: 'Weight of the part in kilograms',
      validation: Rule => Rule.min(0).precision(3)
    }),
    
    // Cost Details
    defineField({
      name: 'todaySheetCost',
      type: 'number',
      title: "Today's Sheet Cost",
      description: 'Current market price at the time of creating this part',
      validation: Rule => Rule.min(0).precision(2)
    }),
    defineField({
      name: 'todayPaintCost',
      type: 'number',
      title: "Today's Paint Cost",
      description: 'Current market price at the time of creating this part',
      validation: Rule => Rule.min(0).precision(2)
    }),
    // NEW FIELDS: Cost Per Piece
    defineField({
      name: 'sheetCostPerPiece',
      type: 'number',
      title: 'Sheet Cost Per Piece',
      description: 'Calculated sheet cost for each individual piece',
      validation: Rule => Rule.min(0).precision(2)
    }),
    defineField({
      name: 'paintCostPerPiece',
      type: 'number',
      title: 'Paint Cost Per Piece',
      description: 'Calculated paint cost for each individual piece',
      validation: Rule => Rule.min(0).precision(2)
    }),
    
    // Stock Information
    defineField({
      name: 'stockInStore',
      type: 'number',
      title: 'Stock in Store (Current Quantity)',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'minimumStockLevel',
      type: 'number',
      title: 'Minimum Stock Level (Low Stock Alert)',
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
    })
  ],

  preview: {
    select: {
      title: 'partName',
      subtitle: 'partNumber',
      stock: 'stockInStore',
      minStock: 'minimumStockLevel',
      location: 'storeLocation',
      weight: 'weight'
    },
    prepare(selection) {
      const { title, subtitle, stock, minStock, location, weight } = selection
      const lowStockAlert = stock <= minStock ? '⚠️ Low Stock! ' : ''
      const weightText = weight ? ` | Weight: ${weight}kg` : ''
      return {
        title: `${title} (${subtitle})`,
        subtitle: `${lowStockAlert}Stock: ${stock} | Location: ${location || 'N/A'}${weightText}`
      }
    }
  }
})