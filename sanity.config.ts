'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { codeInput } from '@sanity/code-input'
import { colorInput } from '@sanity/color-input'
import { dashboardTool } from '@sanity/dashboard'
import { netlifyWidget } from 'sanity-plugin-dashboard-widget-netlify'

// Environment variables
import { apiVersion, dataset, projectId } from './src/sanity/env'
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
          return S.document().views([
            S.view.form(),
            // Remove the JSX preview component
            // Or replace with a plain object if needed
          ])
        }
        return S.document().views([S.view.form()])
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
    media(),
    unsplashImageAsset(),
    codeInput(),
    colorInput(),
    dashboardTool({
      widgets: [
        netlifyWidget({
          title: 'Netlify Deploy',
          sites: [
            {
              title: 'Website',
              apiId: process.env.SANITY_STUDIO_NETLIFY_API_ID,
              buildHookId: process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK,
              name: 'my-site',
              url: 'https://my-site.netlify.app',
            },
          ],
        }),
      ],
    }),
  ],
  tools: (prev) => {
    if (process.env.NODE_ENV === 'production') {
      return prev.filter((tool) => tool.name !== 'vision')
    }
    return prev
  },
})