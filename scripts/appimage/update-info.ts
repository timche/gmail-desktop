/*
 * Copies electron-builder's AppImage toolset into `<outputDir>` and writes the
 * AppImage update information into each runtime's `.upd_info` section, so that
 * AppImageUpdate, AppImageLauncher and the like can update an installed
 * AppImage in place.
 *
 * Usage: `bun scripts/appimage/update-info.ts <outputDir>`, then build with
 * `APPIMAGE_TOOLS_PATH` pointing at that directory.
 *
 * The runtime is patched before the build rather than the finished AppImage
 * afterwards: electron-builder writes the runtime verbatim at offset 0 of the
 * AppImage and then computes the sha512 that `latest-linux.yml` carries, which
 * any later edit would invalidate.
 */

import { cp, open, readFile } from "node:fs/promises";
import path from "node:path";
import { getAppImageTools } from "app-builder-lib/out/toolsets/linux";
import { Arch } from "builder-util";
import { readReleaseRepository } from "../lib/release-repository";
import { findElfSection } from "./elf";

const UPDATE_INFO_SECTION = ".upd_info";

// The architecture as it appears in the AppImage file name, which is what the
// update information globs over
const RUNTIMES = [
  { arch: Arch.x64, appImageArch: "x86_64" },
  { arch: Arch.arm64, appImageArch: "arm64" },
];

const outputDir = Bun.argv[2];

if (!outputDir) {
  throw new Error("Usage: bun scripts/appimage/update-info.ts <outputDir>");
}

const repositoryRoot = path.join(import.meta.dirname, "..", "..");

const packageJson = JSON.parse(
  await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
) as {
  build: { toolsets: { appimage: Parameters<typeof getAppImageTools>[0] } };
  productName: string;
};

const { owner, repo } = await readReleaseRepository(repositoryRoot);

async function writeUpdateInfo(runtimePath: string, updateInfo: string) {
  const runtime = await open(runtimePath, "r+");

  try {
    const section = findElfSection(await runtime.readFile(), UPDATE_INFO_SECTION);

    // The runtime reads the section as a C string, so the update information
    // has to leave room for at least the terminating NUL
    if (Buffer.byteLength(updateInfo, "latin1") >= section.size) {
      throw new Error(
        `"${updateInfo}" does not fit in the ${section.size}-byte ${UPDATE_INFO_SECTION} section of ${runtimePath}`,
      );
    }

    const contents = Buffer.alloc(section.size);

    contents.write(updateInfo, "latin1");

    await runtime.write(contents, 0, contents.length, section.offset);

    const written = Buffer.alloc(section.size);

    await runtime.read(written, 0, written.length, section.offset);

    if (!written.equals(contents)) {
      throw new Error(`Writing the update information into ${runtimePath} did not take`);
    }
  } finally {
    await runtime.close();
  }
}

let toolsetRoot: string | undefined;

for (const { arch, appImageArch } of RUNTIMES) {
  const { runtime } = await getAppImageTools(packageJson.build.toolsets.appimage, arch);

  const root = path.dirname(path.dirname(runtime));

  if (toolsetRoot === undefined) {
    toolsetRoot = root;

    await cp(toolsetRoot, outputDir, { recursive: true });
  } else if (root !== toolsetRoot) {
    throw new Error(`The ${appImageArch} runtime is in ${root} rather than in ${toolsetRoot}`);
  }

  await writeUpdateInfo(
    path.join(outputDir, path.relative(toolsetRoot, runtime)),
    `gh-releases-zsync|${owner}|${repo}|latest|${packageJson.productName}-*-${appImageArch}.AppImage.zsync`,
  );
}
