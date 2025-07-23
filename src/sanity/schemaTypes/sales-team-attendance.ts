import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'attendance',
  title: 'Attendance Record',
  type: 'document',
  fields: [
    defineField({
      name: 'employee',
      title: 'Employee',
      type: 'object',
      fields: [
        defineField({
          name: 'name',
          title: 'Name',
          type: 'string',
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'id',
          title: 'Employee ID',
          type: 'string',
          validation: (Rule) => Rule.required()
        })
      ],
      validation: (Rule) => Rule.required()
    }),

    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Attendance Status',
      type: 'string',
      options: {
        list: [
          { title: 'Present', value: 'present' },
          { title: 'Absent', value: 'absent' },
          { title: 'Late', value: 'late' },
          { title: 'On Leave', value: 'on_leave' },
          { title: 'Half Day', value: 'half_day' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'checkIn',
      title: 'Check In Time',
      type: 'datetime',
      options: { dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', timeStep: 5 },
    }),

    defineField({
      name: 'checkOut',
      title: 'Check Out Time',
      type: 'datetime',
      options: { dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', timeStep: 5 },
    }),

    defineField({
      name: 'captureLocation',
      title: 'Capture Location',
      type: 'boolean',
      initialValue: true,
      description: 'Whether to capture location data for this attendance record',
    }),

    defineField({
      name: 'location',
      title: 'Location Data',
      type: 'object',
      fields: [
        defineField({
          name: 'address',
          title: 'Formatted Address',
          type: 'string',
          description: 'Human-readable address from geocoding service'
        }),
        defineField({
          name: 'coordinates',
          title: 'GPS Coordinates',
          type: 'geopoint',
          description: 'Latitude and longitude of the location'
        })
      ],
      hidden: ({ parent }) => !parent?.captureLocation
    }),

    defineField({
      name: 'notes',
      title: 'Additional Notes',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'verified',
      title: 'Verified',
      type: 'boolean',
      initialValue: false,
      description: 'Whether the attendance has been verified by HR',
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When this record was published',
      initialValue: (new Date()).toISOString()
    })
  ],

  preview: {
    select: {
      name: 'employee.name',
      date: 'date',
      status: 'status',
      location: 'location.address'
    },
    prepare(selection) {
      const { name, date, status, location } = selection
      return {
        title: `${name || 'Unknown employee'} - ${date || 'No date'}`,
        subtitle: `${status || 'unknown'}${location ? ` (${location})` : ''}`
      }
    },
  },
})