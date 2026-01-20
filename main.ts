// main.ts
import { Plugin, TFile } from "obsidian";
import { injectBasesTabs } from "./src/basesTabs.base";
import { initBasesEmbedTabs } from "./src/basesTabs.embed";

export default class ViewTabsPlugin extends Plugin {
  observer: MutationObserver | null = null;
  private refreshQueued = false;

  onload() {
    // base views
    void injectBasesTabs(this.app);

    // embedded bases (one-time setup)
    initBasesEmbedTabs(this);

    // data-level changes (views added / reordered)
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (!(file instanceof TFile) || file.extension !== "base") return;

        if (this.refreshQueued) return;
        this.refreshQueued = true;

        requestAnimationFrame(() => {
          this.refreshQueued = false;
          void injectBasesTabs(this.app);
        });
      })
    );

    // DOM-level changes (panes, embeds mounting)
    this.startObserver();
  }

  onunload() {
    this.observer?.disconnect();
  }

  private startObserver() {
    this.observer = new MutationObserver(() => {
      // IMPORTANT:
      // - injectBasesTabs is idempotent
      // - initBasesEmbedTabs must NOT be rerun
      void injectBasesTabs(this.app);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
