# PDP Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Figma-designed product detail page for Anxious Preoccupied's Shopify theme, including two new blocks, two new sections, an SVG asset, and a reconfigured product template.

**Architecture:** Each new piece of UI is a self-contained Liquid file (block or section) that reads from product metafields with section-setting fallbacks. The `product.json` template wires everything together in the correct page order. No shared sections are modified — all new functionality lives in dedicated PDP files.

**Tech Stack:** Shopify Liquid, CSS (scoped to each file), `shopify theme check` for syntax validation, Shopify CLI (`shopify theme dev`) for live preview.

**Spec:** `docs/superpowers/specs/2026-03-15-pdp-redesign.md`

---

## Chunk 1: Badges + Pre-order Message Block

### Task 1: Add `data-badge` attribute to `_pdp-badges.liquid`

**Files:**
- Modify: `blocks/_pdp-badges.liquid`

**Context:** Each badge `<li>` needs a `data-badge` attribute with the lowercased, hyphenated badge value so CSS can target individual badge types (e.g. PRE-ORDER → green, BESTSELLER → neutral). Auto-generated "Sold out" and "Sale" badges also need the attribute.

- [ ] **Step 1: Open the file and locate the badge rendering lines**

  Read `blocks/_pdp-badges.liquid`. There are two badge groups:
  - Lines 4–8: auto-generated "Sold out" and "Sale" `<li>` elements
  - Line 11: `{%- for badge in custom_badges -%}` loop with `<li>` on line 12

- [ ] **Step 2: Update the auto-generated badge `<li>` elements**

  Replace lines 4–8 (auto-generated badges) with:
  ```liquid
  {%- if product.available == false -%}
    <li class="list-separator__item" data-badge="sold-out">Sold out</li>
  {%- elsif product.compare_at_price > product.price and product.available -%}
    <li class="exception list-separator__item" data-badge="sale">Sale</li>
  {%- endif -%}
  ```

- [ ] **Step 3: Update the custom badge loop `<li>` element**

  Replace the `<li>` inside the `for badge in custom_badges` loop with:
  ```liquid
  <li class="list-separator__item" data-badge="{{ badge | downcase | replace: ' ', '-' }}">{{ badge }}</li>
  ```

- [ ] **Step 4: Run theme check**

  ```bash
  cd /Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2
  shopify theme check blocks/_pdp-badges.liquid
  ```
  Expected: no errors or warnings.

- [ ] **Step 5: Commit**

  ```bash
  git add blocks/_pdp-badges.liquid
  git commit -m "feat: add data-badge attribute to pdp badges for CSS targeting"
  ```

---

### Task 2: Create `_pdp-preorder-message.liquid`

**Files:**
- Create: `blocks/_pdp-preorder-message.liquid`

**Context:** Renders a cream pill notice below the rating and above the price. Hidden when `custom.preorder_pdp_message` metafield is blank. Schema has no settings — purely metafield-driven.

- [ ] **Step 1: Create the file**

  Create `blocks/_pdp-preorder-message.liquid` with:

  ```liquid
  {%- assign product = section.settings.product | default: product -%}
  {%- assign preorder_message = product.metafields.custom.preorder_pdp_message -%}

  {%- if preorder_message != blank -%}
    <div class="pdp-preorder-message" {{ block.shopify_attributes }}>
      <strong>Pre-order:</strong> {{ preorder_message }}
    </div>
  {%- endif -%}

  {% schema %}
  {
    "name": "Pre-order Message",
    "tag": null,
    "presets": [
      {
        "name": "Pre-order Message"
      }
    ]
  }
  {% endschema %}
  ```

- [ ] **Step 2: Add the scoped CSS**

  Append this `{% style %}` block directly before `{% schema %}`:

  ```liquid
  {% style %}
  .pdp-preorder-message {
    display: inline-block;
    background: #fff7ec;
    border: 1px solid #000000;
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  {% endstyle %}
  ```

