#!/usr/bin/env -S bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import read from "@3-/read";
import write from "@3-/write";
import CODE_LI from "../src/js/i18n/CODE.js";
import NAME_LI from "../src/js/i18n/NAME.js";
import ROOT from "./ROOT.js";
import mdSplit from "./lib/mdSplit.js";

const SVG_BASE = "https://cdn.jsdmirror.com/gh/webc-site/svg/i18n/",
  REPO_BLOB = "https://github.com/readcn/readcn/blob/main/i18n/",
  SITE_URL = "https://readcn.github.io",
  DISCUSS_URL = "https://github.com/orgs/readcn/discussions",
  ARTICLE_REL = "2026/democracy.md",
  badgeLink = (lang, idx) => {
    const name = NAME_LI[idx],
      url = REPO_BLOB + lang + "/" + ARTICLE_REL,
      img = SVG_BASE + lang + ".svg";
    return '<a href="' + url + '"><img src="' + img + '" alt="' + name + '" /></a>';
  },
  itemLine = ([slug, [title, , date]]) =>
    "- [" + title + "](" + SITE_URL + "/" + slug + ") (`" + date + "`)",
  siteItemLi = (site_dict) => Object.entries(site_dict).map(itemLine),
  blogDict = async (root, lang) => (await import(join(root, "src/_/blog", lang + ".js"))).default,
  articleBody = (root, lang) => {
    const md_path = join(root, "i18n", lang, ARTICLE_REL);
    return existsSync(md_path) ? mdSplit(read(md_path))[1] : "";
  },
  readmeGen = async (root = ROOT) => {
    const badge_li = CODE_LI.map(badgeLink),
      [zh_site, en_site] = await Promise.all([blogDict(root, "zh"), blogDict(root, "en")]),
      zh_item_li = siteItemLi(zh_site),
      en_item_li = siteItemLi(en_site),
      zh_body = articleBody(root, "zh"),
      en_body = articleBody(root, "en"),
      content =
        badge_li.join(" ") +
        "\n\n" +
        "# [在这里，读懂中国 · Here, Understand China](" +
        SITE_URL +
        ")\n\n" +
        "> 🌐 **Website**: [" +
        SITE_URL +
        "](" +
        SITE_URL +
        ") | 💬 **Forum / Discussions**: [" +
        DISCUSS_URL +
        "](" +
        DISCUSS_URL +
        ")\n\n" +
        "## 目录 / Articles\n\n" +
        zh_item_li.join("\n") +
        "\n" +
        en_item_li.join("\n") +
        "\n\n---\n\n" +
        zh_body +
        "\n\n---\n\n" +
        en_body;

    write(join(root, "README.md"), content);
  };

export default readmeGen;

if (import.meta.main) {
  await readmeGen();
}
