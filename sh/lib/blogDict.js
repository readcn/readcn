#!/usr/bin/env -S bun
import { existsSync } from "node:fs";
import { join } from "node:path";

export default async (root, lang) => {
  const blog_js = join(root, "src/_/blog", lang + ".js");
  return existsSync(blog_js) ? (await import(blog_js)).default : null;
};
