import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "lib", "server");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "entities") walk(full, files);
    else if (entry.isFile() && entry.name.endsWith(".ts")) files.push(full);
  }
  return files;
}

const entityImportRe =
  /import\s*\{([^}]+)\}\s*from\s*['"]@\/lib\/server\/entities\/[^'"]+\.entity['"];?\s*\n?/g;

for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  const matches = [...content.matchAll(entityImportRe)];
  if (!matches.length) continue;

  const names = new Set();
  for (const m of matches) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.add(name);
    }
  }

  content = content.replace(entityImportRe, "");
  const importLine = `import { ${[...names].join(", ")} } from "@/lib/server/entities";\n`;
  const reflectIdx = content.indexOf('import "reflect-metadata"');
  const firstImport = content.search(/^import /m);
  const insertAt = reflectIdx >= 0 ? content.indexOf("\n", reflectIdx) + 1 : firstImport;
  content = content.slice(0, insertAt) + importLine + content.slice(insertAt);

  fs.writeFileSync(file, content);
  console.log("fixed", path.relative(root, file));
}
