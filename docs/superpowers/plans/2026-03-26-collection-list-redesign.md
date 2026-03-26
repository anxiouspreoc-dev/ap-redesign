# Collection List Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `templates/list-collections.json` to render the `/collections` page as an editorial layout — collection product grids separated by configurable promo banners — using only existing Primavera theme sections.

**Architecture:** The only change is rewriting `templates/list-collections.json`. The new template stacks 6 sections: a page-title header, three `featured-collection` sections (one per collection group), and two `banner-grid` sections (promo banners between groups). No Liquid files are created or modified.

**Tech Stack:** Shopify OS 2.0 JSON templates, Primavera theme sections (`section-header`, `featured-collection`, `banner-grid`)

---

## Chunk 1: Rewrite list-collections.json

### Task 1: Back up and replace the template

**Spec:** `docs/superpowers/specs/2026-03-26-collection-list-redesign-design.md`

**Files:**
- Modify: `templates/list-collections.json`

**Context for the implementer:**

Shopify OS 2.0 JSON templates define page sections as a flat `sections` object (keyed by arbitrary IDs) and a separate `order` array. Blocks within a section are also a flat object keyed by block ID. Nested blocks (blocks inside blocks) follow the same pattern recursively.

The following section types must already exist as `.liquid` files in `sections/` — confirm before starting:
- `sections/section-header.liquid` ✓
- `sections/featured-collection.liquid` ✓
- `sections/banner-grid.liquid` ✓

The following block types are referenced inside sections — confirm they exist in `blocks/`:
- `blocks/_section-header.liquid` ✓
- `blocks/button-group.liquid` ✓
- `blocks/_button.liquid` ✓
- `blocks/_banner-grid-item.liquid` ✓
- `blocks/_grid-image-banner.liquid` ✓
- `blocks/heading-group.liquid` ✓
- `blocks/_heading.liquid` ✓
- `blocks/_subheading.liquid` ✓

---

- [ ] **Step 1: Read the current file**

Read `templates/list-collections.json` to confirm it currently contains a single `main-list-collections` section. Note the file has a "do not edit" comment at the top — we are intentionally replacing it.

- [ ] **Step 2: Overwrite list-collections.json with the new template**

Write the following content exactly to `templates/list-collections.json`:

