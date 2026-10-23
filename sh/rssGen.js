#!/usr/bin/env -S bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import loadYml from "@1-/yml/load.js";
import read from "@3-/read";
import write from "@3-/write";
import DEFAULT_TITLE from "../src/conf/TITLE.js";
import CODE_LI from "../src/js/i18n/CODE.js";
import mdHtm from "../src/js/md/htm.js";
import ROOT from "./ROOT.js";
import SITE_URL from "./lib/SITE_URL.js";
import blogDict from "./lib/blogDict.js";
import mdSplit from "./lib/mdSplit.js";

const DEFAULT_LANG = "zh",
  xmlEsc = (str) =>
    String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;"),
  cdataWrap = (str) => "<![CDATA[" + String(str || "").replaceAll("]]>", "]]]]><![CDATA[>") + "]]>",
  mdBodyStripH1 = (md) => {
    const [, body] = mdSplit(md),
      full = "\n" + body.trimStart(),
      pos = full.indexOf("\n#");
    return (pos !== -1 ? full.slice(full.indexOf("\n", pos + 1) + 1) : body).trimStart();
  },
  siteTitle = (root, lang) => {
    const yml_path = join(root, "src/webc/Site/i18n", lang, "js.yml");
    if (!existsSync(yml_path)) return DEFAULT_TITLE;
    const data = loadYml(yml_path);
    return data?.title || DEFAULT_TITLE;
  },
  rssItem = (root, lang, [slug, [title, summary, date]]) => {
    const link = SITE_URL + "/" + slug,
      pub_date = date ? new Date(date + "T00:00:00Z").toUTCString() : new Date().toUTCString(),
      md_path = join(root, "i18n", lang, slug + ".md"),
      raw_md = existsSync(md_path) ? read(md_path) : "",
      html_body = raw_md ? mdHtm(mdBodyStripH1(raw_md)) : mdHtm(summary || "");

    return (
      "    <item>\n" +
      "      <title>" +
      xmlEsc(title) +
      "</title>\n" +
      "      <link>" +
      xmlEsc(link) +
      "</link>\n" +
      '      <guid isPermaLink="true">' +
      xmlEsc(link) +
      "</guid>\n" +
      "      <pubDate>" +
      xmlEsc(pub_date) +
      "</pubDate>\n" +
      "      <description>" +
      xmlEsc(summary) +
      "</description>\n" +
      "      <content:encoded>" +
      cdataWrap(html_body) +
      "</content:encoded>\n" +
      "    </item>"
    );
  },
  rssFeedXml = (root, lang, dict, feed_path) => {
    const title = siteTitle(root, lang),
      self_url = SITE_URL + feed_path,
      item_xml_li = Object.entries(dict).map(rssItem.bind(null, root, lang));

    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n' +
      "  <channel>\n" +
      "    <title>" +
      xmlEsc(title) +
      "</title>\n" +
      "    <link>" +
      SITE_URL +
      "/</link>\n" +
      "    <description>" +
      xmlEsc(title) +
      "</description>\n" +
      "    <language>" +
      xmlEsc(lang) +
      "</language>\n" +
      '    <atom:link href="' +
      xmlEsc(self_url) +
      '" rel="self" type="application/rss+xml"/>\n' +
      item_xml_li.join("\n") +
      "\n  </channel>\n" +
      "</rss>\n"
    );
  },
  rssGen = async (root = ROOT, out_dir = join(root, "public")) => {
    for (const lang of CODE_LI) {
      const dict = await blogDict(root, lang);
      if (!dict) continue;
      const rel_feed = "/rss/" + lang + ".xml",
        xml = rssFeedXml(root, lang, dict, rel_feed);

      write(join(out_dir, "rss", lang + ".xml"), xml);
      if (lang === DEFAULT_LANG) {
        write(join(out_dir, "rss.xml"), rssFeedXml(root, lang, dict, "/rss.xml"));
      }
    }
  };

export default rssGen;

if (import.meta.main) {
  await rssGen();
}
