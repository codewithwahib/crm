import { createClient } from '@sanity/client'

// ✅ Environment validation
const requiredEnvVars = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  writeToken: process.env.SANITY_API_TOKEN, // Using SANITY_API_TOKEN as per your setup
}

// Check for missing environment variables
export const checkWritePermissions = (): string | null => {
  if (!requiredEnvVars.projectId) {
    return 'NEXT_PUBLIC_SANITY_PROJECT_ID is missing'
  }
  if (!requiredEnvVars.dataset) {
    return 'NEXT_PUBLIC_SANITY_DATASET is missing'
  }
  if (!requiredEnvVars.writeToken) {
    return 'SANITY_API_TOKEN is missing - writing disabled'
  }
  return null
}

// ✅ READ-ONLY CLIENT (Fast, cached)
export const client = createClient({
  projectId: requiredEnvVars.projectId!,
  dataset: requiredEnvVars.dataset!,
  apiVersion: '2024-07-01',
  useCdn: true,
})

// ✅ WRITE-ENABLED CLIENT (For create, update, delete)
export const writeClient = createClient({
  projectId: requiredEnvVars.projectId!,
  dataset: requiredEnvVars.dataset!,
  apiVersion: '2024-07-01',
  token: requiredEnvVars.writeToken,
  useCdn: false, // MUST disable CDN for writes
})

// ✅ Test connection function
export const testSanityConnection = async () => {
  try {
    const data = await client.fetch('*[_type == "outwardChallan"][0...0]')
    return { success: true, data }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: errorMessage,
      details: 'Check projectId and dataset'
    }
  }
}

// ✅ Test write permissions
export const testWritePermissions = async () => {
  if (!requiredEnvVars.writeToken) {
    return { success: false, error: 'No write token configured' }
  }
  
  try {
    // Try to fetch with write client (tests authentication)
    const data = await writeClient.fetch('*[_type == "outwardChallan"][0...0]')
    return { success: true, data }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: errorMessage,
      details: 'Check SANITY_API_TOKEN permissions'
    }
  }
}

// ✅ Helper function to check if we can write
export const canWrite = () => {
  return !!requiredEnvVars.writeToken;
}