```json
{
  "sections": {
    "page-title": {
      "type": "section-header",
      "settings": {
        "layout_header": "left",
        "subheading": "",
        "heading": "Collections",
        "page_title": true,
        "heading_size": "h2",
        "text": "",
        "button_label": "",
        "button_link": "",
        "color_scheme": "scheme-1",
        "padding_top": "default",
        "padding_bottom": "0px",
        "show_top_border": false,
        "show_bottom_border": false
      }
    },
    "featured-collection-1": {
      "type": "featured-collection",
      "blocks": {
        "section-header": {
          "type": "_section-header",
          "static": true,
          "settings": {
            "layout_header": "left",
            "subheading": "",
            "heading": "The Oversized Bags",
            "page_title": false,
            "heading_size": "h2",
            "text": "<p>For going out for 3 hours but packing for 3 days.</p>",
            "button_label": "",
            "button_link": ""
          },
          "blocks": {}
        },
        "button-group": {
          "type": "button-group",
          "static": true,
          "settings": {
            "horizontal_alignment": "left"
          },
          "blocks": {
            "btn-1": {
              "type": "_button",
              "settings": {
                "button_label": "View all",
                "button_link": "",
                "button_style": "secondary"
              }
            }
          },
          "blocks_order": ["btn-1"]
        }
      },
      "blocks_order": ["section-header", "button-group"],
      "settings": {
        "layout_desktop": "grid",
        "columns_desktop": "4",
        "columns_mobile": "2",
        "product_limit": 4,
        "container_type": "max",
        "color_scheme": "scheme-1",
        "padding_top": "default",
        "padding_bottom": "default",
        "show_top_border": false,
        "show_bottom_border": false
      }
    },
    "banner-grid-1": {
      "type": "banner-grid",
      "blocks": {
        "section-header": {
          "type": "_section-header",
          "static": true,
          "settings": {
            "subheading": "",
            "heading": "",
            "text": "",
            "button_label": ""
          },
          "blocks": {}
        },
        "banner-item-text": {
          "type": "_banner-grid-item",
          "settings": {
            "column_desktop": 2,
            "row_desktop": 2,
            "column_mobile": "2",
            "row_mobile": "1"
          },
          "blocks": {
            "grid-banner-text": {
              "type": "_grid-image-banner",
              "settings": {
                "horizontal_alignment": "left",
                "vertical_alignment": "middle",
                "color_scheme": "scheme-1"
              },
              "blocks": {
                "heading-group-1": {
                  "type": "heading-group",
                  "blocks": {
                    "heading-1": {
                      "type": "_heading",
                      "settings": {
                        "heading": "Yes, you need another one.",
                        "heading_size": "h3"
                      }
                    },
                    "subheading-1": {
                      "type": "_subheading",
                      "settings": {
                        "text": "Not sure why. You just do."
                      }
                    }
                  },
                  "blocks_order": ["heading-1", "subheading-1"]
                },
                "button-group-1": {
                  "type": "button-group",
                  "settings": {
                    "horizontal_alignment": "left"
                  },
                  "blocks": {
                    "btn-promo-1": {
                      "type": "_button",
                      "settings": {
                        "button_label": "Load to bag",
                        "button_link": "",
                        "button_style": "primary"
                      }
                    }
                  },
                  "blocks_order": ["btn-promo-1"]
                }
              },
              "blocks_order": ["heading-group-1", "button-group-1"]
            }
          },
          "blocks_order": ["grid-banner-text"]
        },
        "banner-item-img-1": {
          "type": "_banner-grid-item",
          "settings": {
            "column_desktop": 1,
            "row_desktop": 1,
            "column_mobile": "1",
            "row_mobile": "1"
          },
          "blocks": {
            "grid-banner-img-1": {
              "type": "_grid-image-banner",
              "settings": {
                "horizontal_alignment": "left",
                "vertical_alignment": "bottom",
                "color_scheme": "scheme-1"
              },
              "blocks": {},
              "blocks_order": []
            }
          },
          "blocks_order": ["grid-banner-img-1"]
        },
        "banner-item-img-2": {
          "type": "_banner-grid-item",
          "settings": {
            "column_desktop": 1,
            "row_desktop": 1,
            "column_mobile": "1",
            "row_mobile": "1"
          },
          "blocks": {
            "grid-banner-img-2": {
              "type": "_grid-image-banner",
              "settings": {
                "horizontal_alignment": "left",
                "vertical_alignment": "bottom",
                "color_scheme": "scheme-1"
              },
              "blocks": {},
              "blocks_order": []
            }
          },
          "blocks_order": ["grid-banner-img-2"]
        }
      },
      "blocks_order": ["banner-item-text", "banner-item-img-1", "banner-item-img-2"],
      "settings": {
        "container_type": "max",
        "height": "medium",
        "mobile_height": "small",
        "grid_gap_vertical": "var(--space-xs)",
        "grid_gap_horizontal": "var(--space-xs)",
        "color_scheme": "scheme-1",
        "padding_top": "default",
        "padding_bottom": "default",
        "show_top_border": false,
        "show_bottom_border": false
      }
    },
    "featured-collection-2": {
      "type": "featured-collection",
      "blocks": {
        "section-header": {
          "type": "_section-header",
          "static": true,
          "settings": {
            "layout_header": "left",
            "subheading": "",
            "heading": "The Mid Bags",
            "page_title": false,
            "heading_size": "h2",
            "text": "<p>Just the right size for pretending you're organised. Sort of.</p>",
            "button_label": "",
            "button_link": ""
          },
          "blocks": {}
        },
        "button-group": {
          "type": "button-group",
          "static": true,
          "settings": {
            "horizontal_alignment": "left"
          },
          "blocks": {
            "btn-2": {
              "type": "_button",
              "settings": {
                "button_label": "View all",
                "button_link": "",
                "button_style": "secondary"
              }
            }
          },
          "blocks_order": ["btn-2"]
        }
      },
      "blocks_order": ["section-header", "button-group"],
      "settings": {
        "layout_desktop": "grid",
        "columns_desktop": "4",
        "columns_mobile": "2",
        "product_limit": 4,
        "container_type": "max",
        "color_scheme": "scheme-1",
        "padding_top": "default",
        "padding_bottom": "default",
        "show_top_border": false,
        "show_bottom_border": false
      }
    },
    "banner-grid-2": {
      "type": "banner-grid",
      "blocks": {
        "section-header": {
          "type": "_section-header",
          "static": true,
          "settings": {
            "subheading": "",
            "heading": "",
            "text": "",
            "button_label": ""
          },
          "blocks": {}
        },
        "banner-item-text-2": {
          "type": "_banner-grid-item",
          "settings": {
            "column_desktop": 2,
            "row_desktop": 2,
            "column_mobile": "2",
            "row_mobile": "1"
          },
          "blocks": {
            "grid-banner-text-2": {
              "type": "_grid-image-banner",
              "settings": {
                "horizontal_alignment": "left",
                "vertical_alignment": "middle",
                "color_scheme": "scheme-2"
              },
              "blocks": {
                "heading-group-2": {
                  "type": "heading-group",
                  "blocks": {
                    "heading-2": {
                      "type": "_heading",
                      "settings": {
                        "heading": "Look, you've made it this far.",
                        "heading_size": "h3"
                      }
                    },
                    "subheading-2": {
                      "type": "_subheading",
                      "settings": {
                        "text": "Treat yourself."
                      }
                    }
                  },
                  "blocks_order": ["heading-2", "subheading-2"]
                },
                "button-group-2": {
                  "type": "button-group",
                  "settings": {
                    "horizontal_alignment": "left"
                  },
                  "blocks": {
                    "btn-promo-2": {
                      "type": "_button",
                      "settings": {
                        "button_label": "Load more",
                        "button_link": "",
                        "button_style": "primary"
                      }
                    }
                  },
                  "blocks_order": ["btn-promo-2"]
                }
              },
              "blocks_order": ["heading-group-2", "button-group-2"]
            }
          },
          "blocks_order": ["grid-banner-text-2"]
        },
        "banner-item-img-3": {
          "type": "_banner-grid-item",
          "settings": {
            "column_desktop": 1,
            "row_desktop": 1,
            "column_mobile": "1",
            "row_mobile": "1"
          },
          "blocks": {
            "grid-banner-img-3": {
              "type": "_grid-image-banner",
              "settings": {
                "horizontal_alignment": "left",
                "vertical_alignment": "bottom",
                "color_scheme": "scheme-1"
              },
              "blocks": {},
              "blocks_order": []
            }
          },
          "blocks_order": ["grid-banner-img-3"]
        },
        "banner-item-img-4": {
          "type": "_banner-grid-item",
          "settings": {
            "column_desktop": 1,
            "row_desktop": 1,
            "column_mobile": "1",
            "row_mobile": "1"
          },
          "blocks": {
            "grid-banner-img-4": {
              "type": "_grid-image-banner",
              "settings": {
                "horizontal_alignment": "left",
                "vertical_alignment": "bottom",
                "color_scheme": "scheme-1"
              },
              "blocks": {},
              "blocks_order": []
            }
          },
          "blocks_order": ["grid-banner-img-4"]
        }
      },
      "blocks_order": ["banner-item-text-2", "banner-item-img-3", "banner-item-img-4"],
      "settings": {
        "container_type": "max",
        "height": "medium",
        "mobile_height": "small",
        "grid_gap_vertical": "var(--space-xs)",
        "grid_gap_horizontal": "var(--space-xs)",
        "color_scheme": "scheme-1",
        "padding_top": "default",
        "padding_bottom": "default",
        "show_top_border": false,
        "show_bottom_border": false
      }
    },
    "featured-collection-3": {
      "type": "featured-collection",
      "blocks": {
        "section-header": {
          "type": "_section-header",
          "static": true,
          "settings": {
            "layout_header": "left",
            "subheading": "",
            "heading": "The Clutch Bags",
            "page_title": false,
            "heading_size": "h2",
            "text": "<p>For nights out. No, you can't bring a book \"just in case\".</p>",
            "button_label": "",
            "button_link": ""
          },
          "blocks": {}
        },
        "button-group": {
          "type": "button-group",
          "static": true,
          "settings": {
            "horizontal_alignment": "left"
          },
          "blocks": {
            "btn-3": {
              "type": "_button",
              "settings": {
                "button_label": "View all",
                "button_link": "",
                "button_style": "secondary"
              }
            }
          },
          "blocks_order": ["btn-3"]
        }
      },
      "blocks_order": ["section-header", "button-group"],
      "settings": {
        "layout_desktop": "grid",
        "columns_desktop": "4",
        "columns_mobile": "2",
        "product_limit": 4,
        "container_type": "max",
        "color_scheme": "scheme-1",
        "padding_top": "default",
        "padding_bottom": "default",
        "show_top_border": false,
        "show_bottom_border": false
      }
    }
  },
  "order": [
    "page-title",
    "featured-collection-1",
    "banner-grid-1",
    "featured-collection-2",
    "banner-grid-2",
    "featured-collection-3"
  ]
}
```

