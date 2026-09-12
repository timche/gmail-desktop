import { readFile } from "node:fs/promises";
import path from "node:path";
import { getRepositoryInfo } from "app-builder-lib/out/util/repositoryInfo";

export type ReleaseRepository = { owner: string; repo: string };

type PublishConfiguration = { provider?: string; owner?: string; repo?: string };

/**
 * The GitHub repository releases are published to, which is where the shipped
 * updater looks and so where the AppImage update information has to point too.
 * Resolved the way electron-builder resolves it, so a `build.publish` that
 * redirects releases, as the staging harness does, redirects these as well.
 */
export async function readReleaseRepository(repositoryRoot: string): Promise<ReleaseRepository> {
  const packageJson = JSON.parse(
    await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  ) as {
    build?: { publish?: PublishConfiguration | PublishConfiguration[] | string };
    repository?: string;
  };

  const publish = [packageJson.build?.publish]
    .flat()
    .find(
      (entry): entry is PublishConfiguration =>
        typeof entry === "object" && entry.provider === "github",
    );

  let owner = publish?.owner;

  let repo = publish?.repo;

  if (!owner || !repo) {
    const info = await getRepositoryInfo(repositoryRoot, { repository: packageJson.repository });

    if (info === null) {
      throw new Error(`The repository in ${repositoryRoot} cannot be resolved to <owner>/<repo>`);
    }

    owner ??= info.user;

    repo ??= info.project;
  }

  return { owner, repo };
}
