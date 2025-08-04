import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

export async function GET() {
  try {
    const query = `*[_type == "password"]{ role, password }`
    const passwords = await client.fetch(query)
    return NextResponse.json(passwords)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch passwords' },
      { status: 500 }
    )
  }
}