- [ ] **Step 3: Validate JSON syntax**

Run the following to confirm the file is valid JSON (no syntax errors):

Run from the repo root (`/Applications/XAMPP/xamppfiles/htdocs/ap-redesign-2`):

```bash
python3 -c "import json; json.load(open('templates/list-collections.json')); print('JSON valid')"
```

Expected output: `JSON valid`

If it fails, fix the syntax error reported and re-run.

- [ ] **Step 4: Commit**

```bash
git add templates/list-collections.json
git commit -m "feat: redesign /collections page as editorial product showcase"
```

- [ ] **Step 5: Preview in Shopify theme editor**

Open the Shopify theme editor for the `list-collections` template and verify:

1. **Page title section** renders "Collections" at the top with no other content
2. **Three `featured-collection` sections** appear — each shows placeholder product cards if no collection is selected yet; confirm 4-column grid layout
3. **Two `banner-grid` sections** appear between the collection sections — confirm the text panel occupies the left ~50% and two image cells stack on the right
4. No section shows an unwanted heading above the promo banners (the `_section-header` blocks inside `banner-grid` are blank)

If the theme editor reports unknown section or block types, double-check the type strings against the filenames in `sections/` and `blocks/` — they must match exactly (case-sensitive).

- [ ] **Step 6: Configure collections in the customizer**

For each `featured-collection` section, use the collection picker to select the appropriate collection (e.g. Oversized Bags, Mid Bags, Clutch Bags). Update the `button_link` values for the "View all" buttons to point to the correct collection URLs (e.g. `/collections/oversized-bags`).

For each `banner-grid` section, upload lifestyle images to the two image cells. No code changes required — all via the customizer UI.

---

## Post-Deployment Checklist

- [ ] `/collections` page renders all 3 collection groups with products
- [ ] Page H1 is "Collections" (from the `section-header` section, `page_title: true`)
- [ ] Each `featured-collection` section heading is NOT the page H1 (`page_title: false`)
- [ ] Promo banner text panels render with placeholder copy (merchant can update in customizer)
- [ ] Promo banner image cells are empty (merchant uploads images in customizer)
- [ ] Mobile: all sections stack vertically, product grid is 2 columns
- [ ] `sections/main-list-collections.liquid` still exists (not deleted)
