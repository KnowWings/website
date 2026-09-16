import { mkdir, readdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
const excludedTopLevel = new Set(['.git', '.github', 'node_modules', 'dist', 'scripts', 'package.json', 'package-lock.json', 'vercel.json']);

const branch = process.env.VERCEL_GIT_COMMIT_REF || 'main';
const toolbar = `<script async src="https://vercel.live/_next-live/feedback/feedback.js" data-explicit-opt-in="true" data-owner-id="team_LU8IUSQdZE88J30B5TkTe1mS" data-project-id="prj_dqd5JlXB646nCc8rmCxyBPoCsffi" data-branch="${branch}"></script>`;

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
      let html = await readFile(from, 'utf8');
      if (!html.includes('vercel.live/_next-live/feedback/feedback.js')) {
        html = html.includes('</body>') ? html.replace('</body>', `${toolbar}</body>`) : `${html}\n${toolbar}\n`;
      }
      await writeFile(to, html);
    } else {
      await copyFile(from, to);
    }
  }
}

await copyTree(root, out);
console.log(`Built Vercel static site with toolbar enabled on all HTML pages for branch ${branch}.`);
