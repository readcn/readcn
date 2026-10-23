#!/usr/bin/env -S bun
import { dirname } from "node:path";

export default dirname(import.meta.dirname);
