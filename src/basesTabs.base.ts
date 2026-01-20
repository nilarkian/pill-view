// basesTabs.ts
import { App } from "obsidian";
import { parseYaml } from "obsidian";
import { findLeafForBasesView } from "./leafUtils";
import { CONTAINER_CLASS, ROW_CLASS, ACTIVE_CLASS } from "./types";

type BasesContainer = HTMLElement & {
  _basesClickBound?: boolean;
};

type DeferredLeaf = {
  loadIfDeferred?: () => Promise<void>;
};

type BasesController = {
  selectView: (name: string | null) => void;
  getActiveView?: () => { name?: string };
};

export async function injectBasesTabs(app: App) {
  const basesViews = document.querySelectorAll<HTMLElement>(".bases-view");
  if (!basesViews.length) return;

  const file = app.workspace.getActiveFile();
  if (!file || file.extension !== "base") return;

  let viewNames: string[] = [];
  try {
    const raw = await app.vault.read(file);
    const parsed = parseYaml(raw) as {
      views?: { name: string; type: string }[];
    };
    viewNames = parsed.views?.map(v => v.name) ?? [];
  } catch {
    return;
  }

  basesViews.forEach((basesView) => {
    if (basesView.closest(".cm-embed-block.cm-lang-base")) return;

    const root = basesView.parentElement;
    if (!root) return;

    const header = root.querySelector<HTMLElement>(".bases-header");
    if (!header) return;

    // ---- row AFTER header ----
    let row = header.nextElementSibling as HTMLElement | null;
    if (!row || !row.classList.contains(ROW_CLASS)) {
      row = document.createElement("div");
      row.className = `bases-header-row ${ROW_CLASS}`;
      header.after(row);
    }

    let container = row.querySelector<HTMLElement>(`.${CONTAINER_CLASS}`);
    if (!container) {
      container = document.createElement("div");
      container.className = CONTAINER_CLASS;
      row.appendChild(container);
    }

    const basesContainer = container as BasesContainer;

    if (!basesContainer._basesClickBound) {
      basesContainer.addEventListener("click", (e) => {
        void (async () => {
          const btn = (e.target as HTMLElement).closest(
            ".bases-toolbar-menu-item"
          );
          if (!btn) return;

          const name = btn.textContent;

          const leaf = findLeafForBasesView(app, basesView);
          if (!leaf) return;

          const deferred = leaf as unknown as DeferredLeaf;
          if (deferred.loadIfDeferred) {
            await deferred.loadIfDeferred();
          }

          const controller = (leaf.view as unknown as { controller?: BasesController })
            ?.controller;
          if (!controller) return;

          controller.selectView(name);
          updateActive(basesContainer, name);
        })();
      });

      basesContainer._basesClickBound = true;
    }

    const existing = Array.from(basesContainer.children).map(
      el => (el as HTMLElement).textContent
    );

    const same =
      existing.length === viewNames.length &&
      existing.every((n, i) => n === viewNames[i]);

    if (!same) {
      basesContainer.empty();

      for (const name of viewNames) {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.className = "suggestion-item bases-toolbar-menu-item";
        basesContainer.appendChild(btn);
      }
    }

    // sync active state
    const leaf = findLeafForBasesView(app, basesView);
    const controller = (leaf?.view as unknown as { controller?: BasesController })
      ?.controller;

    if (controller?.getActiveView) {
      updateActive(basesContainer, controller.getActiveView().name);
    }
  });
}

function updateActive(container: HTMLElement, activeName?: string) {
  Array.from(container.children).forEach((el) => {
    el.classList.toggle(
      ACTIVE_CLASS,
      (el as HTMLElement).innerText === activeName
    );
  });
}
