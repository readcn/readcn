#!/usr/bin/env -S bun
import { join } from "node:path";
import pug from "pug";
import TITLE from "../../src/conf/TITLE.js";
import ROOT from "../ROOT.js";

const DEFAULT_PUG_REL = "src/pug/default.pug",
  DEFAULT_PUG_PATH = join(ROOT, DEFAULT_PUG_REL),
  BODY = "<c-site></c-site>";

export default (css_li, js_src_li, root = ROOT) => {
  const filename = root === ROOT ? DEFAULT_PUG_PATH : join(root, DEFAULT_PUG_REL);
  return pug.renderFile(filename, {
    filename,
    pretty: true,
    title: TITLE,
    body: BODY,
    css_li,
    js_src_li
  });
};
