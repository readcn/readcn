#!/usr/bin/env -S bun
import { argv, env } from "node:process";
import killold from "@3-/killold";
import i18nGen from "@webc.site/cli/lib/i18nGen.js";
import { createServer } from "vite";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import ROOT from "./sh/ROOT.js";
import blogGen from "./sh/blogGen.js";

const ANY_IP = "0.0.0.0",
  LOCAL_IP = "127.0.0.1",
  DEFAULT_PORT = 8888,
  argvParse = () =>
    yargs(hideBin(argv))
      .option("port", {
        alias: "p",
        describe: "server port",
        type: "number",
        default: Number(env.DEV_PORT) || DEFAULT_PORT
      })
      .option("host", {
        describe: "server host",
        type: "string",
        default: ANY_IP
      })
      .help("h")
      .alias("h", "help")
      .parseSync(),
  dev = async () => {
    const { port, host } = argvParse(),
      open_host = host === ANY_IP ? LOCAL_IP : host;

    await killold();
    await i18nGen(ROOT);
    await blogGen(ROOT);

    const server = await createServer({
      root: ROOT,
      server: {
        host,
        port,
        strictPort: true
      }
    });

    await server.listen();
    console.log("http://" + open_host + ":" + port + "/");
  };

export default dev;

if (import.meta.main) {
  await dev();
}
