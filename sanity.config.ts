import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import { codeInput } from '@sanity/code-input'
import { colorInput } from '@sanity/color-input'

// Schema imports
import { schema } from '@/sanity/schemaTypes'
import { structure } from '@/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId: 'tdxwiwgi',
  dataset: 'production',
  title: 'Sanity Studio',
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool(),
    codeInput(),
    colorInput()
  ],
  auth: {
    // If using custom auth
    mode: 'replace',
    redirectOnSingle: true,
    providers: () => []
  }
})