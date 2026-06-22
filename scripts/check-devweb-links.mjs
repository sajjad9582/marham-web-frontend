#!/usr/bin/env node
/**
 * Fails if production build output contains devweb.marham.pk references.
 * Usage: npm run build && node scripts/check-devweb-links.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = ".next";
const FORBIDDEN = "devweb.marham.pk";

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(html|js|json|rsc)$/.test(entry)) files.push(full);
  }
  return files;
}

function main() {

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (siteUrl.includes("devweb.")) {
    console.log("Skipping devweb check: NEXT_PUBLIC_SITE_URL is staging.");
    return;
  }

  if (!existsSync(OUT_DIR)) {
    console.error(`Missing ${OUT_DIR}. Run npm run build first.`);
    process.exit(1);
  }

  const offenders = [];
  for (const file of walk(OUT_DIR)) {
    const content = readFileSync(file, "utf8");
    if (content.includes(FORBIDDEN)) offenders.push(file);
  }

  if (offenders.length > 0) {
    console.error(`Found forbidden host "${FORBIDDEN}" in ${offenders.length} file(s):`);
    offenders.slice(0, 20).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log("OK: no devweb.marham.pk references in build output.");
}

main();
