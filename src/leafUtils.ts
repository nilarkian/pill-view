// leafUtils.ts
import { WorkspaceLeaf, App } from "obsidian";

type BasesView = {
  containerEl: HTMLElement;
};

export function findLeafForBasesView(
  app: App,
  el: HTMLElement
): WorkspaceLeaf | null {
  const leaves = app.workspace.getLeavesOfType("bases");

  for (const leaf of leaves) {
    const view = leaf.view as unknown as BasesView;
    if (view.containerEl === el) return leaf;
  }

  return app.workspace.getMostRecentLeaf();
}