- [ ] **Step 3: Run theme check**

  ```bash
  shopify theme check blocks/_pdp-preorder-message.liquid
  ```
  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add blocks/_pdp-preorder-message.liquid
  git commit -m "feat: add pdp preorder message block"
  ```

---

## Chunk 2: Pairs With Block

### Task 3: Create `_pdp-pairs-with.liquid`

**Files:**
- Create: `blocks/_pdp-pairs-with.liquid`

**Context:** Renders a "PAIRS WITH" section below the collapsibles. Reads from `product.metafields.custom.pairs_with` (list of product references). Each card shows: thumbnail, name, price, "SHOP NOW" link, and a quick-add button. The existing `quick-add.liquid` snippet handles single-variant (Ajax cart add) vs multi-variant (links to PDP) automatically — reuse it here.

Desktop: horizontal scrollable row of fixed-width cards.
Mobile: vertical stack of full-width cards, same horizontal inner layout (image left, content right).

- [ ] **Step 1: Create the file with Liquid logic**

  Create `blocks/_pdp-pairs-with.liquid`:

  ```liquid
  {%- assign product = section.settings.product | default: product -%}
  {%- assign pairs = product.metafields.custom.pairs_with.value -%}

  {%- if pairs != blank and pairs.size > 0 -%}
    <div class="pdp-pairs-with" {{ block.shopify_attributes }}>
      {%- if block.settings.heading != blank -%}
        <h2 class="pdp-pairs-with__heading caption">{{ block.settings.heading }}</h2>
      {%- endif -%}

      <ul class="pdp-pairs-with__list list-unstyled" role="list">
        {%- for paired_product in pairs -%}
          <li class="pdp-pairs-with__card">
            {%- if paired_product.featured_image != blank -%}
              <a href="{{ paired_product.url }}" class="pdp-pairs-with__image-link" tabindex="-1" aria-hidden="true">
                {{ paired_product.featured_image | image_url: width: 160 | image_tag:
                  class: 'pdp-pairs-with__image',
                  width: 80,
                  height: 80,
                  alt: paired_product.featured_image.alt | escape
                }}
              </a>
            {%- endif -%}

            <div class="pdp-pairs-with__content">
              <p class="pdp-pairs-with__title caption">
                <a href="{{ paired_product.url }}" class="pdp-pairs-with__title-link link-unstyled">
                  {{- paired_product.title -}}
                </a>
              </p>
              {%- render 'price', product: paired_product, font_style: 'caption' -%}
              <a href="{{ paired_product.url }}" class="pdp-pairs-with__shop-now caption">
                {{- 'products.product.shop_now' | t | default: 'Shop now' -}}
              </a>
            </div>

            {%- render 'quick-add',
              product: paired_product,
              section_id: section.id | append: '-pairs-' | append: forloop.index,
              button_style: 'primary',
              classes: 'pdp-pairs-with__quick-add'
            -%}
          </li>
        {%- endfor -%}
      </ul>
    </div>
  {%- endif -%}
  ```

- [ ] **Step 2: Add scoped CSS**

  Append this `{% style %}` block before the schema:

  ```liquid
  {% style %}
  .pdp-pairs-with__heading {
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: var(--space-xs);
  }
  .pdp-pairs-with__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
  }
  .pdp-pairs-with__card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-xs);
    border: 1px solid #e5e5e5;
    border-radius: var(--card-border-radius, 8px);
    padding: var(--space-xs);
    background: #ffffff;
  }
  .pdp-pairs-with__image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: calc(var(--card-border-radius, 8px) - 2px);
    flex-shrink: 0;
    display: block;
  }
  .pdp-pairs-with__image-link {
    flex-shrink: 0;
    display: block;
  }
  .pdp-pairs-with__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .pdp-pairs-with__title {
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pdp-pairs-with__title-link {
    color: inherit;
  }
  .pdp-pairs-with__shop-now {
    color: #ff0064;
    text-transform: uppercase;
    font-weight: 600;
    text-decoration: none;
  }
  .pdp-pairs-with__shop-now:hover {
    text-decoration: underline;
  }
  .pdp-pairs-with__quick-add.button {
    background: #00ff00;
    border-color: #00ff00;
    color: #000000;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    padding: 0;
    flex-shrink: 0;
    margin-left: auto;
  }
  .pdp-pairs-with__quick-add.button:hover {
    background: #00dd00;
    border-color: #00dd00;
  }
  @media screen and (min-width: 750px) {
    .pdp-pairs-with__list {
      flex-direction: row;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    .pdp-pairs-with__card {
      min-width: 260px;
      scroll-snap-align: start;
      flex-shrink: 0;
    }
  }
  {% endstyle %}
  ```

- [ ] **Step 3: Add schema**

  Append after the `{% style %}` block:

  ```liquid
  {% schema %}
  {
    "name": "Pairs With",
    "tag": null,
    "settings": [
      {
        "type": "text",
        "id": "heading",
        "label": "Heading",
        "default": "PAIRS WITH:"
      }
    ],
    "presets": [
      {
        "name": "Pairs With"
      }
    ]
  }
  {% endschema %}
  ```

- [ ] **Step 4: Run theme check**

  ```bash
  shopify theme check blocks/_pdp-pairs-with.liquid
  ```
  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add blocks/_pdp-pairs-with.liquid
  git commit -m "feat: add pdp pairs-with block with metafield-driven product cards"
  ```

---

## Chunk 3: Behind the Bag Section

### Task 4: Create `assets/ap-heart.svg`

**Files:**
- Create: `assets/ap-heart.svg`

**Context:** The AP branded heart graphic used as a background decoration in the "Behind the Bag" right panel. Positioned absolutely at low opacity. This is a placeholder SVG — the final branded asset should be replaced by the designer.

- [ ] **Step 1: Create placeholder SVG**

  Create `assets/ap-heart.svg`:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <path d="M100 170 C100 170 20 120 20 65 C20 40 40 20 65 20 C80 20 93 28 100 40 C107 28 120 20 135 20 C160 20 180 40 180 65 C180 120 100 170 100 170Z" fill="#c9a0dc" opacity="0.35"/>
    <text x="100" y="110" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="700" fill="#5d006e" opacity="0.5">AP</text>
  </svg>
  ```

  > **Note for designer:** Replace `assets/ap-heart.svg` with the final branded AP heart graphic before going live. The dimensions should be roughly square (e.g. 300×300px viewBox). Keep it as SVG for scalability.

- [ ] **Step 2: Commit**

  ```bash
  git add assets/ap-heart.svg
  git commit -m "feat: add placeholder ap-heart svg asset for behind-the-bag section"
  ```

---

### Task 5: Create `sections/pdp-behind-the-bag.liquid`

**Files:**
- Create: `sections/pdp-behind-the-bag.liquid`

**Context:** Two-column editorial section. Left: image. Right: lavender panel with AP heart, "BEHIND THE BAG" pill, heading in hot pink, body text in black. All content fields fall back from metafield → section setting. Hidden if both heading and body text are blank from both sources.

- [ ] **Step 1: Create the file with Liquid logic**

  Create `sections/pdp-behind-the-bag.liquid`:

  ```liquid
  {%- assign section_product = section.settings.product | default: product -%}

  {%- comment -%} Resolve image: metafield overrides section setting {%- endcomment -%}
  {%- assign meta_image = section_product.metafields.custom.behind_the_bag_image.value -%}
  {%- assign display_image = meta_image | default: section.settings.default_image -%}

  {%- comment -%} Resolve heading: metafield overrides section setting {%- endcomment -%}
  {%- assign meta_heading = section_product.metafields.custom.behind_the_bag_heading -%}
  {%- assign display_heading = meta_heading | default: section.settings.default_heading -%}

  {%- comment -%} Resolve body text: metafield overrides section setting {%- endcomment -%}
  {%- assign meta_text = section_product.metafields.custom.behind_the_bag_text -%}
  {%- if meta_text != blank -%}
    {%- assign display_text = meta_text.value -%}
  {%- else -%}
    {%- assign display_text = section.settings.default_text -%}
  {%- endif -%}

  {%- comment -%} Hide section if both heading and text are blank {%- endcomment -%}
  {%- if display_heading == blank and display_text == blank -%}
    {%- # render nothing -%}
  {%- else -%}
    <section class="pdp-behind-the-bag" aria-label="Behind the Bag">
      <div class="pdp-behind-the-bag__inner">

        {%- comment -%} Left: image {%- endcomment -%}
        <div class="pdp-behind-the-bag__image-col">
          {%- if display_image != blank -%}
            {{ display_image | image_url: width: 800 | image_tag:
              class: 'pdp-behind-the-bag__image',
              widths: '400, 600, 800',
              sizes: '(min-width: 990px) 50vw, 100vw',
              alt: display_heading | escape
            }}
          {%- else -%}
            {{ 'lifestyle-1' | placeholder_svg_tag: 'pdp-behind-the-bag__image pdp-behind-the-bag__image--placeholder' }}
          {%- endif -%}
        </div>

        {%- comment -%} Right: text panel {%- endcomment -%}
        <div class="pdp-behind-the-bag__text-col">
          <div class="pdp-behind-the-bag__heart-wrapper" aria-hidden="true">
            <img src="{{ 'ap-heart.svg' | asset_url }}" class="pdp-behind-the-bag__heart" alt="" width="200" height="200" loading="lazy">
          </div>

          <div class="pdp-behind-the-bag__content">
            <span class="pdp-behind-the-bag__label caption">Behind the Bag</span>

            {%- if display_heading != blank -%}
              <h2 class="pdp-behind-the-bag__heading h2">{{ display_heading }}</h2>
            {%- endif -%}

            {%- if display_text != blank -%}
              <div class="pdp-behind-the-bag__text body">{{ display_text }}</div>
            {%- endif -%}
          </div>
        </div>

      </div>
    </section>
  {%- endif -%}
  ```

- [ ] **Step 2: Add scoped CSS**

  Append `{% style %}` before `{% schema %}`:

  ```liquid
  {% style %}
  .pdp-behind-the-bag {
    overflow: hidden;
  }
  .pdp-behind-the-bag__inner {
    display: grid;
    grid-template-columns: 1fr;
  }
  @media screen and (min-width: 990px) {
    .pdp-behind-the-bag__inner {
      grid-template-columns: 1fr 1fr;
      min-height: 500px;
    }
  }
  .pdp-behind-the-bag__image-col {
    position: relative;
    overflow: hidden;
  }
  .pdp-behind-the-bag__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .pdp-behind-the-bag__image--placeholder {
    width: 100%;
    aspect-ratio: 1;
    display: block;
    background: #f0f0f0;
  }
  .pdp-behind-the-bag__text-col {
    position: relative;
    background-color: #ede5f4;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl) var(--space-l);
    overflow: hidden;
  }
  .pdp-behind-the-bag__heart-wrapper {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .pdp-behind-the-bag__heart {
    width: 80%;
    max-width: 360px;
    opacity: 0.4;
  }
  .pdp-behind-the-bag__content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
  }
  .pdp-behind-the-bag__label {
    display: inline-block;
    border: 1px solid #ff0064;
    color: #ff0064;
    border-radius: 999px;
    padding: 4px 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    align-self: center;
  }
  .pdp-behind-the-bag__heading {
    color: #ff0064;
    margin: 0;
    text-transform: uppercase;
  }
  .pdp-behind-the-bag__text {
    color: #000000;
    margin: 0;
  }
  {% endstyle %}
  ```

- [ ] **Step 3: Add schema**

  Append after `{% style %}`:

  ```liquid
  {% schema %}
  {
    "name": "Behind the Bag",
    "settings": [
      {
        "type": "header",
        "content": "Default content (overridden by product metafields)"
      },
      {
        "type": "image_picker",
        "id": "default_image",
        "label": "Default image"
      },
      {
        "type": "text",
        "id": "default_heading",
        "label": "Default heading",
        "placeholder": "e.g. Joanne on The Mid"
      },
      {
        "type": "richtext",
        "id": "default_text",
        "label": "Default body text"
      },
      {
        "type": "header",
        "content": "Spacing"
      },
      {
        "type": "select",
        "id": "padding_top",
        "label": "Padding top",
        "options": [
          { "value": "0px", "label": "None" },
          { "value": "var(--space-m)", "label": "Medium" },
          { "value": "var(--space-l)", "label": "Large" },
          { "value": "var(--space-xl)", "label": "X-Large" }
        ],
        "default": "0px"
      },
      {
        "type": "select",
        "id": "padding_bottom",
        "label": "Padding bottom",
        "options": [
          { "value": "0px", "label": "None" },
          { "value": "var(--space-m)", "label": "Medium" },
          { "value": "var(--space-l)", "label": "Large" },
          { "value": "var(--space-xl)", "label": "X-Large" }
        ],
        "default": "0px"
      }
    ],
    "presets": [
      {
        "name": "Behind the Bag"
      }
    ]
  }
  {% endschema %}
  ```

- [ ] **Step 4: Run theme check**

  ```bash
  shopify theme check sections/pdp-behind-the-bag.liquid
  ```
  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add sections/pdp-behind-the-bag.liquid
  git commit -m "feat: add pdp-behind-the-bag section with metafield overrides"
  ```

---

## Chunk 4: Colorways Section

### Task 6: Create `sections/pdp-colorways.liquid`

**Files:**
- Create: `sections/pdp-colorways.liquid`

**Context:** "The Mid for Every Mood" — horizontal scrollable product grid. Collection resolved from `custom.colorways_collection` metafield, falling back to section setting. Follows the exact same `slider-component-inner` + `slider-component` pattern as `featured-collection.liquid`. Heading and subheading set in theme editor. Heading rendered in hot pink `#ff0064`.

- [ ] **Step 1: Create the file with Liquid logic**

  Create `sections/pdp-colorways.liquid`:

  ```liquid
  {%- assign product = section.settings.product | default: product -%}

  {%- assign display_collection = product.metafields.custom.colorways_collection.value -%}
  {%- if display_collection == blank -%}
    {%- assign display_collection = section.settings.default_collection -%}
  {%- endif -%}

  {%- assign product_limit = section.settings.product_limit -%}
  {%- assign columns_desktop = 4 -%}
  {%- assign columns_mobile = 2 -%}

  {%- if display_collection != blank -%}
    {%- assign product_count = display_collection.products.size -%}
  {%- else -%}
    {%- assign product_count = 0 -%}
  {%- endif -%}

  {%- assign show_desktop_slider = false -%}
  {%- assign show_mobile_slider = false -%}
  {%- if product_limit > columns_desktop and section.settings.column_behavior == 'slideshow' -%}
    {%- assign show_desktop_slider = true -%}
  {%- endif -%}
  {%- if product_limit == 0 and section.settings.column_behavior == 'slideshow' -%}
    {%- assign show_desktop_slider = true -%}
  {%- endif -%}
  {%- if product_count == 0 or product_limit > columns_mobile -%}
    {%- assign show_mobile_slider = true -%}
  {%- endif -%}

  {% capture inner_content %}
    <ul class="slider-component__grid list-unstyled">
      {%- if display_collection != blank and product_count > 0 -%}
        {%- for card_product in display_collection.products limit: product_limit -%}
          <li class="slider-component__item" id="Slide-{{ section.id }}-{{ forloop.index }}">
            <div class="scroll-trigger animate--slide-up">
              {%- render 'card-product', product: card_product -%}
            </div>
          </li>
        {%- endfor -%}
      {%- else -%}
        {%- for i in (1..columns_desktop) -%}
          {%- assign placeholder_image = 'product-' | append: forloop.index -%}
          <li class="slider-component__item" id="Slide-{{ section.id }}-{{ forloop.index }}">
            <div class="scroll-trigger animate--slide-up">
              {%- render 'card-product', product: null, placeholder_image: placeholder_image -%}
            </div>
          </li>
        {%- endfor -%}
      {%- endif -%}
    </ul>
  {% endcapture %}

  {% capture content %}
    {% render 'slider-component-inner',
      id: section.id,
      container_type: section.settings.container_type,
      column_behavior: section.settings.column_behavior,
      columns_desktop: columns_desktop,
      columns_mobile: columns_mobile,
      content: inner_content
    %}
  {% endcapture %}

  <div {% render 'color-scheme-attributes', scoped_settings: section.settings, borders: true %}>
    <div class="pdp-colorways padding--section gap--section" style="{% render 'padding-override', settings: section.settings %}">

      <div class="pdp-colorways__header container container--xl">
        {%- if section.settings.heading != blank -%}
          <h2 class="pdp-colorways__heading h2">{{ section.settings.heading }}</h2>
        {%- endif -%}
        {%- if section.settings.subheading != blank -%}
          <p class="pdp-colorways__subheading body">{{ section.settings.subheading }}</p>
        {%- endif -%}
      </div>

      <div>
        {%- if show_desktop_slider or show_mobile_slider -%}
          {% render 'slider-component',
            content: content,
            show_desktop_slider: show_desktop_slider,
            button_style: 'primary',
            arrow_style: 'overlay',
            counter_style: 'progress'
          %}
        {%- else -%}
          {{ content }}
        {%- endif -%}
      </div>

    </div>
  </div>
  ```

- [ ] **Step 2: Add scoped CSS**

  Append `{% style %}` before `{% schema %}`:

  ```liquid
  {% style %}
  .pdp-colorways__header {
    margin-bottom: var(--space-m);
  }
  .pdp-colorways__heading {
    color: #ff0064;
    text-transform: uppercase;
    margin: 0 0 var(--space-2xs);
  }
  .pdp-colorways__subheading {
    margin: 0;
    color: #000000;
  }
  {% endstyle %}
  ```

- [ ] **Step 3: Add schema**

  Append after `{% style %}`:

  ```liquid
  {% schema %}
  {
    "name": "PDP Colorways",
    "settings": [
      {
        "type": "header",
        "content": "Content"
      },
      {
        "type": "text",
        "id": "heading",
        "label": "Heading",
        "default": "THE MID FOR EVERY MOOD."
      },
      {
        "type": "text",
        "id": "subheading",
        "label": "Subheading",
        "default": "Metallic. Minimal. Slightly unhinged. Explore other colourways and finishes."
      },
      {
        "type": "collection",
        "id": "default_collection",
        "label": "Default collection"
      },
      {
        "type": "range",
        "id": "product_limit",
        "min": 2,
        "max": 12,
        "step": 1,
        "default": 8,
        "label": "Maximum products to show"
      },
      {
        "type": "select",
        "id": "container_type",
        "label": "Container type",
        "options": [
          { "value": "max", "label": "Page width" },
          { "value": "full", "label": "Full width" },
          { "value": "padded", "label": "Full width padded" }
        ],
        "default": "max"
      },
      {
        "type": "select",
        "id": "column_behavior",
        "label": "Column behavior",
        "options": [
          { "value": "slideshow", "label": "Slideshow" },
          { "value": "grid", "label": "Grid" }
        ],
        "default": "slideshow"
      },
      {
        "type": "header",
        "content": "Style"
      },
      {
        "type": "color_scheme",
        "id": "color_scheme",
        "label": "Color scheme",
        "default": "scheme-1"
      },
      {
        "type": "header",
        "content": "Spacing"
      },
      {
        "type": "select",
        "id": "padding_top",
        "label": "Padding top",
        "options": [
          { "value": "0px", "label": "None" },
          { "value": "var(--space-m)", "label": "Medium" },
          { "value": "var(--space-l)", "label": "Large" },
          { "value": "var(--space-xl)", "label": "X-Large" }
        ],
        "default": "var(--space-l)"
      },
      {
        "type": "select",
        "id": "padding_bottom",
        "label": "Padding bottom",
        "options": [
          { "value": "0px", "label": "None" },
          { "value": "var(--space-m)", "label": "Medium" },
          { "value": "var(--space-l)", "label": "Large" },
          { "value": "var(--space-xl)", "label": "X-Large" }
        ],
        "default": "var(--space-l)"
      }
    ],
    "presets": [
      {
        "name": "PDP Colorways"
      }
    ]
  }
  {% endschema %}
  ```

- [ ] **Step 4: Run theme check**

  ```bash
  shopify theme check sections/pdp-colorways.liquid
  ```
  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add sections/pdp-colorways.liquid
  git commit -m "feat: add pdp-colorways section with metafield collection override"
  ```

---

## Chunk 5: Wire Up `product.json`

### Task 7: Update `templates/product.json`

**Files:**
- Modify: `templates/product.json`

**Context:** Reconfigure the product template to:
1. Update the `main-product` block stack to match the Figma (correct block order, add new blocks, remove placeholder blocks that don't belong in this design)
2. Replace `split-card` and `related-products` sections with `pdp-behind-the-bag` and `pdp-colorways`
3. Keep `recently-viewed-products` or replace with `collection-list` per the design

The new section order is:
1. `main-product` (updated blocks)
2. `pdp-behind-the-bag`
3. `pdp-colorways`
4. `collection-list`

- [ ] **Step 1: Read the current `product.json`**

  Read `templates/product.json` to understand current structure before making changes.

- [ ] **Step 2: Rewrite `product.json`**

  Replace the entire contents of `templates/product.json` with:

  ```json
  {
    "sections": {
      "main": {
        "type": "main-product",
        "blocks": {
          "pdp-badges": {
            "type": "_pdp-badges",
            "settings": {
              "button_style": "primary"
            },
            "blocks": {}
          },
          "pdp-title": {
            "type": "_pdp-title",
            "settings": {
              "heading_size": "h2",
              "enable_share": false,
              "share_color_scheme": ""
            },
            "blocks": {}
          },
          "pdp-rating": {
            "type": "_pdp-rating",
            "settings": {},
            "blocks": {}
          },
          "pdp-preorder-message": {
            "type": "_pdp-preorder-message",
            "settings": {},
            "blocks": {}
          },
          "pdp-price": {
            "type": "_pdp-price",
            "settings": {
              "font_style": "caption"
            },
            "blocks": {}
          },
          "pdp-buy-buttons": {
            "type": "_pdp-buy-buttons",
            "settings": {
              "show_dynamic_checkout": false,
              "show_quantity_selector": true,
              "show_gift_card_recipient": false
            },
            "blocks": {}
          },
          "pdp-icon-with-text-1": {
            "type": "_pdp-icon-with-text",
            "settings": {
              "icon": "none",
              "icon_size": "icon--m",
              "image": "shopify://shop_images/check-circle.png",
              "max_width": 16,
              "text": "<p>Feature one — update this text in the theme editor</p>",
              "font_style": "caption",
              "layout": "row",
              "horizontal_alignment": "left",
              "vertical_alignment": "middle",
              "padding": "0px",
              "gap": "var(--space-2xs)",
              "show_borders": false,
              "color_scheme": ""
            },
            "blocks": {}
          },
          "pdp-icon-with-text-2": {
            "type": "_pdp-icon-with-text",
            "settings": {
              "icon": "none",
              "icon_size": "icon--m",
              "image": "shopify://shop_images/check-circle.png",
              "max_width": 16,
              "text": "<p>Feature two — update this text in the theme editor</p>",
              "font_style": "caption",
              "layout": "row",
              "horizontal_alignment": "left",
              "vertical_alignment": "middle",
              "padding": "0px",
              "gap": "var(--space-2xs)",
              "show_borders": false,
              "color_scheme": ""
            },
            "blocks": {}
          },
          "pdp-icon-with-text-3": {
            "type": "_pdp-icon-with-text",
            "settings": {
              "icon": "none",
              "icon_size": "icon--m",
              "image": "shopify://shop_images/check-circle.png",
              "max_width": 16,
              "text": "<p>Feature three — update this text in the theme editor</p>",
              "font_style": "caption",
              "layout": "row",
              "horizontal_alignment": "left",
              "vertical_alignment": "middle",
              "padding": "0px",
              "gap": "var(--space-2xs)",
              "show_borders": false,
              "color_scheme": ""
            },
            "blocks": {}
          },
          "pdp-collapsible-details": {
            "type": "_pdp-collapsible",
            "settings": {
              "heading": "DETAILS",
              "font_style": "caption",
              "text": "<p>Add product details here.</p>",
              "page": "",
              "open_by_default": false
            },
            "blocks": {}
          },
          "pdp-collapsible-delivery": {
            "type": "_pdp-collapsible",
            "settings": {
              "heading": "DELIVERY INFO",
              "font_style": "caption",
              "text": "<p>Add delivery information here.</p>",
              "page": "",
              "open_by_default": false
            },
            "blocks": {}
          },
          "pdp-pairs-with": {
            "type": "_pdp-pairs-with",
            "settings": {
              "heading": "PAIRS WITH:"
            },
            "blocks": {}
          }
        },
        "block_order": [
          "pdp-badges",
          "pdp-title",
          "pdp-rating",
          "pdp-preorder-message",
          "pdp-price",
          "pdp-buy-buttons",
          "pdp-icon-with-text-1",
          "pdp-icon-with-text-2",
          "pdp-icon-with-text-3",
          "pdp-collapsible-details",
          "pdp-collapsible-delivery",
          "pdp-pairs-with"
        ],
        "custom_css": [
          "button { text-transform: uppercase; }",
          "[data-badge='pre-order'] { background: #00ff00; color: #000; border-color: #00ff00; }",
          "[data-badge='bestseller'] { background: #ffffff; color: #000000; border-color: #cccccc; }"
        ],
        "settings": {
          "media_style": "thumbnails",
          "mobile_max_width": "92%",
          "enable_zoom": false,
          "enable_autoplay": true,
          "media_color_scheme": "",
          "spacing": "var(--space-l)",
          "button_style": "primary",
          "image_aspect_ratio": "adapt",
          "animation_style": "fade",
          "counter_style": "hidden",
          "enable_looping": true,
          "color_scheme": "scheme-b24726de-3ead-4723-beaa-1fb283066b3f",
          "enable_satc_mobile": true,
          "enable_satc_desktop": true,
          "show_satc_image": true,
          "show_satc_variant": true,
          "show_satc_price": true,
          "show_satc_rating": false,
          "satc_color_scheme": "",
          "show_top_border": false,
          "show_bottom_border": false,
          "show_block_borders": false,
          "enable_transparent_header": false
        }
      },
      "pdp-behind-the-bag": {
        "type": "pdp-behind-the-bag",
        "settings": {
          "default_heading": "",
          "default_text": "",
          "padding_top": "0px",
          "padding_bottom": "0px"
        }
      },
      "pdp-colorways": {
        "type": "pdp-colorways",
        "settings": {
          "heading": "THE MID FOR EVERY MOOD.",
          "subheading": "Metallic. Minimal. Slightly unhinged. Explore other colourways and finishes.",
          "product_limit": 8,
          "container_type": "max",
          "column_behavior": "slideshow",
          "color_scheme": "scheme-1",
          "padding_top": "var(--space-l)",
          "padding_bottom": "var(--space-l)"
        }
      },
      "collection-list": {
        "type": "collection-list",
        "settings": {
          "columns_desktop": 5,
          "columns_mobile": 2,
          "layout_desktop": "slideshow",
          "container_type": "max",
          "arrow_position": "overlay",
          "counter_style": "progress",
          "button_style": "primary",
          "color_scheme": "scheme-d76d7b48-da45-4d97-a538-1d74349672f6",
          "padding_top": "var(--space-l)",
          "padding_bottom": "var(--space-l)",
          "show_top_border": false,
          "show_bottom_border": false
        }
      }
    },
    "order": [
      "main",
      "pdp-behind-the-bag",
      "pdp-colorways",
      "collection-list"
    ]
  }
  ```

  > **Note:** The Judge.me reviews section is intentionally omitted — it will be added manually via the Shopify theme editor once the Judge.me app is installed and configured.

  > **Note:** The `collection-list` section uses `content_for "block"` for its header — block settings (heading, subheading, button label) cannot be set from `product.json`. After deployment, configure the "DIFFERENT SHAPES. SAME EMOTIONAL SUPPORT." heading and "SHOP ALL" button via the Shopify theme editor on the product page.

- [ ] **Step 3: Run theme check on the template**

  ```bash
  shopify theme check templates/product.json
  ```
  Expected: no errors. If theme check warns about unknown block types for the new blocks, this is expected — they will resolve once the theme is pushed.

- [ ] **Step 4: Run theme check on the whole theme**

  ```bash
  shopify theme check
  ```
  Expected: no new errors introduced by this change.

- [ ] **Step 5: Commit**

  ```bash
  git add templates/product.json
  git commit -m "feat: reconfigure product.json for pdp redesign — new block order, behind-the-bag and colorways sections"
  ```

---

## Post-Implementation Checklist

After all tasks are complete and pushed to the dev store, verify the following visually:

**Desktop (≥990px):**
- [ ] Badges render with correct colours: PRE-ORDER = green, BESTSELLER = neutral
- [ ] Pre-order pill shows when `custom.preorder_pdp_message` metafield is set, hidden when blank
- [ ] "PAIRS WITH" shows a horizontal scrollable row of cards when `custom.pairs_with` is set
- [ ] Each pairs-with card: thumbnail, name, price, "SHOP NOW" in pink, green quick-add button
- [ ] Quick-add button on single-variant paired product adds to cart without page refresh
- [ ] Quick-add button on multi-variant paired product navigates to that product's PDP
- [ ] "Behind the Bag" section shows two columns, lavender right panel, pink heading
- [ ] "Behind the Bag" uses metafield values when set, falls back to section settings
- [ ] "Behind the Bag" hides when both heading and text are blank
- [ ] Colorways section shows hot-pink heading, product grid with progress bar
- [ ] Colorways uses metafield collection when set, falls back to section setting
- [ ] Collections list shows with pink heading scheme

**Mobile (≤749px):**
- [ ] Pairs-with cards stack vertically at full width
- [ ] Behind the Bag image stacks above text panel
- [ ] Colorways grid is scrollable, 2 columns

**Theme editor:**
- [ ] All new blocks and sections are configurable without errors
- [ ] Section defaults are editable and visible in preview
- [ ] New blocks appear in the product info block list

---

## Metafields Setup Reminder

Before testing metafield overrides, create these definitions in **Shopify Admin → Settings → Custom data → Products**:

| Namespace & key | Type |
|---|---|
| `custom.preorder_pdp_message` | Single line text |
| `custom.pairs_with` | Product list |
| `custom.behind_the_bag_image` | File (image only) |
| `custom.behind_the_bag_heading` | Single line text |
| `custom.behind_the_bag_text` | Rich text |
| `custom.colorways_collection` | Collection reference |
