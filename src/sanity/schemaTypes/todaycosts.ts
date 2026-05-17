// schemas/store.ts
import { defineType, defineField } from 'sanity'

export const cost = defineType({
  name: 'cost',
  type: 'document',
  title: 'Costs',
  fields: [
    // ==================== SECTION 1: PAINT PRICE PER SQFT ====================
    defineField({
      name: 'paintSection',
      type: 'object',
      title: 'Paint Price per Sqft',
      fields: [
        defineField({
          name: 'todayPaintCost',
          type: 'number',
          title: 'Paint Price per Sqft',
          description: 'Current market price of paint per square foot',
          validation: Rule => Rule.min(0).precision(2)
        }),
        defineField({
          name: 'paintEffectiveDate',
          type: 'datetime',
          title: 'Paint Price Effective Date'
        })
      ]
    }),

    // ==================== SECTION 2: SHEET PRICE PER GAUGE ====================
    defineField({
      name: 'sheetSection',
      type: 'object',
      title: 'Sheet Price per Gauge',
      fields: [
        defineField({
          name: 'sheetPrices',
          type: 'array',
          title: 'Sheet Prices by Gauge & Material',
          of: [
            {
              type: 'object',
              name: 'sheetPriceEntry',
              fields: [
                defineField({
                  name: 'material',
                  type: 'string',
                  title: 'Material Type',
                  options: {
                    list: [
                      { title: 'GI (Galvanized Iron)', value: 'GI' },
                      { title: 'CR (Cold Rolled)', value: 'CR' },
                      { title: 'Aluminum', value: 'Aluminum' },
                      { title: 'Stainless Steel', value: 'StainlessSteel' }
                    ]
                  }
                }),
                defineField({
                  name: 'gauge',
                  type: 'string',
                  title: 'Gauge',
                  options: {
                    list: [
                      { title: '10G', value: '10G' },
                      { title: '12G', value: '12G' },
                      { title: '14G', value: '14G' },
                      { title: '16G', value: '16G' },
                      { title: '18G', value: '18G' },
                      { title: '20G', value: '20G' },
                      { title: '22G', value: '22G' },
                      { title: '24G', value: '24G' },
                      { title: '26G', value: '26G' },
                      { title: '28G', value: '28G' }
                    ]
                  }
                }),
                defineField({
                  name: 'pricePerSheet',
                  type: 'number',
                  title: 'Price Per Sheet',
                  description: 'Price per sheet for this material and gauge',
                  validation: Rule => Rule.min(0).precision(2)
                })
              ],
              preview: {
                select: {
                  title: 'material',
                  subtitle: 'gauge',
                  price: 'pricePerSheet'
                },
                prepare(selection) {
                  const { title, subtitle, price } = selection
                  return {
                    title: title || 'Unknown Material',
                    subtitle: `${subtitle || 'N/A'} - Rs ${price?.toFixed(2) || '0.00'}`
                  }
                }
              }
            }
          ]
        }),
        defineField({
          name: 'sheetEffectiveDate',
          type: 'datetime',
          title: 'Sheet Price Effective Date'
        })
      ]
    }),

    // ==================== Legacy Fields (for backward compatibility) ====================
    defineField({
      name: 'todaySheetCost',
      type: 'number',
      title: "Today's Sheet Cost (Legacy)",
      hidden: true
    }),
    
    defineField({
      name: 'todayPaintCost',
      type: 'number',
      title: "Today's Paint Cost (Legacy)",
      hidden: true
    }),
    
    defineField({
      name: 'effectiveDate',
      type: 'datetime',
      title: 'Effective Date (Legacy)',
      hidden: true
    })
  ],
  
  preview: {
    select: {
      paintPrice: 'paintSection.todayPaintCost',
      sheetCount: 'sheetSection.sheetPrices'
    },
    prepare(selection) {
      const { paintPrice, sheetCount } = selection
      const sheetEntries = sheetCount?.length || 0
      return {
        title: 'Cost Management',
        subtitle: `Paint: Rs ${paintPrice?.toFixed(2) || '0.00'} | ${sheetEntries} sheet prices`,
        media: undefined
      }
    }
  }
})