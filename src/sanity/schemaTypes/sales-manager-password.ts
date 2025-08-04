import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'salesManagerPassword',
  title: 'Sales Manager Password',
  type: 'document',
  fields: [
    defineField({
      name: 'password',
      title: 'Password',
      type: 'string',
      validation: (Rule) => Rule.required()
    })
  ]
});
