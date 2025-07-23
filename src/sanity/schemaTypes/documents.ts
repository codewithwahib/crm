import { defineType, defineField } from "sanity";

export default defineType({
  name: "documentFile",
  title: "Documents",
  type: "document",
  fields: [
    // ✅ Document Title
    defineField({
      name: "title",
      title: "Document Title",
      type: "string",
      validation: (Rule) =>
        Rule.required().error("⚠️ A title is required for this document"),
    }),

    // ✅ Document Type with Validation
    defineField({
      name: "documentType",
      title: "Document Type",
      type: "string",
      options: {
        list: [
          { title: "Invoice", value: "Invoice" },
          { title: "Contract", value: "Contract" },
          { title: "Report", value: "Report" },
          { title: "Quotation", value: "Quotation" },
          { title: "Other", value: "Other" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) =>
        Rule.required().error("⚠️ Please select a document type"),
    }),

    // ✅ Optional Customer Link
    defineField({
      name: "relatedCustomer",
      title: "Related Customer",
      type: "string",
      description: "Optional - Link this document to a specific customer",
    }),

    // ✅ Optional Project Link
    defineField({
      name: "relatedProject",
      title: "Related Project",
      type: "string",
      description: "Optional - Link this document to a specific project",
    }),

    // ✅ File Upload
    defineField({
      name: "uploadedFile",
      title: "Upload Document",
      type: "file",
      options: {
        storeOriginalFilename: true, // ✅ Keeps original filename for download
      },
      validation: (Rule) =>
        Rule.required().error("⚠️ You must upload a document file"),
    }),

    // ✅ Uploader Name
    defineField({
      name: "uploadedBy",
      title: "Uploaded By",
      type: "string",
      description: "Optional - Name of the person who uploaded",
    }),

    // ✅ Uploaded Date (auto-filled)
    defineField({
      name: "uploadedDate",
      title: "Uploaded Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),

    // ✅ Notes
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
    }),
  ],

  // ✅ Better preview in Studio
  preview: {
    select: {
      title: "title",
      subtitle: "documentType",
      media: "uploadedFile",
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: title || "Untitled Document",
        subtitle: subtitle ? `Type: ${subtitle}` : "No type selected",
        media: selection.media,
      }
    },
  },

  // ✅ Ordering options in Studio
  orderings: [
    {
      title: "Latest Uploads",
      name: "uploadedDateDesc",
      by: [{ field: "uploadedDate", direction: "desc" }],
    },
    {
      title: "Oldest Uploads",
      name: "uploadedDateAsc",
      by: [{ field: "uploadedDate", direction: "asc" }],
    },
  ],
})
