#!/usr/bin/env node
/**
 * Scan icons/svg/{category}/{name}.svg → icons/manifest.json + public/icons/
 *
 * Optional: --import-from <dir>  将扁平 SVG 目录按启发式分类导入 icons/svg/
 *
 * Usage:
 *   node scripts/generate-icon-manifest.mjs
 *   node scripts/generate-icon-manifest.mjs --import-from ~/Downloads/hyperos-icon-lib
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVG_ROOT = join(ROOT, 'icons', 'svg');
const MANIFEST_PATH = join(ROOT, 'icons', 'manifest.json');
const PUBLIC_ROOT = join(ROOT, 'public', 'icons');

const CATEGORY_LABELS = {
  navigation: '导航',
  action: '操作',
  edit: '编辑',
  location: '位置',
  ai: '智能',
  system: '系统',
  people: '人',
  time: '时间',
  misc: '其他',
};

/** @param {string} name basename without extension */
function categorize(name) {
  if (
    /^(back|forward|chevron_)/i.test(name) ||
    /^NavBar/i.test(name) ||
    name === 'forward'
  ) {
    return 'navigation';
  }
  if (
    /^(download|file_downloads|import|share|remove|refresh|undo|redo|reset|replace|merge|update|rotate_left|sort|zoom_out)$/i.test(
      name,
    )
  ) {
    return 'action';
  }
  if (/删除内容|插入文本|放大|缩小|上滑/.test(name)) return 'edit';
  if (/到达地点|离开地点/.test(name)) return 'location';
  if (/^IC-|技能推荐|输入模块/.test(name)) return 'ai';
  if (/超级文件|列表缓存/.test(name)) return 'system';
  if (/^(alarm|timer|months|weeks|years|th_20)$/i.test(name) || /时间/.test(name)) {
    return 'time';
  }
  if (/一起听|共享|人物|用户|people/i.test(name)) return 'people';
  return 'misc';
}

/** @param {string} name */
function slugify(name) {
  return name
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/** @param {string} svg */
function isLikelyMulticolor(svg) {
  const fills = [...svg.matchAll(/\bfill="([^"]+)"/gi)].map((m) => m[1].toLowerCase());
  const colors = fills.filter(
    (f) => f !== 'none' && f !== 'currentcolor' && f !== 'black' && f !== '#000' && f !== '#000000',
  );
  return colors.length > 0;
}

/** @param {string} svg */
function normalizeMonochromeSvg(svg) {
  return svg
    .replace(/\bfill="black"/gi, 'fill="currentColor"')
    .replace(/\bfill="#000(?:000)?"/gi, 'fill="currentColor"')
    .replace(/\bfill="rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)"/gi, 'fill="currentColor"');
}

function parseArgs(argv) {
  const out = { importFrom: null, category: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--import-from' && argv[i + 1]) {
      out.importFrom = argv[++i];
    } else if (argv[i] === '--category' && argv[i + 1]) {
      out.category = argv[++i];
    }
  }
  return out;
}

/** @param {string} dir */
function listSvgFiles(dir) {
  /** @type {string[]} */
  const results = [];
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...listSvgFiles(full));
    } else if (extname(entry).toLowerCase() === '.svg') {
      results.push(full);
    }
  }
  return results;
}

/** @param {string} fromDir @param {string | null} forcedCategory */
function importFlatLibrary(fromDir, forcedCategory = null) {
  if (!existsSync(fromDir)) {
    throw new Error(`Import source not found: ${fromDir}`);
  }

  mkdirSync(SVG_ROOT, { recursive: true });
  const files = listSvgFiles(fromDir);
  let imported = 0;
  let skippedNonSvg = 0;

  for (const entry of readdirSync(fromDir)) {
    const full = join(fromDir, entry);
    if (!statSync(full).isFile()) continue;
    const ext = extname(entry).toLowerCase();
    if (ext && ext !== '.svg') {
      skippedNonSvg++;
      console.warn(`skip (not svg): ${entry}`);
    }
  }

  for (const file of files) {
    const base = basename(file, '.svg');
    const category = forcedCategory || categorize(base);
    const slug = slugify(base);
    if (!slug) {
      console.warn(`skip (empty slug): ${file}`);
      continue;
    }

    const destDir = join(SVG_ROOT, category);
    mkdirSync(destDir, { recursive: true });
    const dest = join(destDir, `${slug}.svg`);
    copyFileSync(file, dest);
    imported++;
  }

  console.log(
    `Imported ${imported} SVG(s) from ${fromDir}` +
      (forcedCategory ? ` → category "${forcedCategory}"` : '') +
      (skippedNonSvg ? ` (skipped ${skippedNonSvg} non-svg)` : ''),
  );
}

function loadExistingManifest() {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function buildManifest() {
  const existing = loadExistingManifest();
  /** @type {Map<string, any>} */
  const prevById = new Map();
  if (existing?.icons) {
    for (const icon of existing.icons) {
      prevById.set(icon.id, icon);
    }
  }

  const files = listSvgFiles(SVG_ROOT);
  /** @type {Set<string>} */
  const categoryIds = new Set();
  /** @type {any[]} */
  const icons = [];

  // Clean public/icons and recreate
  rmSync(PUBLIC_ROOT, { recursive: true, force: true });
  mkdirSync(PUBLIC_ROOT, { recursive: true });

  for (const file of files) {
    const rel = relative(SVG_ROOT, file).replaceAll('\\', '/');
    const parts = rel.split('/');
    if (parts.length < 2) {
      console.warn(`skip (place under icons/svg/{category}/): ${rel}`);
      continue;
    }

    const category = parts[0];
    const fileName = parts[parts.length - 1];
    const slug = basename(fileName, '.svg');
    const id = `${category}.${slug}`;
    const prev = prevById.get(id);
    const raw = readFileSync(file, 'utf8');
    const multicolor = prev?.multicolor ?? isLikelyMulticolor(raw);
    const outSvg = multicolor ? raw : normalizeMonochromeSvg(raw);

    const publicRel = join(category, `${slug}.svg`);
    const publicPath = join(PUBLIC_ROOT, publicRel);
    mkdirSync(dirname(publicPath), { recursive: true });
    writeFileSync(publicPath, outSvg, 'utf8');

    categoryIds.add(category);

    icons.push({
      id,
      name: prev?.name ?? slug,
      category,
      tags: prev?.tags ?? [],
      path: `/icons/${category}/${slug}.svg`,
      ...(multicolor ? { multicolor: true } : {}),
    });
  }

  icons.sort((a, b) => a.id.localeCompare(b.id, 'zh-CN'));

  const categories = [...categoryIds]
    .sort()
    .map((id) => ({
      id,
      label:
        existing?.categories?.find((c) => c.id === id)?.label ??
        CATEGORY_LABELS[id] ??
        id,
    }));

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    categories,
    icons,
  };

  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  writeFileSync(
    join(PUBLIC_ROOT, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `Wrote ${icons.length} icon(s), ${categories.length} categor(ies) → icons/manifest.json`,
  );
  console.log(`Synced public/icons/`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.importFrom) {
    importFlatLibrary(args.importFrom, args.category);
  }
  buildManifest();
}

main();
