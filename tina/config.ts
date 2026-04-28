import { defineConfig } from "tinacms";

export default defineConfig({
  branch: process.env.TINA_BRANCH || process.env.HEAD || "main",
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "page",
        label: "Pages",
        path: "src/content/pages",
        format: "mdx",
        fields: [
          { type: "string", name: "title", label: "Title", required: true },
          { type: "string", name: "description", label: "SEO Description" },
          { type: "string", name: "heroTitle", label: "Hero Title" },
          { type: "string", name: "heroSubtitle", label: "Hero Subtitle" },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
        ],
      },
      {
        name: "testimonial",
        label: "Testimonials",
        path: "src/content/testimonials",
        format: "json",
        fields: [
          { type: "string", name: "quote", label: "Quote", required: true },
          { type: "string", name: "name", label: "Name", required: true },
          { type: "string", name: "role", label: "Role" },
          { type: "string", name: "initials", label: "Initials" },
          { type: "string", name: "avatarTone", label: "Avatar Tone" },
        ],
      },
      {
        name: "pricing",
        label: "Pricing Tiers",
        path: "src/content/pricing",
        format: "json",
        fields: [
          { type: "string", name: "tier", label: "Tier Name", required: true },
          { type: "string", name: "audience", label: "Audience" },
          { type: "string", name: "price", label: "Price Display" },
          { type: "string", name: "description", label: "Description" },
          {
            type: "object",
            name: "features",
            label: "Features",
            list: true,
            fields: [{ type: "string", name: "text", label: "Feature Text" }],
          },
        ],
      },
      {
        name: "faq",
        label: "FAQ",
        path: "src/content/faq",
        format: "json",
        fields: [
          {
            type: "string",
            name: "question",
            label: "Question",
            required: true,
          },
          {
            type: "string",
            name: "answer",
            label: "Answer",
            required: true,
            ui: { component: "textarea" },
          },
          { type: "string", name: "page", label: "Page" },
        ],
      },
    ],
  },
});
