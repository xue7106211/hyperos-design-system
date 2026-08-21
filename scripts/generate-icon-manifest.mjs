#!/usr/bin/env node
/**
 * Parse icons/font/*.ttf → icons/manifest.json + public/fonts + public/icons/manifest.json
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
const openSync = fontkit.openSync ?? fontkit.default?.openSync ?? fontkit;
const ttf2woff2Mod = require('ttf2woff2');
const ttf2woff2 =
  typeof ttf2woff2Mod === 'function' ? ttf2woff2Mod : ttf2woff2Mod.default;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FONT_DIR = join(ROOT, 'icons', 'font');
const MANIFEST_PATH = join(ROOT, 'icons', 'manifest.json');
const PUBLIC_MANIFEST = join(ROOT, 'public', 'icons', 'manifest.json');
const PUBLIC_FONTS = join(ROOT, 'public', 'fonts');

const SKIP_CODEPOINTS = new Set([0x20, 0xa0]);

const FONT_FILES = {
  'HyperOSSymbolsVF.ttf': { id: 'symbols', label: 'Symbols' },
  'HyperOSSymbols-Content-RegularVF.ttf': { id: 'content-regular', label: 'Content Regular' },
  'HyperOSSymbols-Content-SecondaryVF.ttf': {
    id: 'content-secondary',
    label: 'Content Secondary',
  },
  'HyperOSSymbols-SmallVF.ttf': { id: 'small', label: 'Small' },
  'HyperOSSymbols-Small-DualtoneVF.ttf': {
    id: 'small-dualtone',
    label: 'Small Dualtone',
  },
};

function fail(message) {
  console.error(message);
  process.exit(1);
}

function glyphNameOf(glyph) {
  const name = glyph?.name;
  if (name && name !== '.notdef') return name;
  return `gid-${glyph.id}`;
}

function roundBox(cbox) {
  if (!cbox || !Number.isFinite(cbox.minX) || !Number.isFinite(cbox.minY)) {
    return [0, 0, 0, 0];
  }
  return [Math.round(cbox.minX), Math.round(cbox.minY), Math.round(cbox.maxX), Math.round(cbox.maxY)];
}

function writeWebFont(ttfPath, stem) {
  mkdirSync(PUBLIC_FONTS, { recursive: true });
  const ttf = readFileSync(ttfPath);
  const woff2Path = join(PUBLIC_FONTS, `${stem}.woff2`);
  try {
    writeFileSync(woff2Path, ttf2woff2(ttf));
    return `/fonts/${stem}.woff2`;
  } catch (err) {
    console.warn(`woff2 failed for ${stem}, falling back to ttf:`, err.message);
    const ttfOut = join(PUBLIC_FONTS, `${stem}.ttf`);
    copyFileSync(ttfPath, ttfOut);
    return `/fonts/${stem}.ttf`;
  }
}

function nameRecord(font, key) {
  const entry = font.name?.records?.[key];
  if (!entry) return '';
  const raw = typeof entry === 'string' ? entry : entry.en ?? Object.values(entry).find((v) => typeof v === 'string');
  return typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : '';
}

function parseFontFile(fileName) {
  const meta = FONT_FILES[fileName];
  const ttfPath = join(FONT_DIR, fileName);
  const font = openSync(ttfPath);
  const wght = font.variationAxes?.wght;
  if (!wght) {
    fail(`${fileName}: missing wght axis (not a variable font?)`);
  }

  const stem = basename(fileName, '.ttf');
  const path = writeWebFont(ttfPath, stem);
  const family = String(font.familyName).trim() || stem;
  const postscriptName =
    nameRecord(font, 'postscriptName') || String(font.postscriptName ?? '').trim() || stem;
  const copyright = nameRecord(font, 'copyright') || String(font.copyright ?? '').trim();
  const trademark = nameRecord(font, 'trademark');
  const fontVersion = nameRecord(font, 'version') || String(font.version ?? '').trim();

  const icons = [];
  for (const cp of font.characterSet) {
    if (SKIP_CODEPOINTS.has(cp)) continue;
    const gid = font._cmapProcessor.lookup(cp);
    if (!gid) continue;
    // COLR 字体上 glyphForCodePoint 会缓存彩色包装，cbox 为空且读 bbox 会栈溢出。
    // 先 cmap → _getBaseGlyph，直接读 glyf 轮廓。
    const base = font._getBaseGlyph(gid);
    if (!base || base.name === '.notdef') continue;
    let bbox = [0, 0, 0, 0];
    try {
      bbox = roundBox(base.cbox);
    } catch {
      // ignore unreadable outlines
    }
    icons.push({
      id: `${meta.id}.${glyphNameOf(base)}`,
      fontId: meta.id,
      name: glyphNameOf(base),
      unicode: cp.toString(16).toUpperCase(),
      glyphIndex: gid,
      advanceWidth: Math.round(base.advanceWidth ?? 0),
      bbox,
    });
  }

  icons.sort((a, b) => a.unicode.localeCompare(b.unicode, 'en'));

  return {
    font: {
      id: meta.id,
      label: meta.label,
      family,
      path,
      postscriptName,
      copyright,
      trademark,
      fontVersion,
      weight: {
        min: wght.min,
        max: wght.max,
        default: wght.default,
      },
      metrics: {
        unitsPerEm: font.unitsPerEm,
        ascender: Math.round(font.ascent),
        descender: Math.round(font.descent),
        capHeight: Math.round(font.capHeight || 0),
        xHeight: Math.round(font.xHeight || 0),
      },
    },
    icons,
  };
}

function main() {
  if (!existsSync(FONT_DIR)) fail(`Missing ${FONT_DIR}`);

  const listed = readdirSync(FONT_DIR).filter((f) => extname(f).toLowerCase() === '.ttf');
  for (const extra of listed) {
    if (!FONT_FILES[extra]) {
      console.warn(`skip unrecognized ttf: ${extra}`);
    }
  }

  const required = Object.keys(FONT_FILES);
  for (const name of required) {
    if (!existsSync(join(FONT_DIR, name))) fail(`Missing ${name} in icons/font/`);
  }

  if (existsSync(PUBLIC_FONTS)) rmSync(PUBLIC_FONTS, { recursive: true, force: true });
  mkdirSync(join(ROOT, 'public', 'icons'), { recursive: true });

  const fonts = [];
  const icons = [];
  for (const name of required) {
    const parsed = parseFontFile(name);
    fonts.push(parsed.font);
    icons.push(...parsed.icons);
  }

  const seenFamilies = new Set();
  for (const font of fonts) {
    if (seenFamilies.has(font.family)) {
      fail(`Duplicate font family name after trim: ${JSON.stringify(font.family)}`);
    }
    seenFamilies.add(font.family);
  }

  const manifest = {
    version: 2,
    generatedAt: new Date().toISOString(),
    fonts,
    icons,
  };
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(MANIFEST_PATH, json, 'utf8');
  writeFileSync(PUBLIC_MANIFEST, json, 'utf8');
  console.log(`Wrote ${icons.length} icon(s), ${fonts.length} font(s) → icons/manifest.json`);
}

main();
