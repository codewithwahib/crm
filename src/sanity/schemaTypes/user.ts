// import { defineType, defineField } from 'sanity'

// export default defineType({
//   name: 'user',
//   title: 'User',
//   type: 'document',
//   fields: [
//     defineField({
//       name: 'username',
//       title: 'Username',
//       type: 'string',
//       validation: Rule => Rule.required().min(3).max(50)
//     }),
//     defineField({
//       name: 'password',
//       title: 'Password (hashed)',
//       type: 'string',
//       validation: Rule => Rule.required()
//     }),
//     defineField({
//       name: 'role',
//       title: 'Role',
//       type: 'string',
//       options: {
//         list: [
//           { title: 'Director', value: 'director' },
//           { title: 'GM Sales', value: 'gm_sales' },
//           { title: 'Sales Manager', value: 'sales_manager' },
//           { title: 'Execution', value: 'execution' },
//           { title: 'Mechanical', value: 'mechanical' },
//           { title: 'Store', value: 'store' },
//         ]
//       },
//       validation: Rule => Rule.required()
//     }),
//     defineField({
//       name: 'fullName',
//       title: 'Full Name',
//       type: 'string',
//       validation: Rule => Rule.required()
//     })
//   ]
// })
