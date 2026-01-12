// basesTabs.embed.ts
import { Plugin } from "obsidian";
import { readBaseViewNames } from "./basesEmbedParser";

const CONTAINER_CLASS = "pill-tabs-container";

type EmbedWithCache = HTMLElement & {
  _pillViewNames?: string[];
  _basesHeader?: HTMLElement;
};

let hideStyleInstalled = false;

function ensureHiddenMenuStyle() {
  if (hideStyleInstalled) return;
  hideStyleInstalled = true;

  const style = document.createElement("style");
  style.textContent = `
    body.pill-hide-bases-menu .menu.bases-toolbar-views-menu {
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
}

export function initBasesEmbedTabs(plugin: Plugin) {
  const observer = new MutationObserver((mutations) => {
    const activeFile = plugin.app.workspace.getActiveFile();
    if (!activeFile) return;

    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        // HARD GATE: only Base embeds
        if (
          !node.classList.contains("cm-embed-block") ||
          !node.classList.contains("cm-lang-base")
        ) {
          continue;
        }

        const embed = node as EmbedWithCache;

        if (!embed._basesHeader) {
          const header = embed.querySelector(".bases-header");
          if (!(header instanceof HTMLElement)) continue;
          embed._basesHeader = header;
        }

        const header = embed._basesHeader;

        // Inject tabs once
        if (!embed.querySelector(`.${CONTAINER_CLASS}`)) {
          injectTabs(embed, header);
        }

        // Load view names once
        if (!embed._pillViewNames) {
          readBaseViewNames(plugin, activeFile.path).then((names) => {
            if (!names) return;
            embed._pillViewNames = names;
            removeTabs(embed);
            injectTabs(embed, header);
          });
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  plugin.register(() => observer.disconnect());
}

function removeTabs(embed: HTMLElement) {
  embed.querySelector(`.${CONTAINER_CLASS}`)?.remove();
}

function injectTabs(embed: EmbedWithCache, header: HTMLElement) {
  if (embed.querySelector(`.${CONTAINER_CLASS}`)) return;

  const container = document.createElement("div");
  container.className = CONTAINER_CLASS;

  const names = embed._pillViewNames;
  const count = names?.length ?? 5;

  for (let i = 0; i < count; i++) {
    const btn = document.createElement("button");
    btn.textContent = names?.[i] ?? `View ${i + 1}`;
    btn.dataset.index = String(i);
    container.appendChild(btn);
  }

  container.onclick = (e) => {
    const btn = (e.target as HTMLElement)?.closest("button");
    if (!btn) return;

    const index = Number(btn.dataset.index);
    setActive(container, btn);
    requestAnimationFrame(() => switchEmbedViewByIndex(embed, index));
  };

  header.after(container);
}

function setActive(container: HTMLElement, active: HTMLElement) {
  container.querySelector(".is-active")?.classList.remove("is-active");
  active.classList.add("is-active");
}

function switchEmbedViewByIndex(embed: EmbedWithCache, index: number) {
  const header = embed._basesHeader;
  if (!header) return;

  const viewButton = header.querySelector<HTMLElement>(".text-icon-button");
  if (!viewButton) return;

  ensureHiddenMenuStyle();
  document.body.classList.add("pill-hide-bases-menu");

  viewButton.click();

  requestAnimationFrame(() => {
    const menu = document.querySelector(
      ".menu.bases-toolbar-views-menu"
    ) as HTMLElement | null;

    if (!menu) {
      document.body.classList.remove("pill-hide-bases-menu");
      return;
    }

    const items = menu.querySelectorAll<HTMLElement>(
      ".suggestion-item.bases-toolbar-menu-item"
      
    );

    items[index]?.click();

    requestAnimationFrame(() => {
      document.body.classList.remove("pill-hide-bases-menu");
    });
  });
}
