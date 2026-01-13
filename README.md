# Bases View Tabs (Obsidian Plugin)
<a href="https://www.buymeacoffee.com/nilarkian" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="20" width="85"></a>
[![GitHub license](https://img.shields.io/github/license/stufro/obsidian-hill-charts)](https://github.com/nilarkian/pill-view/blob/main/LICENSE)
Adds **pill-style tabs** for switching between views in **Obsidian Bases**, both for:

* native `.base` files (real Bases views)
* embedded ` ```base ` blocks inside Markdown notes

The goal is fast, visible, zero-friction view switching without opening the Bases view menu.

---

## What this plugin does

* Renders a row of **pill tabs** above a Bases view
* Each tab maps directly to a Base **view name** (Table, List, custom views, etc.)
* Clicking a tab switches the active view immediately
* Works consistently for:

  * standalone `.base` files
  * embedded Bases inside Markdown previews

---

## Key features

* **Automatic view detection**
  View names are parsed directly from the Base definition (YAML), not hardcoded.

* **Two execution paths (by design)**

  * `basesTabs.base.ts` → real Bases views
  * `basesTabs.embed.ts` → embedded Bases in Markdown
    This avoids fragile cross-context hacks.

* **Zero user configuration**
  No settings, no commands, no UI toggles.

* **Minimal DOM footprint**
  Tabs are injected only once per view and re-used.

---

## How it works (high level)

### `.base` files

* Finds the active `bases` workspace leaf
* Reads view names from the Base file
* Injects a tab row above the Bases header
* Uses the internal Bases host to trigger view switching correctly

### Embedded Bases

* Observes Markdown preview DOM via `MutationObserver`
* Detects `cm-lang-base` code blocks
* Parses the embedded Base YAML
* Injects tabs directly above the embedded Bases header
* Switches views using the same internal host path the UI menu uses

---

## File layout

```
src/
├─ main.ts                 # Plugin entry + wiring
├─ basesTabs.base.ts       # Tabs for real .base views
├─ basesTabs.embed.ts      # Tabs for embedded Bases
├─ basesEmbedParser.ts     # YAML parsing for embedded bases
├─ leafUtils.ts            # Bases leaf resolution helpers
├─ types.ts                # Shared CSS class constants
```

---

## Status / limitations

* Designed specifically for **Obsidian Bases**
* Assumes standard Bases DOM structure (future Obsidian changes may break it)
* No mobile-specific handling yet

---

## Why this exists

The built-in Bases view switcher is hidden, click-heavy, and slow.
This plugin surfaces views as **first-class tabs**, making Bases feel closer to a spreadsheet or database UI.
