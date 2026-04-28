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
      // ── Site Settings ──────────────────────────────
      {
        name: "settings",
        label: "Site Settings",
        path: "src/content/settings",
        format: "json",
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "siteName", label: "Site Name" },
          { type: "string", name: "siteUrl", label: "Site URL" },
          { type: "string", name: "tagline", label: "Tagline" },
          { type: "string", name: "footerMission", label: "Footer Mission Text" },
          { type: "string", name: "footerDescription", label: "Footer Description", ui: { component: "textarea" } },
        ],
      },

      // ── Page Content ───────────────────────────────
      {
        name: "page",
        label: "Pages",
        path: "src/content/pages",
        format: "json",
        fields: [
          { type: "string", name: "title", label: "Page Title", required: true },
          { type: "string", name: "description", label: "SEO Description", ui: { component: "textarea" } },
          { type: "string", name: "keywords", label: "SEO Keywords" },
          { type: "string", name: "heroEyebrow", label: "Hero Eyebrow" },
          { type: "string", name: "heroTitle", label: "Hero Title", required: true },
          { type: "string", name: "heroSubtitle", label: "Hero Subtitle", ui: { component: "textarea" } },
          {
            type: "object",
            name: "sections",
            label: "Content Sections",
            list: true,
            fields: [
              { type: "string", name: "id", label: "Section ID" },
              { type: "string", name: "eyebrow", label: "Eyebrow" },
              { type: "string", name: "heading", label: "Heading" },
              { type: "string", name: "body", label: "Body", ui: { component: "textarea" } },
              { type: "string", name: "style", label: "Style (default, cream, dark)" },
            ],
          },
          {
            type: "object",
            name: "features",
            label: "Feature Cards",
            list: true,
            fields: [
              { type: "string", name: "icon", label: "Icon Name" },
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "body", label: "Body", ui: { component: "textarea" } },
              { type: "string", name: "link", label: "Link URL" },
              { type: "string", name: "linkText", label: "Link Text" },
            ],
          },
          {
            type: "object",
            name: "stats",
            label: "Stats",
            list: true,
            fields: [
              { type: "string", name: "value", label: "Value" },
              { type: "string", name: "label", label: "Label" },
            ],
          },
          {
            type: "object",
            name: "cta",
            label: "CTA Band",
            fields: [
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "subtitle", label: "Subtitle" },
              { type: "string", name: "primaryLabel", label: "Primary Button Label" },
              { type: "string", name: "primaryHref", label: "Primary Button URL" },
              { type: "string", name: "secondaryLabel", label: "Secondary Button Label" },
              { type: "string", name: "secondaryHref", label: "Secondary Button URL" },
            ],
          },
        ],
      },

      // ── Testimonials ───────────────────────────────
      {
        name: "testimonial",
        label: "Testimonials",
        path: "src/content/testimonials",
        format: "json",
        fields: [
          { type: "string", name: "quote", label: "Quote", required: true, ui: { component: "textarea" } },
          { type: "string", name: "name", label: "Name", required: true },
          { type: "string", name: "role", label: "Role" },
          { type: "string", name: "initials", label: "Initials" },
          { type: "string", name: "avatarTone", label: "Avatar Tone" },
          { type: "string", name: "page", label: "Show on Page" },
        ],
      },

      // ── Pricing Tiers ──────────────────────────────
      {
        name: "pricing",
        label: "Pricing Tiers",
        path: "src/content/pricing",
        format: "json",
        fields: [
          { type: "string", name: "tier", label: "Tier Name", required: true },
          { type: "string", name: "audience", label: "Audience" },
          { type: "string", name: "price", label: "Price Display" },
          { type: "string", name: "unit", label: "Price Unit" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "note", label: "Note", ui: { component: "textarea" } },
          { type: "string", name: "section", label: "Section (members, organizations, practitioners)" },
          { type: "number", name: "order", label: "Display Order" },
          { type: "boolean", name: "featured", label: "Featured Tier" },
          { type: "string", name: "featuredLabel", label: "Featured Label (e.g. Most picked)" },
          { type: "string", name: "ctaLabel", label: "CTA Button Label" },
          { type: "string", name: "ctaHref", label: "CTA Button URL" },
          { type: "string", name: "ctaKind", label: "CTA Kind (primary, ghost)" },
          {
            type: "object",
            name: "features",
            label: "Features",
            list: true,
            fields: [{ type: "string", name: "text", label: "Feature Text" }],
          },
        ],
      },

      // ── FAQ ────────────────────────────────────────
      {
        name: "faq",
        label: "FAQ",
        path: "src/content/faq",
        format: "json",
        fields: [
          { type: "string", name: "question", label: "Question", required: true },
          { type: "string", name: "answer", label: "Answer", required: true, ui: { component: "textarea" } },
          { type: "string", name: "page", label: "Show on Page" },
          { type: "number", name: "order", label: "Display Order" },
        ],
      },

      // ── Blog Posts ─────────────────────────────────
      {
        name: "blog",
        label: "Blog Posts",
        path: "src/content/blog",
        format: "mdx",
        fields: [
          { type: "string", name: "title", label: "Title", required: true },
          { type: "string", name: "excerpt", label: "Excerpt", ui: { component: "textarea" } },
          { type: "string", name: "author", label: "Author" },
          { type: "datetime", name: "date", label: "Publish Date" },
          { type: "string", name: "category", label: "Category" },
          { type: "image", name: "coverImage", label: "Cover Image" },
          { type: "boolean", name: "published", label: "Published" },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
        ],
      },

      // ── Team Members ───────────────────────────────
      {
        name: "team",
        label: "Team",
        path: "src/content/team",
        format: "json",
        fields: [
          { type: "string", name: "name", label: "Name", required: true },
          { type: "string", name: "role", label: "Role" },
          { type: "string", name: "bio", label: "Bio", ui: { component: "textarea" } },
          { type: "string", name: "initials", label: "Initials" },
          { type: "string", name: "avatarTone", label: "Avatar Tone" },
          { type: "image", name: "photo", label: "Photo" },
          { type: "string", name: "linkedin", label: "LinkedIn URL" },
          { type: "number", name: "order", label: "Display Order" },
        ],
      },

      // ── Open Roles ─────────────────────────────────
      {
        name: "career",
        label: "Open Roles",
        path: "src/content/careers",
        format: "json",
        fields: [
          { type: "string", name: "title", label: "Job Title", required: true },
          { type: "string", name: "department", label: "Department" },
          { type: "string", name: "location", label: "Location" },
          { type: "string", name: "type", label: "Type (Full-time, Part-time, Contract)" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "applyUrl", label: "Apply URL" },
          { type: "boolean", name: "active", label: "Active" },
          { type: "number", name: "order", label: "Display Order" },
        ],
      },

      // ── Legal Pages ────────────────────────────────
      {
        name: "legal",
        label: "Legal Pages",
        path: "src/content/legal",
        format: "mdx",
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "title", label: "Title", required: true },
          { type: "string", name: "lastUpdated", label: "Last Updated" },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
        ],
      },
    ],
  },
});
