#!/usr/bin/env node
/**
 * 将 Figma Variables 导出的 OS4 Token（Reference / Semantic / Component × Light / Dark）
 * 规范化为仓库内分层文件，供 TokenTable 读取。
 *
 * 用法：
 *   node scripts/import-os4-tokens.mjs /path/to/OS4Token
 *
 * 期望目录结构：
 *   OS4Token/
 *     Reference Token/{Light,Dark}.tokens.json
 *     Semantic Token/{Light,Dark}.tokens.json
 *     Component Token/{Light,Dark}.tokens.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'tokens');

const LAYERS = {
  reference: 'Reference Token',
  semantic: 'Semantic Token',
  component: 'Component Token',
};

function formatColor(value) {
  const comps = value.components ?? [0, 0, 0];
  const [r, g, b] = comps
    .slice(0, 3)
    .map((c) => Math.max(0, Math.min(255, Math.round(Number(c) * 255))));
  const alpha = Number(value.alpha ?? 1);
  if (alpha < 0.999) {
    let a = Math.round(alpha * 10000) / 10000;
    if (a === Math.trunc(a)) a = Math.trunc(a);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (typeof value.hex === 'string' && value.hex.startsWith('#')) {
    return value.hex.length === 7 ? value.hex.toUpperCase() : value.hex;
  }
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

function formatValue(value) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('components' in value || 'hex' in value || 'colorSpace' in value)
  ) {
    return formatColor(value);
  }
  return value;
}

function aliasDescription(ext) {
  const alias = ext?.['com.figma.aliasData'];
  if (!alias || typeof alias !== 'object') return undefined;
  const name = alias.targetVariableName;
  const setName = alias.targetVariableSetName;
  if (name && setName) return `→ ${setName}: ${name}`;
  if (name) return `→ ${name}`;
  return undefined;
}

function convertNode(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return node;
  if ('$value' in node) {
    const out = {};
    if (node.$type) out.$type = node.$type;
    out.$value = formatValue(node.$value);
    const desc = node.$description || aliasDescription(node.$extensions);
    if (desc) out.$description = desc;
    return out;
  }
  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === '$extensions') continue;
    if (key.startsWith('$') && !['$name', '$description', '$type', '$value'].includes(key)) {
      continue;
    }
    result[key] = convertNode(value);
  }
  return result;
}

function countTokens(node) {
  if (!node || typeof node !== 'object') return 0;
  if ('$value' in node) return 1;
  let n = 0;
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith('$')) n += countTokens(value);
  }
  return n;
}

const srcRoot = process.argv[2];
if (!srcRoot) {
  console.error('Usage: node scripts/import-os4-tokens.mjs /path/to/OS4Token');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (const [layerKey, folder] of Object.entries(LAYERS)) {
  for (const mode of ['Light', 'Dark']) {
    const src = path.join(srcRoot, folder, `${mode}.tokens.json`);
    if (!fs.existsSync(src)) {
      console.error(`Missing: ${src}`);
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(src, 'utf8'));
    const converted = {
      $name: `HyperOS OS4 ${layerKey[0].toUpperCase()}${layerKey.slice(1)} Token (${mode})`,
      $extensions: {
        'hyperos.layer': layerKey,
        'hyperos.mode': mode.toLowerCase(),
        'hyperos.source': `Figma Variables / ${folder}`,
      },
      ...convertNode(data),
    };
    const outPath = path.join(outDir, `${layerKey}.${mode.toLowerCase()}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(converted, null, 2)}\n`);
    console.log(
      `wrote ${path.relative(root, outPath)}: ${countTokens(converted)} tokens`,
    );
  }
}

const legacy = path.join(outDir, 'tokens.json');
if (fs.existsSync(legacy)) {
  fs.unlinkSync(legacy);
  console.log('removed tokens/tokens.json');
}
