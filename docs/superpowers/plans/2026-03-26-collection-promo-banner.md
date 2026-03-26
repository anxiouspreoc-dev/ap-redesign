# Collection Promo Banner Section Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a custom `collection-promo-banner` Shopify section with a 2fr:1fr:1fr grid (text panel + two lifestyle image cells with cart-icon links), then wire it into the `/collections` template.

**Architecture:** Two file changes: (1) a new `sections/collection-promo-banner.liquid` with inline scoped CSS and a JSON schema, and (2) an update to `templates/list-collections.json` that replaces the existing `banner-grid-2` entry with a `promo-banner-1` entry of the new section type. No JavaScript required.

**Tech Stack:** Shopify OS 2.0 Liquid, inline scoped CSS (`<style>`), Shopify section JSON schema

---

## Chunk 1: Create the section and wire it into the template

### Task 1: Create sections/collection-promo-banner.liquid

**Spec:** `docs/superpowers/specs/2026-03-26-collection-promo-banner-design.md`

**Files:**
- Create: `sections/collection-promo-banner.liquid`

**Context for the implementer:**

This is a Shopify OS 2.0 theme (Primavera) at `/Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2`. Sections in this theme follow a consistent pattern:
- Outer `<div>` with `{% render 'color-scheme-attributes', scoped_settings: section.settings, borders: true %}` for color scheme support
- `padding--section` class + `{% render 'padding-override', settings: section.settings %}` inline style for padding
- `container container--max` for max-width centering
- Scoped CSS in a `<style>` tag using `#shopify-section-{{ section.id }}` prefix
- JSON `{% schema %}` at the bottom

The `render 'color-scheme-attributes'` snippet outputs `data-*` attributes that drive CSS custom properties for background and text colors. Applied to the text panel div, it scopes the color scheme to that element only.

The cart icon link uses `<a>` (not `<button>`) because it is a plain navigation link — no add-to-cart behavior. The `button--square` class gives it the circular shape matching product card quick-add buttons.

Confirmed snippets that exist:
- `snippets/color-scheme-attributes.liquid`
- `snippets/padding-override.liquid`
- `snippets/icon.liquid`

The global setting `settings.quick_add_button_icon` holds the icon name used on product card cart buttons. Use it directly so the icon stays in sync with the rest of the theme.

---

- [ ] **Step 1: Verify the file does not already exist**

```bash
ls /Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2/sections/collection-promo-banner.liquid 2>/dev/null && echo "EXISTS - stop" || echo "OK to create"
```

Expected: `OK to create`

- [ ] **Step 2: Create sections/collection-promo-banner.liquid**

Write the following content exactly to `sections/collection-promo-banner.liquid`:

