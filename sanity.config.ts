import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import { codeInput } from '@sanity/code-input'
import { colorInput } from '@sanity/color-input'

// ✅ Environment variables
import { apiVersion, dataset, projectId } from './src/sanity/env'

// ✅ Your schema & custom structure
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title: 'My Sanity Studio',
  schema,

  plugins: [
    structureTool({
      structure,
      defaultDocumentNode: (S, { schemaType }) => {
        if (schemaType === 'post') {
          return S.document().views([S.view.form()])
        }
        return S.document().views([S.view.form()])
      },
    }),

    visionTool({ defaultApiVersion: apiVersion }),

    // ✅ Removed media() and unsplashImageAsset()
    // ✅ Only keeping stable plugins
    codeInput(),
    colorInput(),
  ],

  tools: (prev) => {
    if (process.env.NODE_ENV === 'production') {
      return prev.filter((tool) => tool.name !== 'vision')
    }
    return prev
  },
})
