# Collection List Page Redesign — Design Spec
**Date:** 2026-03-26
**Status:** Approved

## Overview

Replace the `/collections` page from a simple collection-tile grid to a richer editorial layout that showcases products grouped by collection, with promo banners between each group. All content is managed entirely via the Shopify theme customizer.

## Goals

- Show products per collection on the `/collections` page (instead of collection thumbnails)
- Insert configurable promotional banners between collection groups
- Reuse existing Primavera theme sections and blocks wherever possible — no new Liquid files
- Full Shopify customizer control over all content, copy, images, and color schemes

## What Changes

### `templates/list-collections.json`

This is the only file that changes. It is rewritten to replace the single `main-list-collections` section with 5 stacked sections in the following order:

```
1. featured-collection    → Collection group #1 (e.g. Oversized Bags)
2. banner-grid            → Promo banner #1
3. featured-collection    → Collection group #2 (e.g. Mid Bags)
4. banner-grid            → Promo banner #2
5. featured-collection    → Collection group #3 (e.g. Clutch Bags)
```

The `main-list-collections` section is removed entirely. No Liquid section or block files are created or modified.

## Section Configuration Details

### Featured Collection sections (×3)

**Section type:** `featured-collection`

| Setting | Value |
|---|---|
| `layout_desktop` | `grid` (not slideshow) |
| `columns_desktop` | `4` |
| `columns_mobile` | `2` |
| `product_limit` | `4` (configurable per section) |
| `container_type` | `max` |

**Blocks:**
- `_section-header` (static): heading = collection name, text = playful tagline for that collection
- `button-group` (static): optional "View all" CTA button linking to the individual collection page

The merchant selects the collection from the customizer's collection picker. Each of the 3 sections is independently configured.

### Banner Grid sections (×2)

**Section type:** `banner-grid`

Contains 3 `_banner-grid-item` blocks arranged in a `2 + 1 + 1` column layout on desktop, stacking vertically on mobile.

The `banner-grid` section renders on a 4-column desktop grid (`repeat(4, 1fr)`) and a 2-column mobile grid. Set the following `_banner-grid-item` values for the `2 + 1 + 1` layout:

| Block | `column_desktop` | `row_desktop` | `column_mobile` | `row_mobile` |
|---|---|---|---|---|
| Text panel (left) | `2` | `2` | `2` | `1` |
| Lifestyle image #1 | `1` | `1` | `1` | `1` |
| Lifestyle image #2 | `1` | `1` | `1` | `1` |

**Static `_section-header` block (always present in banner-grid):**
Leave all fields blank (heading, subheading, text). If left at preset defaults it will render unwanted heading text above the promo panel.

**Block 1 — Text panel (left, 2 cols wide):**
- Type: `_banner-grid-item` → contains `_grid-image-banner`
- No image set — color scheme provides the background
- Blocks inside `_grid-image-banner`: `heading-group` (title + body text) + `button-group` (CTA pill button)
- Merchant configures: headline, body copy, button label + link, color scheme

**Blocks 2 & 3 — Lifestyle images (1 col each):**
- Type: `_banner-grid-item` → contains `_grid-image-banner`
- Image set to a lifestyle product photo
- No text overlay
- Merchant configures: image upload per cell

## SEO Considerations

The current template sets `page_title: true` on its `_section-header` block, rendering the `<h1>` for the `/collections` page. In the new template, set `page_title: false` on all `_section-header` blocks within the three `featured-collection` sections (collection names are not appropriate H1s for the `/collections` URL). Add a standalone `section-header` section as the first section in the template, configured with `page_title: true` and a heading of "Collections" (or equivalent), to preserve the page H1 for SEO.

Updated section order in `list-collections.json`:

```
1. section-header          → Page title ("Collections"), page_title: true
2. featured-collection     → Collection group #1
3. banner-grid             → Promo banner #1
4. featured-collection     → Collection group #2
5. banner-grid             → Promo banner #2
6. featured-collection     → Collection group #3
```

## What Is NOT Changing

- `card-product` snippet — existing product cards are used as-is
- `sections/main-list-collections.liquid` — the file is retained, it is simply no longer referenced by this template
- Any other section or block Liquid files — zero modifications
- Collection pages, header, footer, or any other templates

## Customizer Setup (after deployment)

The merchant must configure each section in the Shopify theme editor:

1. **Featured Collection sections:** select the target collection, set heading/tagline, optionally set button label + link
2. **Banner Grid sections:** upload lifestyle images for the two image cells; set copy + button for the text panel; pick a color scheme for the text panel background

## Out of Scope

- Filtering or sorting on the collections page
- "Load more" / pagination within collection groups
- Auto-populating collections dynamically — the 3 collection groups are manually configured
- Mobile-specific layout changes beyond the grid column settings already built into the sections
