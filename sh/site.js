#!/usr/bin/env -S bun
import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import write from "@3-/write";
import i18nGen from "@webc.site/cli/lib/i18nGen.js";
import npm from "@webc.site/cli/lib/npm.js";
import publicCp from "@webc.site/cli/lib/publicCp.js";
import stylSvg from "@webc.site/cli/lib/stylSvg.js";
import ROOT from "./ROOT.js";
import blogGen from "./blogGen.js";
import siteHtml from "./lib/siteHtml.js";
import rssGen from "./rssGen.js";

const SITE = "site",
  CSS_LI = ["/_.css"],
  JS_SRC_LI = ["/Site.js"],
  PAGE_LI = ["index", "404"],
  site = async (root = ROOT) => {
    const site_dir = join(root, "dist", SITE),
      src_dir = join(root, "src"),
      i18n_src = join(root, "i18n"),
      i18n_cache = join(i18n_src, ".cache"),
      blog_out_dir = join(site_dir, "_/blog");

    if (existsSync(site_dir)) {
      rmSync(site_dir, { recursive: true, force: true });
    }

    await i18nGen(root);
    await blogGen(root);
    await rssGen(root);
    await npm(root, SITE, false);
    await stylSvg(join(src_dir, "styl/demo.styl"), join(site_dir, "_.css"), false);

    const zh_dict = await blogGen(root, blog_out_dir);

    cpSync(i18n_src, join(site_dir, "i18n"), {
      recursive: true,
      filter: (src) => !src.startsWith(i18n_cache)
    });
    publicCp(root, site_dir);

    const html = siteHtml(CSS_LI, JS_SRC_LI, root),
      route_li = [...PAGE_LI, ...Object.keys(zh_dict || {})];

    route_li.forEach((rel) => write(join(site_dir, rel + ".html"), html));
    write(join(site_dir, ".nojekyll"), "");
  };

export default site;

if (import.meta.main) {
  await site();
}
