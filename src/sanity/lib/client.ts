import { createClient } from 'next-sanity'

// ✅ Required environment checks (helps debug missing .env)
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local')
}
if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error('❌ Missing NEXT_PUBLIC_SANITY_DATASET in .env.local')
}

// ✅ READ-ONLY CLIENT (Fast, cached)
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-07-01',
  useCdn: true, // ✅ Uses CDN for faster GET requests
})

// ✅ WRITE-ENABLED CLIENT (For create, update, delete)
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-07-01',
  token: process.env.SANITY_WRITE_TOKEN, // ✅ Secure Write Token
  useCdn: false, // ✅ MUST disable CDN for writes
})
