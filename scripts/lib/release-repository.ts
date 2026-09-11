import { readFile } from "node:fs/promises";
import path from "node:path";

export type ReleaseRepository = { owner: string; repo: string };

/**
 * The GitHub repository releases are published to, which is where the shipped
 * updater looks and so where the AppImage update information has to point too.
 * `build.publish` may redirect it away from `repository`, as the staging
 * harness does.
 */
export async function readReleaseRepository(repositoryRoot: string): Promise<ReleaseRepository> {
  const packageJson = JSON.parse(
    await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  ) as {
    build?: { publish?: { provider?: string; owner?: string; repo?: string } };
    repository: string;
  };

  const publish = packageJson.build?.publish;

  if (publish?.provider === "github" && publish.owner && publish.repo) {
    return { owner: publish.owner, repo: publish.repo };
  }

  const [owner, repo] = packageJson.repository.split("/");

  if (!owner || !repo) {
    throw new Error(
      `The package repository "${packageJson.repository}" is not <owner>/<repository>`,
    );
  }

  return { owner, repo };
}
