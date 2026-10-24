#!/usr/bin/env -S bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import read from "@3-/read";
import write from "@3-/write";
import CODE_LI from "../src/js/i18n/CODE.js";
import NAME_LI from "../src/js/i18n/NAME.js";
import ROOT from "./ROOT.js";

const README_MD = "README.md",
  DEFAULT_LANG = "en",
  FALLBACK_LANG = "zh",
  SVG_BASE = "https://cdn.jsdmirror.com/gh/webc-site/svg/i18n/",
  REPO_BLOB = "//github.com/readcn/readcn/blob/main/i18n/",
  badgeLink = (lang, idx) => {
    const name = NAME_LI[idx],
      url = REPO_BLOB + lang + "/" + README_MD,
      img = SVG_BASE + lang + ".svg";
    return '<a href="' + url + '"><img src="' + img + '" alt="' + name + '" /></a>';
  },
  BADGE_HEAD = CODE_LI.map(badgeLink).join(" ") + "\n\n",
  readmeGen = async (root = ROOT) => {
    const i18n_dir = join(root, "i18n"),
      en_path = join(i18n_dir, DEFAULT_LANG, README_MD),
      from_path = existsSync(en_path) ? en_path : join(i18n_dir, FALLBACK_LANG, README_MD);

    if (!existsSync(from_path)) return;

    write(join(root, README_MD), BADGE_HEAD + read(from_path).trimStart());
  };

export default readmeGen;

if (import.meta.main) {
  await readmeGen();
}
