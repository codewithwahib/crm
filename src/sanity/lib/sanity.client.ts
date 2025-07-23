// lib/sanity.client.ts
import { createClient } from 'next-sanity'

// ✅ Check envs
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local')
}
if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET in .env.local')
}
if (!process.env.SANITY_WRITE_TOKEN) {
  console.warn('⚠️ SANITY_WRITE_TOKEN is missing. Writes will fail.')
}

// ✅ Read-only client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-07-01',
  useCdn: true,
})

// ✅ Write-enabled client
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-07-01',
  token: process.env.SANITY_WRITE_TOKEN, // ✅ must have Editor access
  useCdn: false,
})
