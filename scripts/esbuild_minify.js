#!/usr/bin/env node
/**
 * Ledgio - esbuild Asset Minifier
 * Fast, syntax-preserving per-file minifier for JS and CSS assets.
 * Does not bundle, does not rename globals or window properties.
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const CSS_MAP = [
  ['styles.css', 'styles-c1-v1.min.css'],
  ['dashboard.css', 'dashboard-c2-v1.min.css'],
  ['landing-b3-v2.css', 'landing-b3-v2.min.css'],
  ['landing-b4-v1.css', 'landing-b4-v1.min.css'],
  ['landing-b5-v1.css', 'landing-b5-v1.min.css'],
  ['landing-b7-v1.css', 'landing-b7-v1.min.css'],
  ['landing-b8-v1.css', 'landing-b8-v1.min.css'],
  ['landing-b9-v1.css', 'landing-b9-v1.min.css'],
  ['landing-alive-b7-v1.css', 'landing-alive-b7-v1.min.css'],
  ['tokens.css', 'tokens.min.css']
];

const JS_MAP = [
  ['app.js', 'app-c2-v1.min.js'],
  ['auth.js', 'auth-c1-v1.min.js'],
  ['categories.js', 'categories.min.js'],
  ['expenses-p3a-v1.js', 'expenses-p3a-v1.min.js'],
  ['goals.js', 'goals.min.js'],
  ['hero-ascii-b3-v2.js', 'hero-ascii-b3-v2.min.js'],
  ['hero-ascii-b7-v1.js', 'hero-ascii-b7-v1.min.js'],
  ['closing-ascii-b3-v2.js', 'closing-ascii-b3-v2.min.js'],
  ['closing-ascii-b7-v1.js', 'closing-ascii-b7-v1.min.js'],
  ['hero-ascii-v1.js', 'hero-ascii-v1.min.js'],
  ['income.js', 'income.min.js'],
  ['landing.js', 'landing-b3-v1.min.js'],
  ['landing-b3-v2.js', 'landing-b3-v2.min.js'],
  ['landing-mobile-b3-v1.js', 'landing-mobile-b3-v1.min.js'],
  ['landing-alive-b7-v1.js', 'landing-alive-b7-v1.min.js'],
  ['landing-demo-b8-v1.js', 'landing-demo-b8-v1.min.js'],
  ['loans.js', 'loans.min.js'],
  ['pwa-installer.js', 'pwa-installer.min.js'],
  ['supabase-config-p3a-v1.js', 'supabase-config-p3a-v1.min.js'],
  ['sync-engine.js', 'sync-engine.min.js'],
  ['vault.js', 'vault.min.js']
];

function minifyFile(type, srcPath, dstPath) {
  if (!fs.existsSync(srcPath)) return false;
  const code = fs.readFileSync(srcPath, 'utf8');
  let result;
  if (type === 'css') {
    let stamp = '';
    const hallmarkMatch = code.match(/^\s*(\/\*[\s\S]*?hallmark[\s\S]*?\*\/)/);
    if (hallmarkMatch) {
      stamp = hallmarkMatch[1] + '\n';
    }
    const res = esbuild.transformSync(code, { loader: 'css', minify: true });
    result = stamp + res.code.trim();
  } else {
    const res = esbuild.transformSync(code, { minify: true, target: 'es2020' });
    result = res.code;
  }
  fs.writeFileSync(dstPath, result, 'utf8');
  return true;
}

const args = process.argv.slice(2);

if (args[0] === '--all') {
  const baseDir = args[1] || path.resolve(__dirname, '..');
  const cssDir = path.join(baseDir, 'assets', 'css');
  const jsDir = path.join(baseDir, 'assets', 'js');

  let cssCount = 0;
  for (const [src, dst] of CSS_MAP) {
    const srcPath = path.join(cssDir, src);
    const dstPath = path.join(cssDir, dst);
    if (minifyFile('css', srcPath, dstPath)) {
      cssCount++;
    }
  }

  let jsCount = 0;
  for (const [src, dst] of JS_MAP) {
    const srcPath = path.join(jsDir, src);
    const dstPath = path.join(jsDir, dst);
    if (minifyFile('js', srcPath, dstPath)) {
      jsCount++;
    }
  }

  console.log(`[esbuild] Minified ${cssCount} CSS files and ${jsCount} JS files.`);
} else if (args.length >= 3) {
  const [type, src, dst] = args;
  minifyFile(type, src, dst);
} else {
  console.error('Usage: node scripts/esbuild_minify.js --all [baseDir] OR node scripts/esbuild_minify.js <js|css> <src> <dst>');
  process.exit(1);
}
