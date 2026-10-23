#!/usr/bin/env -S bun
import { join } from "node:path";
import i18nPlugin from "@webc.site/cli/vite/i18n.js";
import stylusPlugin from "@webc.site/cli/vite/stylus.js";
import ROOT from "./sh/ROOT.js";
import blogGen from "./sh/blogGen.js";
import siteHtml from "./sh/lib/siteHtml.js";

const LOCAL_URL = "http://127.0.0.1",
  CSS_LI = ["/src/styl/_.styl", "/src/styl/demo.styl"],
  JS_SRC_LI = ["/src/webc/Site.js"],
  ASSET_PREFIX_LI = ["/src/", "/i18n/", "/@", "/node_modules/"],
  isSpaRoute = (pathname) => {
    if (pathname === "/" || pathname === "/index.html") return true;
    if (ASSET_PREFIX_LI.some((prefix) => pathname.startsWith(prefix))) {
      return false;
    }
    const last_part = pathname.split("/").pop() || "";
    return !last_part.includes(".");
  },
  blogPugPlugin = () => ({
    name: "vite-plugin-readcn-pug",
    configureServer: (server) => {
      const { watcher, middlewares } = server,
        i18n_dir = join(ROOT, "i18n");

      watcher.add(i18n_dir);
      watcher.on("all", async (_, file) => {
        if (file.startsWith(i18n_dir) && file.endsWith(".md")) {
          await blogGen(ROOT);
        }
      });

      middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url, LOCAL_URL);

        if (isSpaRoute(pathname)) {
          const html = await server.transformIndexHtml(req.url, siteHtml(CSS_LI, JS_SRC_LI));
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
          return;
        }
        next();
      });
    }
  });

export default {
  root: ROOT,
  plugins: [stylusPlugin(), blogPugPlugin(), i18nPlugin()]
};
