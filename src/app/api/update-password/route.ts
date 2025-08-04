import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2023-08-01',
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const { role, password } = await req.json();

    if (!role || !password) {
      return NextResponse.json({ error: 'Missing role or password' }, { status: 400 });
    }

    // Define document type map based on role
    const docTypeMap: Record<string, string> = {
      director: 'directorPassword',
      'gm-sales': 'gmSalesPassword',
      'sales-manager': 'salesManagerPassword',
      execution: 'executionPassword',
      mechanical: 'mechanicalPassword',
      store: 'storePassword',
    };

    const docType = docTypeMap[role];

    if (!docType) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Fetch the existing document
    const query = `*[_type == "${docType}"][0]{_id}`;
    const existingDoc = await client.fetch(query);

    if (!existingDoc?._id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update the password
    await client.patch(existingDoc._id).set({ password }).commit();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