```liquid
{%- liquid
  assign loading = 'lazy'
  assign fetch_priority = 'auto'
  if section.index == 1
    assign loading = 'eager'
    assign fetch_priority = 'high'
  endif
-%}

<div class="collection-promo-banner padding--section" style="{% render 'padding-override', settings: section.settings %}">
  <div class="container container--max">
    <div class="collection-promo-banner__grid">

      {%- comment -%}--- Text Panel ---{%- endcomment -%}
      <div class="collection-promo-banner__text" {% render 'color-scheme-attributes', scoped_settings: section.settings %}>
        {%- if section.settings.heading != blank -%}
          <h2 class="collection-promo-banner__heading">{{ section.settings.heading }}</h2>
        {%- endif -%}
        {%- if section.settings.text != blank -%}
          <div class="collection-promo-banner__body rte">{{ section.settings.text }}</div>
        {%- endif -%}
        {%- if section.settings.button_label != blank -%}
          <a href="{{ section.settings.button_link }}" class="button button--primary">
            {{ section.settings.button_label }}
          </a>
        {%- endif -%}
      </div>

      {%- comment -%}--- Image Cell 1 ---{%- endcomment -%}
      <div class="collection-promo-banner__image-cell">
        {%- if section.settings.image_1 != blank -%}
          {{
            section.settings.image_1
            | image_url: width: 800
            | image_tag:
              loading: loading,
              fetchpriority: fetch_priority,
              widths: '400,600,800,1000',
              sizes: '(min-width: 64em) 25vw, 50vw',
              class: 'collection-promo-banner__img'
          }}
        {%- else -%}
          {{ 'product-1' | placeholder_svg_tag: 'placeholder-svg collection-promo-banner__img' }}
        {%- endif -%}
        {%- if section.settings.image_1_link != blank -%}
          <a href="{{ section.settings.image_1_link }}" class="button button--primary button--square collection-promo-banner__cart-link">
            {%- render 'icon', icon: settings.quick_add_button_icon, class: 'quick-add__icon icon--s' -%}
            <span class="visually-hidden">Shop now</span>
          </a>
        {%- endif -%}
      </div>

      {%- comment -%}--- Image Cell 2 ---{%- endcomment -%}
      <div class="collection-promo-banner__image-cell">
        {%- if section.settings.image_2 != blank -%}
          {{
            section.settings.image_2
            | image_url: width: 800
            | image_tag:
              loading: 'lazy',
              widths: '400,600,800,1000',
              sizes: '(min-width: 64em) 25vw, 50vw',
              class: 'collection-promo-banner__img'
          }}
        {%- else -%}
          {{ 'product-2' | placeholder_svg_tag: 'placeholder-svg collection-promo-banner__img' }}
        {%- endif -%}
        {%- if section.settings.image_2_link != blank -%}
          <a href="{{ section.settings.image_2_link }}" class="button button--primary button--square collection-promo-banner__cart-link">
            {%- render 'icon', icon: settings.quick_add_button_icon, class: 'quick-add__icon icon--s' -%}
            <span class="visually-hidden">Shop now</span>
          </a>
        {%- endif -%}
      </div>

    </div>
  </div>
</div>

<style>
  #shopify-section-{{ section.id }} .collection-promo-banner__grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: var(--space-xs);
  }

  #shopify-section-{{ section.id }} .collection-promo-banner__text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-s);
    padding: var(--space-l);
    border-radius: var(--border-radius-card, 0);
    min-height: 20rem;
  }

  #shopify-section-{{ section.id }} .collection-promo-banner__image-cell {
    position: relative;
    overflow: hidden;
    border-radius: var(--border-radius-card, 0);
    min-height: 20rem;
  }

  #shopify-section-{{ section.id }} .collection-promo-banner__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  #shopify-section-{{ section.id }} .collection-promo-banner__cart-link {
    position: absolute;
    bottom: var(--space-xs);
    right: var(--space-xs);
  }

  @media screen and (max-width: 63.9375em) {
    #shopify-section-{{ section.id }} .collection-promo-banner__grid {
      grid-template-columns: 1fr;
    }

    #shopify-section-{{ section.id }} .collection-promo-banner__image-cell {
      min-height: 16rem;
    }
  }
</style>

{% schema %}
{
  "name": "Collection Promo Banner",
  "tag": "section",
  "disabled_on": {
    "groups": ["header", "custom.overlay"]
  },
  "settings": [
    {
      "type": "header",
      "content": "Text Panel"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Yes, you need another one."
    },
    {
      "type": "richtext",
      "id": "text",
      "label": "Body text",
      "default": "<p>Not sure why. You just do.</p>"
    },
    {
      "type": "text",
      "id": "button_label",
      "label": "Button label",
      "default": "Load to bag"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button link"
    },
    {
      "type": "header",
      "content": "Image 1"
    },
    {
      "type": "image_picker",
      "id": "image_1",
      "label": "Image"
    },
    {
      "type": "url",
      "id": "image_1_link",
      "label": "Cart icon link"
    },
    {
      "type": "header",
      "content": "Image 2"
    },
    {
      "type": "image_picker",
      "id": "image_2",
      "label": "Image"
    },
    {
      "type": "url",
      "id": "image_2_link",
      "label": "Cart icon link"
    },
    {
      "type": "header",
      "content": "Colors"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Text panel color scheme",
      "default": "scheme-1"
    },
    {
      "type": "header",
      "content": "Padding"
    },
    {
      "type": "select",
      "id": "padding_top",
      "options": [
        { "value": "default", "label": "Default" },
        { "value": "0px", "label": "None" },
        { "value": "var(--space-3xs)", "label": "XXXSmall" },
        { "value": "var(--space-2xs)", "label": "XXSmall" },
        { "value": "var(--space-xs)", "label": "XSmall" },
        { "value": "var(--space-s)", "label": "Small" },
        { "value": "var(--space-m)", "label": "Medium" },
        { "value": "var(--space-l)", "label": "Large" },
        { "value": "var(--space-xl)", "label": "XLarge" },
        { "value": "var(--space-xl-2xl)", "label": "XXLarge" },
        { "value": "var(--space-2xl-3xl)", "label": "XXXLarge" }
      ],
      "default": "default",
      "label": "Top padding"
    },
    {
      "type": "select",
      "id": "padding_bottom",
      "options": [
        { "value": "default", "label": "Default" },
        { "value": "0px", "label": "None" },
        { "value": "var(--space-3xs)", "label": "XXXSmall" },
        { "value": "var(--space-2xs)", "label": "XXSmall" },
        { "value": "var(--space-xs)", "label": "XSmall" },
        { "value": "var(--space-s)", "label": "Small" },
        { "value": "var(--space-m)", "label": "Medium" },
        { "value": "var(--space-l)", "label": "Large" },
        { "value": "var(--space-xl)", "label": "XLarge" },
        { "value": "var(--space-xl-2xl)", "label": "XXLarge" },
        { "value": "var(--space-2xl-3xl)", "label": "XXXLarge" }
      ],
      "default": "default",
      "label": "Bottom padding"
    }
  ],
  "presets": [
    {
      "name": "Collection Promo Banner",
      "settings": {
        "heading": "Yes, you need another one.",
        "text": "<p>Not sure why. You just do.</p>",
        "button_label": "Load to bag",
        "color_scheme": "scheme-1"
      }
    }
  ]
}
{% endschema %}
```

