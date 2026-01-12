// leafUtils.ts
import { WorkspaceLeaf, App } from "obsidian";

export function findLeafForBasesView(
  app: App,
  el: HTMLElement
): WorkspaceLeaf | null {
  const leaves = app.workspace.getLeavesOfType("bases");
  for (const leaf of leaves) {
    if ((leaf.view as any)?.containerEl === el) return leaf;
  }
  return app.workspace.getMostRecentLeaf();
}