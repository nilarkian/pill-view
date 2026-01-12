// basesEmbedParser.ts
import { Plugin, TFile } from "obsidian";

/**
 * Reads the markdown file, finds the first ```base block,
 * and returns extracted view names.
 */
export async function readBaseViewNames(
  plugin: Plugin,
  sourcePath: string
): Promise<string[] | null> {
  const file = plugin.app.vault.getAbstractFileByPath(sourcePath);
  if (!(file instanceof TFile)) return null;

  const content = await plugin.app.vault.read(file);

  const baseBlocks = content.match(/```base[\s\S]*?```/g);
  if (!baseBlocks || baseBlocks.length === 0) return null;

  // For now: first base block only (matches current embed behavior)
  const block = baseBlocks[0];

  const names = [...block.matchAll(/^\s*name:\s*([^\n]+)/gm)]

    .map((m) => m[1].trim());

  return names.length ? names : null;
}
