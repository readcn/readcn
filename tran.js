#!/usr/bin/env -S bun
import { rmSync } from "node:fs";
import { join } from "node:path";
import { chdir } from "node:process";
import tran from "@1-/tran";
import i18nGen from "@webc.site/cli/lib/i18nGen.js";
import blogGen from "./sh/blogGen.js";
import readmeGen from "./sh/readme.js";
import rssGen from "./sh/rssGen.js";

const ROOT = import.meta.dirname,
  main = async () => {
    chdir(ROOT);
    rmSync(join(ROOT, "dist"), { recursive: true, force: true });
    await i18nGen(ROOT);
    await tran(ROOT);
    await blogGen(ROOT);
    await rssGen(ROOT);
    await readmeGen(ROOT);
  };

export default main;

if (import.meta.main) {
  await main();
}
