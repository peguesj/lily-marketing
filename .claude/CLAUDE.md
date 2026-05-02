# Lily Marketing Site — Astro 6 + React 19

**Project**: Lily AI Marketing Site
**Version**: v1.2.0
**Last Updated**: 2026-05-01
**Status**: Active Development — Phase MKT-2 shipped (glassmorphic frames + nav badges)

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
- `src/components/SiteNav.tsx` — Role-aware nav with product logos + ALPHA + WAITLIST OPEN badges
- `src/pages/index.astro` — Homepage wiring ProductTour + MobileAppShowcase

## Logo Asset Mapping

| Route | Icon Asset | Shows "Lily" Text | Product Name |
|-------|------------|-------------------|--------------|
| `/` (homepage) | `lily-wordmark-multi.png` | embedded in image | — |
| `/members` | `lily-icon-multi.png` | No (icon IS the mark) | "care" |
| `/practitioners` | `lily-icon-green.png` | Yes (JSX span) | "practice" |
| `/organizations` | `lily-icon-fullcolor.png` | Yes (JSX span) | "admin" |

## Deploy

```bash
# Build
npx astro build   # NOT npm run build (TinaCMS requires credentials)

# Deploy to production (rg-lily-ai-web / lively-plant)
TOKEN=$(az staticwebapp secrets list --name lily-marketing-site --resource-group rg-lily-ai-web --query 'properties.apiKey' -o tsv | tr -d '[:space:]')
/tmp/swa-cli/bin/swa deploy /Users/jeremiah/Developer/lily-marketing/dist --deployment-token "$TOKEN" --env production
# NOTE: Must use swa-cli v1.1.6 at /tmp/swa-cli/bin/swa — v2 rejects Azure tokens
```

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

### Phase MKT-2: Glassmorphic Frames + Nav Badges (2026-05-01)

- [x] **CP-MKT-008**: MobileAppShowcase app-frames glassmorphic — multi-stop sheen gradient, blur/saturate, hover lift, icon+text captions (US-MKT-008) [LILY-610]
- [x] **CP-MKT-009**: SiteNav role-specific product logos + ALPHA badge + animated WAITLIST OPEN badge (US-MKT-009) [LILY-611]
- After CP-MKT-009: All nav badges deployed to production; role-aware logos match Phoenix app reference

### Phase MKT-3: Custom Domains + SMTP Relay + TinaCMS (feat/custom-domains-smtp-relay)
_Plane: LILY-619..631 | Domains: asklily.health (canonical), ask-lily.io (301→canonical), lilycare.co (301→/members)_
_Formation: fmt-20260502-mkt3-domains-smtp | Branch: feat/custom-domains-smtp-relay_

#### Wave 1 — GoDaddy DNS records (concurrent, browser: jeremiah.pegues@gmail.com)
- [ ] **CP-MKT-010**: GoDaddy DNS — CNAME + TXT for asklily.health → Azure SWA (US-MKT-010) [LILY-619]
- [ ] **CP-MKT-011**: GoDaddy DNS — CNAME + TXT for ask-lily.io → Azure SWA (US-MKT-011) [LILY-620]
- [ ] **CP-MKT-019**: GoDaddy DNS — CNAME + TXT for lilycare.co → Azure SWA (US-MKT-019) [LILY-628]

#### Wave 2 — Azure SWA + code (concurrent with DNS propagation per G4=B)
- [ ] **CP-MKT-012**: Azure SWA — custom domain asklily.health, SSL provisioned (US-MKT-012) [LILY-621]
- [ ] **CP-MKT-013**: Azure SWA — custom domain ask-lily.io, SSL provisioned (US-MKT-013) [LILY-622]
- [ ] **CP-MKT-020**: Azure SWA — custom domain lilycare.co, SSL provisioned (US-MKT-020) [LILY-629]
- [ ] **CP-MKT-014**: astro.config.mjs site=asklily.health + staticwebapp.config.json 301 redirects (US-MKT-014) [LILY-623]
  - ask-lily.io/* → https://asklily.health/{rest}
  - lilycare.co/* → https://asklily.health/members/{rest}
- [ ] **CP-MKT-022**: TinaCMS TINA_CLIENT_ID + TINA_TOKEN → Azure SWA env vars (US-MKT-022) [LILY-631]

#### Wave 3 — SMTP relay + GWS domain verification
- [ ] **CP-MKT-015**: Google Workspace Admin — SMTP relay service enabled (US-MKT-015) [LILY-624] (profile: Jeremiah SSGT)
- [ ] **CP-MKT-016**: GoDaddy DNS — SPF/DKIM/DMARC records for safespacegt.com (US-MKT-016) [LILY-625] (profile: jeremiah.pegues@gmail.com)
- [ ] **CP-MKT-021**: Google Workspace Admin — add+verify asklily.health + ask-lily.io + lilycare.co (US-MKT-021) [LILY-630] (profile: Jeremiah SSGT)

#### Wave 4 — Verification (profile: alphonso.nathan@safespacegt.com)
- [ ] **CP-MKT-017**: Domain verification — asklily.health 200, ask-lily.io 301, lilycare.co→/members 301, SSL valid (US-MKT-017) [LILY-626]
- [ ] **CP-MKT-018**: SMTP relay test — email delivered, DKIM/SPF/DMARC pass (US-MKT-018) [LILY-627]
- After CP-MKT-018: All 3 domains live, SMTP relay operational, TinaCMS editing at asklily.health/admin

## CCEM APM

This project reports to CCEM APM at `http://localhost:3032`.
- **Session tracking**: Active (formation fmt-20260502-mkt3-domains-smtp)
- **Parent project**: lily-ai-phx

## Attribution Policy

Never include "Generated with Claude Code", "Co-Authored-By: Claude", or any AI/Claude attribution in:
- Pull request bodies or titles
- Commit messages
- Issue comments
- Any externally submitted content
