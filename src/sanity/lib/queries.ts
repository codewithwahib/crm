// lib/queries.ts

export const jobApplicationsQuery = `
  *[_type == "jobApplication"] | order(submittedAt desc) {
    _id,
    name,
    email,
    phone,
    company,
    city,
    jobTitle,
    comments,
    resumeUrl,
    submittedAt
  }
`
