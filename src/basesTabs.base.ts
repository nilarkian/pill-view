// basesTabs.ts
import { App } from "obsidian";
import { parseYaml } from "obsidian";
import { findLeafForBasesView } from "./leafUtils";
import { CONTAINER_CLASS, ROW_CLASS, ACTIVE_CLASS } from "./types";

export async function injectBasesTabs(app: App) {
  const basesViews = document.querySelectorAll<HTMLElement>(".bases-view");
  if (!basesViews.length) return;

  const file = app.workspace.getActiveFile();
  if (!file || file.extension !== "base") return;

  let viewNames: string[] = [];
  try {
    const raw = await app.vault.read(file);
    const { views } = parseYaml(raw) as {
      views?: { name: string; type: string }[];
    };
    viewNames = views?.map(v => v.name) ?? [];
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

    let container =
      row.querySelector<HTMLElement>(`.${CONTAINER_CLASS}`);
      

    if (!container) {
      container = document.createElement("div");
      container.className = CONTAINER_CLASS;
      row.appendChild(container);
    }
    if (!(container as any)._basesClickBound) {
  container.addEventListener("click", async (e) => {
//    const btn = (e.target as HTMLElement).closest("button");
    const btn = (e.target as HTMLElement).closest(
  ".bases-toolbar-menu-item"
);

    if (!btn) return;

    const name = btn.textContent;

    const leaf = findLeafForBasesView(app, basesView);
    if (!leaf) return;

    if ((leaf as any).loadIfDeferred) {
      await (leaf as any).loadIfDeferred();
    }

    const controller = (leaf.view as any)?.controller;
    if (!controller) return;

    controller.selectView(name);
    updateActive(container!, name);
  });

  (container as any)._basesClickBound = true;
}


    const existing = Array.from(container.children).map(
      el => (el as HTMLElement).textContent
    );

    const same =
      existing.length === viewNames.length &&
      existing.every((n, i) => n === viewNames[i]);

    if (!same) {
      container.empty();

      for (const name of viewNames) {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.className = "suggestion-item bases-toolbar-menu-item";



        container.appendChild(btn);
      }
    }

    // sync active state
    const leaf = findLeafForBasesView(app, basesView);
    const controller = (leaf?.view as any)?.controller;
    if (controller?.getActiveView) {
      updateActive(container, controller.getActiveView().name);
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