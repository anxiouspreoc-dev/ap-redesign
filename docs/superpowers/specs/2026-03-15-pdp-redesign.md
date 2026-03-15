# PDP Redesign — Design Spec
Date: 2026-03-15

## Overview

Implement the Figma-designed product detail page (PDP) for Anxious Preoccupied's Shopify theme. The work covers reconfiguring `product.json`, creating two new PDP blocks, creating two new PDP sections, and advising on metafields to create in Shopify admin.

Reviews section (stars + review list) are handled entirely by the Judge.me widget and are out of scope.

---

## Brand Colors (from `settings_data.json`)

| Name | Hex | Usage |
|---|---|---|
| Hot pink | `#ff0064` | "SHOP NOW" links, headings, badge outlines, star ratings |
| Dark purple | `#5d006e` | Add to Cart button, "MORE REVIEWS" button |
| Bright green | `#00ff00` | Quick-add circle buttons on product cards |
| White | `#ffffff` | Page background, card backgrounds |
| Black | `#000000` | Body text, product titles, prices |
| Cream | `#fff7ec` | Pre-order pill background (scheme-5) |
| Lavender | `#ede5f4` | Behind the Bag right-panel background (custom, not in a scheme) |

The main product info panel already uses color scheme `scheme-b24726de-3ead-4723-beaa-1fb283066b3f`:
- Primary button (`#5d006e`) = Add to Cart
- Exception color (`#ff0064`) = accent/links
- Secondary button (`#ff0064`) = used for outlined/text actions

---

## Page Structure (`product.json` section order)

1. `main-product` — reconfigured block stack
2. `pdp-behind-the-bag` — new section
3. Judge.me reviews — added manually by developer
4. `pdp-colorways` — new section
5. `collection-list` — existing section (collections grid)

---

## 1. `main-product` Block Stack

Blocks within the product info panel, top to bottom:

| Block | File | Change |
|---|---|---|
| Badges | `_pdp-badges.liquid` | existing — reads `theme.badges` metafield |
| Title | `_pdp-title.liquid` | existing |
| Rating | `_pdp-rating.liquid` | existing — Judge.me overrides widget output |
| Pre-order message | `_pdp-preorder-message.liquid` | **new** |
| Price | `_pdp-price.liquid` | existing |
| Buy buttons | `_pdp-buy-buttons.liquid` | existing — quantity selector + Add to Cart |
| Feature bullets (×3) | `_pdp-icon-with-text.liquid` | existing — checkmark icon + text |
| Details collapsible | `_pdp-collapsible.liquid` | existing |
| Delivery Info collapsible | `_pdp-collapsible.liquid` | existing |
| Pairs With | `_pdp-pairs-with.liquid` | **new** |

### Badge styling
The existing `_pdp-badges.liquid` renders badges from `product.metafields.theme.badges.value` (a list). Badges are styled as pills via `list-separator--primary/secondary/text`. To match the Figma:
- "BESTSELLER" badge → styled with a light/neutral pill (existing secondary style)
- "PRE-ORDER" badge → styled with bright green background (`#00ff00`), black text

The badge block's `button_style` setting controls all badges uniformly. To get per-badge colour variance, a small CSS override targeting the badge text content will be added to the section's `custom_css`:
```css
.product-info__badges .list-separator__item:has-text("PRE-ORDER") {
  background-color: #00ff00;
  color: #000000;
  border-color: #00ff00;
}
```
Since `:has-text` is not standard CSS, the simpler approach is to add an `nth-child` rule or render each badge type separately. The `_pdp-badges.liquid` file will be updated to output a `data-badge` attribute with the badge value so CSS can target it:
```css
[data-badge="PRE-ORDER"] { background: #00ff00; color: #000; border-color: #00ff00; }
[data-badge="BESTSELLER"] { background: #fff; color: #000; border-color: #ccc; }
```

---

## 2. New Block: `_pdp-preorder-message.liquid`

**Purpose:** Display a pre-order notice pill below the rating, above the price. Hidden when the metafield is blank.

**Reads from:** `product.metafields.custom.preorder_pdp_message` (single line text)

**Visual:** Pill-shaped notice. Background `#fff7ec` (cream), black text, small border. Text is prefixed with a bold label, e.g.:
> **Pre-order:** First drop ships April 2026

**Schema settings:** None required — purely metafield-driven.

**Styling:**
```css
.pdp-preorder-message {
  display: inline-block;
  background: #fff7ec;
  border: 1px solid #000;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 500;
}
```

---

## 3. New Block: `_pdp-pairs-with.liquid`

**Purpose:** "PAIRS WITH" section inside the product info panel, below collapsibles. Shows a horizontally scrollable list of manually curated companion products.

**Reads from:** `product.metafields.custom.pairs_with` (list of product references)

**Visual (desktop):** Horizontal scrollable row of cards. Each card:
- Product image (square thumbnail, ~80×80px, rounded)
- Product name (bold, black, `caption` font style)
- Price (black, `caption`)
- "SHOP NOW" link (`#ff0064`, uppercase, caption)
- Round quick-add button (`#00ff00` background, black icon, right-aligned)

**Visual (mobile):** Stacked vertically (full-width cards), same card content.

**Heading:** "PAIRS WITH:" in uppercase, bold black, `caption` font style.

**Schema settings:**
- `heading` (text) — default "PAIRS WITH:", editable in theme editor

**Logic:** If metafield is blank or has no products, block renders nothing.

