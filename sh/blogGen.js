#!/usr/bin/env -S bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FILE } from "@1-/walk";
import walkRelIgnore from "@1-/walk/walkRelIgnore.js";
import loadsYml from "@1-/yml/loads.js";
import read from "@3-/read";
import write from "@3-/write";
import mdTitle from "@webc.site/cli/lib/mdTitle.js";
import CODE_LI from "../src/js/i18n/CODE.js";
import ROOT from "./ROOT.js";
import mdSplit from "./lib/mdSplit.js";

const MD_EXT = ".md",
  README_MD = "README.md",
  DEFAULT_LANG = "zh",
  paraFirst = (body) =>
    body
      .split("\n")
      .map((line) => line.trim())
      .find((txt) => txt && !txt.startsWith("#")) || "",
  mdParse = (file_path, url) => {
    const [head_yml, body] = mdSplit(read(file_path));
    let date = "",
      summary = "";

    if (head_yml) {
      const head = loadsYml(head_yml);
      if (head) {
        const { date: raw_date, summary: raw_summary } = head;
        if (raw_date) date = String(raw_date).trim();
        if (raw_summary) summary = String(raw_summary).trim();
      }
    }

    if (!summary) summary = paraFirst(body);

    return [url, mdTitle(file_path, url) || "", summary, date];
  },
  langBlog = async (blog_dir) => {
    const item_li = [];
    await walkRelIgnore(blog_dir, (kind, rel_path) => {
      if (kind === FILE && rel_path.endsWith(MD_EXT) && rel_path !== README_MD) {
        item_li.push(mdParse(join(blog_dir, rel_path), rel_path.slice(0, -3)));
      }
    });

    if (!item_li.length) return null;

    item_li.sort(
      ([, , , date_a], [, , , date_b]) =>
        (date_b ? new Date(date_b) : 0) - (date_a ? new Date(date_a) : 0)
    );

    return Object.fromEntries(
      item_li.map(([url, title, summary, date]) => [url, [title, summary, date]])
    );
  },
  blogGen = async (root = ROOT, out_dir = join(root, "src/_/blog")) => {
    const zh_dir = join(root, "i18n", DEFAULT_LANG),
      zh_dict = (existsSync(zh_dir) ? await langBlog(zh_dir) : null) || {};

    for (const lang of CODE_LI) {
      const blog_dir = join(root, "i18n", lang),
        dict = existsSync(blog_dir) ? await langBlog(blog_dir) : zh_dict;
      if (dict) {
        write(join(out_dir, lang + ".js"), "export default " + JSON.stringify(dict, null, 2) + ";\n");
      }
    }

    return zh_dict;
  };

export default blogGen;

if (import.meta.main) {
  await blogGen();
}
