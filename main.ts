// main.ts
import { Plugin } from "obsidian";
import { injectBasesTabs } from "./src/basesTabs.base";
import { initBasesEmbedTabs } from "./src/basesTabs.embed";

export default class ViewTabsPlugin extends Plugin {
  observer: MutationObserver | null = null;

  async onload() {
    // .base files (real Bases views)
    await injectBasesTabs(this.app);

    // embedded bases inside markdown
    initBasesEmbedTabs(this);

    this.startObserver();
  }

  onunload() {
    this.observer?.disconnect();
  }

  private startObserver() {
    this.observer = new MutationObserver(() => {
      // SAFE: injectBasesTabs is idempotent
      void injectBasesTabs(this.app);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
