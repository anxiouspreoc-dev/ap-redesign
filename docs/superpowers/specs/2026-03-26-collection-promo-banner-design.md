# Collection Promo Banner Section — Design Spec
**Date:** 2026-03-26
**Status:** Approved

## Overview

A new custom Shopify section (`sections/collection-promo-banner.liquid`) that renders a 3-column promotional banner: a text panel on the left, and two lifestyle image cells on the right, each with a circular cart-icon link button. All content is configured in the Shopify theme customizer.

## Goals

- Replace the `banner-grid` sections in `templates/list-collections.json` with a purpose-built section that is simpler to configure and produces the intended layout reliably
- Text panel: heading, body text, CTA button (label + link) — all on a configurable color scheme
- Image cells: image picker + a cart-icon link that navigates to any configured URL
- Fully customizer-managed, zero JavaScript required

## Layout

Desktop: CSS grid with `grid-template-columns: 2fr 1fr 1fr` — text panel takes ~50%, each image cell takes ~25%.

Mobile: Stacked vertically (single column). Text panel first, then image 1, then image 2.

The section uses the theme's existing `container container--max` and `padding--section` patterns for consistent spacing.

## File

**Create:** `sections/collection-promo-banner.liquid`

No other files created or modified.

## Section Settings

| Setting ID | Type | Description |
|---|---|---|
| `heading` | `text` | Heading text for the text panel |
| `text` | `richtext` | Body copy for the text panel |
| `button_label` | `text` | CTA button label (e.g. "Load to bag") |
| `button_link` | `url` | CTA button destination URL |
| `image_1` | `image_picker` | Left lifestyle image |
| `image_1_link` | `url` | URL the cart icon on image 1 links to |
| `image_2` | `image_picker` | Right lifestyle image |
| `image_2_link` | `url` | URL the cart icon on image 2 links to |
| `color_scheme` | `color_scheme` | Color scheme for the text panel background/text |
| `padding_top` | `select` | Section top padding (standard theme options) |
| `padding_bottom` | `select` | Section bottom padding |

## Components

### Text Panel
- Renders `heading` as an `<h2>`
- Renders `text` as richtext (via `{{ section.settings.text }}`  )
- Renders a CTA button as `<a href="{{ section.settings.button_link }}" class="button button--primary">{{ section.settings.button_label }}</a>`
- Background and text color driven by `color_scheme` setting using `render 'color-scheme-attributes'`

### Image Cells (×2)
- Renders the image using `render 'image'` (theme snippet) with lazy loading and responsive `sizes`
- Overlays a circular cart-icon link button (`<a>`) anchored to the bottom-right corner using absolute positioning
- The link button uses `class="button button--primary button--square"` — matching the existing quick-add button visual on product cards
- The cart icon renders via `render 'icon', icon: 'bag'` (or whichever icon `settings.quick_add_button_icon` resolves to — use `settings.quick_add_button_icon` directly for consistency)
- If no image is set, renders the theme placeholder via `placeholder_svg_tag`
- If no link is set, the cart icon button is not rendered

## Template Update

After the section is created, update `templates/list-collections.json` to replace the two `banner-grid` section entries (`banner-grid-1`, `banner-grid-2`) with two `collection-promo-banner` sections (`promo-banner-1`, `promo-banner-2`), preserving the same position in the `order` array.

The two `banner-grid` keys are removed from `sections` and `order`. The `sections/banner-grid.liquid` file itself is not deleted.

## Out of Scope

- Add-to-cart AJAX functionality — the cart icon is a plain link only
- Video support in image cells
- Mobile-specific image overrides
- More than 2 image cells