**Styling:**
```css
.pdp-pairs-with__list {
  display: flex;
  gap: var(--space-s);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.pdp-pairs-with__card {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 260px;
  border: 1px solid #e5e5e5;
  border-radius: var(--card-border-radius);
  padding: var(--space-xs);
  background: #fff;
  scroll-snap-align: start;
}
@media (max-width: 749px) {
  .pdp-pairs-with__list {
    flex-direction: column;
    overflow-x: visible;
  }
  .pdp-pairs-with__card { min-width: unset; width: 100%; }
}
.pdp-pairs-with__shop-now {
  color: #ff0064;
  text-transform: uppercase;
  font-weight: 600;
  text-decoration: none;
}
.pdp-pairs-with__quick-add {
  background: #00ff00;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: auto;
}
```

---

## 4. New Section: `sections/pdp-behind-the-bag.liquid`

**Purpose:** Editorial "Behind the Bag" section below the main product block. Two columns: image on left, styled text panel on right.

**Data sources (with fallback order):**
| Field | Metafield | Falls back to |
|---|---|---|
| Image | `custom.behind_the_bag_image` | Section setting (image picker) |
| Label | (fixed) | "BEHIND THE BAG" — not overridable |
| Heading | `custom.behind_the_bag_heading` | Section setting (text input) |
| Body text | `custom.behind_the_bag_text` | Section setting (richtext) |

**Visual:**
- Left column: full-height image (person carrying the bag)
- Right column: lavender background (`#ede5f4`), large AP heart graphic, outlined pink pill label "BEHIND THE BAG" (border `#ff0064`, text `#ff0064`), heading in `#ff0064` (h2 size), body text in black

**Desktop layout:** 50/50 two-column grid
**Mobile layout:** Image stacked on top, text panel below. AP heart graphic displayed in the right panel. Heart graphic is a static SVG/image asset included in the section.

**Schema settings:**
- `default_image` — image picker (fallback image)
- `default_heading` — text (fallback heading)
- `default_text` — richtext (fallback body)
- `padding_top`, `padding_bottom` — spacing selects

**Hidden if:** All three fields (image, heading, text) are blank from both metafield and default settings.

---

## 5. New Section: `sections/pdp-colorways.liquid`

**Purpose:** "The Mid for Every Mood" featured collection below the Behind the Bag section. Shows a horizontal scrollable grid of products from a collection.

**Data sources:**
| Field | Source | Falls back to |
|---|---|---|
| Collection | `custom.colorways_collection` metafield | Section setting (collection picker) |
| Heading | Section setting | "THE MID FOR EVERY MOOD." |
| Subheading | Section setting | "Metallic. Minimal. Slightly unhinged. Explore other colourways and finishes." |

**Visual:**
- Section heading in `#ff0064` (hot pink), uppercase, h2
- Subheading in black, body text
- Horizontal scrollable product grid, matches existing `featured-collection` product card style
- Quick-add buttons use green (`#00ff00`) scheme
- Progress bar pagination indicator below the grid

**Schema settings:**
- `heading` — text
- `subheading` — text
- `default_collection` — collection picker (fallback)
- `product_limit` — range (default 8)
- `color_scheme` — color scheme picker

**Metafield check logic:**
```liquid
{%- assign display_collection = product.metafields.custom.colorways_collection.value -%}
{%- if display_collection == blank -%}
  {%- assign display_collection = section.settings.default_collection -%}
{%- endif -%}
```

---

## 6. Existing Section: `collection-list`

The "Different Shapes. Same Emotional Support." section uses the existing `collection-list.liquid` section. No changes needed — configure via theme editor with:
- Subheading: "EXPLORE THE COLLECTIONS"
- Heading: "DIFFERENT SHAPES. SAME EMOTIONAL SUPPORT."
- Heading color: hot pink via `scheme-d76d7b48` (text: `#ff0064`)
- "SHOP ALL" button: dark purple via primary button color

---

## 7. Metafields to Create in Shopify Admin

Go to **Settings → Custom data → Products → Add definition** for each:

| Name | Namespace & key | Type | Notes |
|---|---|---|---|
| Pre-order PDP message | `custom.preorder_pdp_message` | Single line text | e.g. "First drop ships April 2026" |
| Pairs With | `custom.pairs_with` | Product list | Max 10 products recommended |
| Behind the Bag image | `custom.behind_the_bag_image` | File (image only) | Overrides default section image |
| Behind the Bag heading | `custom.behind_the_bag_heading` | Single line text | e.g. "Joanne on The Mid" |
| Behind the Bag text | `custom.behind_the_bag_text` | Multi-line text | Quote/body copy |
| Colorways collection | `custom.colorways_collection` | Collection reference | Overrides default collection |

---

## Files Changed / Created

| File | Action |
|---|---|
| `templates/product.json` | Update section order and block configuration |
| `blocks/_pdp-badges.liquid` | Minor update — add `data-badge` attribute for CSS targeting |
| `blocks/_pdp-preorder-message.liquid` | **Create** |
| `blocks/_pdp-pairs-with.liquid` | **Create** |
| `sections/pdp-behind-the-bag.liquid` | **Create** |
| `sections/pdp-colorways.liquid` | **Create** |

---

## Out of Scope

- Review stars (inline, in product info) — Judge.me widget
- Customer reviews section — Judge.me widget
- Collections list section styling — uses existing section, configure via theme editor
