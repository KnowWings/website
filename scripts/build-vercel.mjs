import { mkdir, readdir, readFile, writeFile, copyFile, stat, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
const excludedTopLevel = new Set(['.git', '.github', 'node_modules', 'dist', 'scripts', 'package.json', 'package-lock.json', 'vercel.json', 'wrangler.jsonc', 'wrangler.json', 'wrangler.toml', '.wrangler', '.vercel', '.gitignore', '.vercel-preview-trigger', 'README.md', 'bun.lock', 'bun.lockb']);

const shouldInjectToolbar =
  process.env.VERCEL_ENV === 'preview' &&
  process.env.VERCEL_GIT_COMMIT_REF === 'vercel-toolbar-test' &&
  process.env.VERCEL_PREVIEW_FEEDBACK_ENABLED === '1';

const toolbarScript = '<script defer src="https://vercel.live/_next-live/feedback/feedback.js" data-explicit-opt-in="true" data-owner-id="team_1ewbvLLNsfyHnWSyZAlE4hX2" data-project-id="prj_dqd5JlXB646nCc8rmCxyBPoCsffi" data-branch="vercel-toolbar-test"></script>';

const footerLinks = '<div class="wrap" style="display:flex;gap:18px;flex-wrap:wrap;padding-top:14px"><a href="/careers/">Careers</a><a href="/privacy/">Privacy policy</a></div>';

function addFooterLinks(html) {
  if (html.includes('href="/careers/"') && html.includes('href="/privacy/"')) return html;
  if (/<\/footer\s*>/i.test(html)) {
    return html.replace(/<\/footer\s*>/i, footerLinks + '</footer>');
  }
  return html.replace(/<\/body\s*>/i, '<footer>' + footerLinks + '</footer></body>');
}

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
      let outputHtml = addFooterLinks(await readFile(from, 'utf8'));
      if (shouldInjectToolbar && !outputHtml.includes('vercel.live/_next-live/feedback/feedback.js')) {
        outputHtml = outputHtml.replace(/<\/body\s*>/i, toolbarScript + '\n</body>');
      }
      await writeFile(to, outputHtml);
    } else {
      await copyFile(from, to);
    }
  }
}

await rm(out, { recursive: true, force: true });
await copyTree(root, out);
console.log(shouldInjectToolbar
  ? 'Built static site with footer links and explicit Vercel Toolbar for the test Preview branch.'
  : 'Built static site with Careers and Privacy links in page footers.');
