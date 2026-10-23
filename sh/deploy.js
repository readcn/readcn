#!/usr/bin/env -S bun
import { join } from "node:path";
import { chdir, env } from "node:process";
import { $ } from "zx";
import ROOT from "./ROOT.js";
import site from "./site.js";

const DEFAULT_OWNER = "readcn",
  DEFAULT_REPO = "readcn/readcn",
  deploy = async (root = ROOT) => {
    await site(root);

    const {
        GH_TOKEN: gh_token,
        GITHUB_REPOSITORY: repo = DEFAULT_REPO,
        GITHUB_REPOSITORY_OWNER: owner = DEFAULT_OWNER
      } = env,
      site_dir = join(root, "dist/site"),
      email = owner + "@users.noreply.github.com",
      msg = "deploy: " + owner,
      remote_url =
        "https://x-access-token:" + gh_token + "@github.com/" + owner + "/" + owner + ".github.io.git";

    chdir(site_dir);
    await $`git init`;
    await $`git config user.name ${repo}`;
    await $`git config user.email ${email}`;
    await $`git add .`;
    await $`git commit -q -m ${msg}`;
    await $`git branch -M main`;
    await $`git remote add origin ${remote_url}`;
    await $`git push -u origin main -f`;
  };

export default deploy;

if (import.meta.main) {
  await deploy();
}
