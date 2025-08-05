// schemas/jobApplication.ts

export default {
  name: 'jobApplication',
  type: 'document',
  title: 'Job Applications',
  fields: [
    { name: 'name', type: 'string', title: 'Name' },
    { name: 'email', type: 'string', title: 'Email' },
    { name: 'phone', type: 'string', title: 'Phone' },
    { name: 'company', type: 'string', title: 'Company' },
    { name: 'city', type: 'string', title: 'City' },
    { name: 'jobTitle', type: 'string', title: 'Job Title' },
    { name: 'comments', type: 'text', title: 'Comments' },
    {
      name: 'resume',
      type: 'file',
      title: 'Resume',
    },
  ],
}
