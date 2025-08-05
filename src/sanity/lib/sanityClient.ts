// import { createClient } from 'next-sanity'

// // ✅ Primary Sanity Client (used for other CMS data)
// export const sanityClient = createClient({
//   projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
//   dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
//   apiVersion: '2023-01-01',
//   useCdn: false,
// })

// // ✅ Second Sanity Client (used for job applications)
// export const sanityClientSecond = createClient({
//   projectId: process.env.NEXT_PUBLIC_SECOND_SANITY_PROJECT_ID!,
//   dataset: process.env.NEXT_PUBLIC_SECOND_SANITY_DATASET!,
//   apiVersion: '2023-01-01',
//   useCdn: false,
//   token: process.env.SECOND_SANITY_API_TOKEN, // 🔐 needed for fetching private data
// })
