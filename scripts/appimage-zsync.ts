/*
 * Writes a .zsync control file beside each AppImage in `dist` and uploads it to
 * the release, which is what the update information embedded in the runtime
 * sends AppImage update tools looking for.
 *
 * Usage: `bun scripts/appimage-zsync.ts <tag>`.
 */

import path from "node:path";
import { $, Glob } from "bun";
import { readReleaseRepository } from "./lib/release-repository";

const APP_IMAGE_EXTENSION = ".AppImage";

const tag = Bun.argv[2];

if (!tag) {
  throw new Error("Usage: bun scripts/appimage-zsync.ts <tag>");
}

const repositoryRoot = path.join(import.meta.dirname, "..");

const { owner, repo } = await readReleaseRepository(repositoryRoot);

const distDir = path.join(repositoryRoot, "dist");

const zsyncFiles: string[] = [];

for await (const appImage of new Glob(`*${APP_IMAGE_EXTENSION}`).scan(distDir)) {
  const name = appImage.slice(0, -APP_IMAGE_EXTENSION.length);

  // The x64 AppImage carries no architecture in its name, and the update
  // information's `-x86_64` glob has to not match the arm64 file
  const zsyncFile = path.join(
    distDir,
    name.endsWith("-arm64") ? `${appImage}.zsync` : `${name}-x86_64${APP_IMAGE_EXTENSION}.zsync`,
  );

  const url = `https://github.com/${owner}/${repo}/releases/download/${tag}/${appImage}`;

  await $`zsyncmake -u ${url} -o ${zsyncFile} ${path.join(distDir, appImage)}`;

  zsyncFiles.push(zsyncFile);
}

if (zsyncFiles.length === 0) {
  throw new Error(`No AppImage to write a .zsync file for in ${distDir}`);
}

await $`gh release upload ${tag} ${zsyncFiles} --clobber --repo ${owner}/${repo}`;