- [ ] **Step 3: Commit the new section**

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2
git add sections/collection-promo-banner.liquid
git commit -m "feat: add collection-promo-banner section"
```

---

### Task 2: Wire the section into list-collections.json

**Spec:** `docs/superpowers/specs/2026-03-26-collection-promo-banner-design.md`

**Files:**
- Modify: `templates/list-collections.json`

**Context for the implementer:**

The current `templates/list-collections.json` has the following section order:
```
page-title → featured-collection-1 → featured-collection-2 → banner-grid-2 → featured-collection-3
```

`banner-grid-2` must be replaced with a new `promo-banner-1` entry of type `collection-promo-banner`. The position in the `order` array stays the same. The `banner-grid-2` key is removed from both `sections` and `order`.

The file currently starts with a `/* ... */` comment block — this is fine to keep or remove; it does not affect parsing since Shopify strips it.

**Important:** The file uses comment syntax at the top (`/* ... */`) which is NOT valid JSON. Shopify handles it as a pre-processor step. When reading the file with `python3 -c "import json..."` it will fail — use `grep` or a text editor to inspect the file instead.

---

- [ ] **Step 4: Read the current list-collections.json to confirm the banner-grid-2 key**

```bash
grep -n "banner-grid-2\|promo-banner" /Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2/templates/list-collections.json
```

Expected output: Lines referencing `"banner-grid-2"` (the section key and order entry). No `promo-banner` lines yet.

- [ ] **Step 5: Replace banner-grid-2 with promo-banner-1 in the sections object**

Find the `"banner-grid-2"` section block in `templates/list-collections.json`. It looks like:

```json
"banner-grid-2": {
  "type": "banner-grid",
  ...
},
```

Replace the entire `"banner-grid-2"` block (from `"banner-grid-2": {` through its closing `}`) with:

```json
"promo-banner-1": {
  "type": "collection-promo-banner",
  "settings": {
    "heading": "Yes, you need another one.",
    "text": "<p>Not sure why. You just do.</p>",
    "button_label": "Load to bag",
    "button_link": "",
    "image_1_link": "",
    "image_2_link": "",
    "color_scheme": "scheme-1",
    "padding_top": "default",
    "padding_bottom": "default"
  }
},
```

- [ ] **Step 6: Replace banner-grid-2 in the order array**

In the `"order"` array, replace `"banner-grid-2"` with `"promo-banner-1"`.

Before:
```json
"order": [
  "page-title",
  "featured-collection-1",
  "featured-collection-2",
  "banner-grid-2",
  "featured-collection-3"
]
```

After:
```json
"order": [
  "page-title",
  "featured-collection-1",
  "featured-collection-2",
  "promo-banner-1",
  "featured-collection-3"
]
```

- [ ] **Step 7: Verify no banner-grid-2 references remain**

```bash
grep "banner-grid-2" /Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2/templates/list-collections.json
```

Expected: no output (zero matches).

- [ ] **Step 8: Verify promo-banner-1 appears in both sections and order**

```bash
grep -c "promo-banner-1" /Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2/templates/list-collections.json
```

Expected: `2` (once in sections, once in order).

- [ ] **Step 9: Commit the template update**

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2
git add templates/list-collections.json
git commit -m "feat: wire collection-promo-banner into /collections template"
```

---

## Post-Deployment Checklist

- [ ] `sections/collection-promo-banner.liquid` exists
- [ ] `templates/list-collections.json` references `promo-banner-1` with type `collection-promo-banner`
- [ ] No `banner-grid-2` references remain in `list-collections.json`
- [ ] In Shopify theme editor: `/collections` template shows "Collection Promo Banner" section with text panel + two image cell slots
- [ ] Text panel renders heading, body, and button
- [ ] Image cells show placeholder SVGs until images are uploaded
- [ ] Cart icon buttons do not render when image links are blank
- [ ] On mobile: section stacks to single column
- [ ] `sections/banner-grid.liquid` still exists (not deleted)
