#!/usr/bin/env -S bun

const FRONTMATTER_SEP = "---";

export default (md) => {
  const trimmed = md.trimStart();
  if (trimmed.startsWith(FRONTMATTER_SEP)) {
    const end_pos = trimmed.indexOf("\n" + FRONTMATTER_SEP, 3);
    if (end_pos !== -1) {
      return [trimmed.slice(3, end_pos), trimmed.slice(end_pos + 4).trimStart()];
    }
  }
  return ["", trimmed];
};
