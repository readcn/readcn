#!/usr/bin/env -S bun
import { createServer } from "node:http";
import { join } from "node:path";
import { env } from "node:process";
import serveHandler from "serve-handler";
import ROOT from "./ROOT.js";
import site from "./site.js";

const DEFAULT_PORT = 8889,
  LOCAL = "http://127.0.0.1",
  REWRITE_LI = [{ source: "**", destination: "/index.html" }],
  siteSrv = async (root = ROOT, port = Number(env.SITE_SRV_PORT) || DEFAULT_PORT) => {
    await site(root);
    const dir = join(root, "dist/site"),
      server = createServer((req, res) =>
        serveHandler(req, res, {
          public: dir,
          rewrites: REWRITE_LI
        })
      );

    server.listen(port, () => {
      console.log(LOCAL + ":" + port + "/");
    });
  };

export default siteSrv;

if (import.meta.main) {
  await siteSrv();
}
