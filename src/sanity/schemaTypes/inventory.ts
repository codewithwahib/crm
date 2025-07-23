import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'inventoryItem',
  title: 'Inventory Item',
  type: 'document',
  fields: [
    // ✅ Basic Info
    defineField({
      name: 'itemName',
      title: 'Item Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'sku',
      title: 'SKU / Part Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    // ✅ Category dropdown
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Main Incoming Breaker – MCCB / ACB / MCB', value: 'main_incoming_breaker' },
          { title: 'Isolator / Disconnect Switch', value: 'isolator' },
          { title: 'Busbars – Copper or Aluminum', value: 'busbars' },
          { title: 'Outgoing Breakers – MCBs / MCCBs', value: 'outgoing_breakers' },
          { title: 'Contactors – Motor / Load Control', value: 'contactors' },
          { title: 'Overload Relays – Motor Protection', value: 'overload_relays' },
          { title: 'Control Transformer / Power Supply', value: 'control_transformer' },
          { title: 'Current Transformers (CTs)', value: 'current_transformers' },
          { title: 'Meters – Voltmeter, Ammeter, Energy Meter', value: 'meters' },
          { title: 'Phase Sequence / Phase Failure Relays', value: 'phase_relays' },
          { title: 'Surge Protection Device (SPD)', value: 'surge_protection' },
          { title: 'Earth Leakage / RCCB', value: 'earth_leakage' },
          { title: 'Push Buttons & Selector Switches', value: 'push_buttons' },
          { title: 'Indicator Lamps / Pilot Lamps', value: 'indicator_lamps' },
          { title: 'Alarm Buzzer – Fault Indication', value: 'alarm_buzzer' },
          { title: 'Terminal Blocks – Organized Wiring', value: 'terminal_blocks' },
          { title: 'Wiring Ducts & Cables – Internal Wiring', value: 'wiring_ducts' },
          { title: 'Earthing Bar – Grounding Connection', value: 'earthing_bar' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),

    // ✅ Description
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),

    // ✅ Stock details
    defineField({
      name: 'quantity',
      title: 'Quantity in Stock',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'unit',
      title: 'Unit of Measure',
      type: 'string',
      options: {
        list: [
          { title: 'Pieces', value: 'pcs' },
          { title: 'Meters', value: 'm' },
          { title: 'Kilograms', value: 'kg' },
          { title: 'Set', value: 'set' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'reorderLevel',
      title: 'Reorder Level',
      type: 'number',
      description: 'Minimum stock level before reorder is required',
    }),
    defineField({
      name: 'status',
      title: 'Stock Status',
      type: 'string',
      options: {
        list: [
          { title: 'In Stock', value: 'in_stock' },
          { title: 'Low Stock', value: 'low_stock' },
          { title: 'Out of Stock', value: 'out_of_stock' },
        ],
        layout: 'dropdown',
      },
    }),

    // ✅ Location & Supplier
    defineField({ name: 'location', title: 'Storage Location / Rack No', type: 'string' }),
    defineField({ name: 'supplier', title: 'Supplier', type: 'string' }),
    defineField({ name: 'brand', title: 'Brand / Manufacturer', type: 'string' }),

    // ✅ Pricing
    defineField({
      name: 'price',
      title: 'Unit Price',
      type: 'number',
      description: 'Optional: Cost per unit',
    }),

    // ✅ Images (multiple)
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
      description: 'Upload multiple product images',
    }),

    // ✅ Attachments (Datasheet, Manual, etc.)
    defineField({
      name: 'attachments',
      title: 'Attachments (Datasheet / Manual)',
      type: 'array',
      of: [{ type: 'file' }],
    }),

    // ✅ Auto timestamp for reference
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'itemName',
      subtitle: 'sku',
      media: 'images.0',
    },
  },
})
