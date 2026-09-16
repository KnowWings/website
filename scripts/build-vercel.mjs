import { mkdir, readdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
const excludedTopLevel = new Set(['.git', '.github', 'node_modules', 'dist', 'scripts', 'package.json', 'package-lock.json', 'vercel.json']);

async function copyTree(src, dest, depth = 0) {
  await mkdir(dest, { recursive: true });
  for (const name of await readdir(src)) {
    if (depth === 0 && excludedTopLevel.has(name)) continue;
    const from = path.join(src, name);
    const to = path.join(dest, name);
    const info = await stat(from);
    if (info.isDirectory()) {
      await copyTree(from, to, depth + 1);
      continue;
    }
    if (!info.isFile()) continue;
    if (name.endsWith('.html')) {
      const html = await readFile(from, 'utf8');
      await writeFile(to, html);
    } else {
      await copyFile(from, to);
    }
  }
}

await copyTree(root, out);
console.log('Built Vercel static site without custom toolbar injection so Preview can use Vercel native Toolbar.');
