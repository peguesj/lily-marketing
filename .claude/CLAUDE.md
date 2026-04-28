# Lily Marketing Site — Astro 6 + React 19

**Project**: Lily AI Marketing Site
**Version**: v1.1.0
**Last Updated**: 2026-04-28
**Status**: Active Development — Phase MKT-1 shipped (design handoff v11 parity)

## Project Overview

The `lily-marketing` project is the public-facing marketing site for Lily AI, built with:

- **Framework**: Astro 6 (SSG + partial hydration)
- **UI Components**: React 19 (client:load islands)
- **Styling**: Tailwind CSS v4 + custom Lily design tokens
- **CMS**: TinaCMS (content management)
- **Deploy**: Azure Static Web Apps (production), Vercel (preview)

**Repository**: `/Users/jeremiah/Developer/lily-marketing`
**Submodule of**: `/Users/jeremiah/Developer/lily-ai-phx` (lily-ai-phx/lily-marketing)

## Plane Project

- **Workspace**: LGTM (`https://plane.lgtm.build`)
- **Project**: Lily AI (shared with lily-ai-phx)
- **Identifier**: LILY
- **Project ID**: `2b6977ee-89fa-4540-9f6c-bdc3d225aadf`
- **API Base**: `https://plane.lgtm.build/api/v1/workspaces/lgtm/projects/2b6977ee-89fa-4540-9f6c-bdc3d225aadf`
- **State IDs**: Backlog=`daf1090f-efd3-4292-aee9-03127879e44e`, Todo=`dd8a40bb-8fda-49c8-93fc-0142ac692b3f`, In Progress=`80dfaa60-5347-4a73-bea2-9d1a435a9d27`, Done=`b2e9af02-812b-4ca9-8a4a-4f60a6eedfe4`

## Build & Deploy Instructions

```bash
# Install dependencies
npm install

# Start dev server (localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

## Design System Constraints

1. **Colors**: HSL semantic tokens from Lily design system (same as lily-ai-phx)
2. **Border Radius**: Max 30px
3. **Fonts**: Space Grotesk (sans), RST Thermal (body/heading/display), Playfair Display (brand)
4. **Glassmorphism**: `.glass`, `.glass-dark`, `.glass-primary` utility classes
5. **Orbit Component**: Badge ring animates; center photo stays static
6. **Mobile-First**: Always start with mobile breakpoints
7. **Accessibility**: WCAG AAA (7:1 contrast)

## Design Reference

Design handoff files are in `design-reference/` directory:
- `07-mobile.jsx` — MobileAppShowcase reference
- `08-tour.jsx` — ProductTour reference
- `v11/` — Latest design system tokens and component specs

## Key Components

- `src/components/Orbit.tsx` — Affinity orbit animation (badge ring only)
- `src/components/ProductTour.tsx` — 14-tile feature slideshow with keyboard nav
- `src/components/MobileAppShowcase.tsx` — 3 phone-frame mockup section
- `src/components/SiteFooter.tsx` — Footer with social links
- `src/components/Icon.tsx` — Icon component (arrow-left, arrow-right, x, building, phone, +more)
- `src/pages/index.astro` — Homepage wiring ProductTour + MobileAppShowcase

## Implementation Checkpoints

### Phase MKT-1: Design Handoff v11 Parity (2026-04-28)

- [x] **CP-MKT-001**: LinkedIn URL corrected in footer (US-MKT-001) [LILY-603]
- [x] **CP-MKT-002**: Icon component extended with 5 new icons (US-MKT-002) [LILY-604]
- [x] **CP-MKT-003**: MobileAppShowcase component ported from 07-mobile.jsx (US-MKT-003) [LILY-605]
- [x] **CP-MKT-004**: ProductTour component ported from 08-tour.jsx (US-MKT-004) [LILY-606]
- [x] **CP-MKT-005**: Homepage wired with ProductTour + MobileAppShowcase (US-MKT-005) [LILY-607]
- [x] **CP-MKT-006**: ProductTour reveal opacity fix (remove .reveal class dependency) (US-MKT-006) [LILY-608]
- [x] **CP-MKT-007**: Orbit badge-ring-only animation (photo stays static) (US-MKT-007) [LILY-609]
- After CP-MKT-007: All design handoff v11 gaps resolved, homepage sections live

## CCEM APM

This project reports to CCEM APM at `http://localhost:3032`.
- **Session tracking**: Active (formation fmt-20260428-lily-mktg-v2)
- **Parent project**: lily-ai-phx

## Attribution Policy

Never include "Generated with Claude Code", "Co-Authored-By: Claude", or any AI/Claude attribution in:
- Pull request bodies or titles
- Commit messages
- Issue comments
- Any externally submitted content
