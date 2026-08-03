// build.js — bundles + minifies src/ → css/style.css and js/main.js
// Run: node build.js
// Watch: node build.js --watch

const esbuild = require('esbuild');
const path = require('path');

const watch = process.argv.includes('--watch');

// CSS entry — import order matters: base → layout → sections → components → animations
const cssEntry = 'src/css/entry.css';
const fs = require('fs');

// Write a CSS entry file that imports all modules in order
const cssImports = [
  'src/css/base.css',
  'src/css/layout.css',
  'src/css/sections.css',
  'src/css/components.css',
  'src/css/animations.css',
].map(f => `@import "./${path.relative('src/css', f).replace(/\\/g, '/')}";`).join('\n');

// Strip UTF-8 BOM if present (can appear when files are written by PowerShell)
const stripBOM = s => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
const readSrc  = f => stripBOM(fs.readFileSync(f, 'utf8'));

// esbuild doesn't support CSS @import natively in bundle mode for plain CSS,
// so we concatenate manually then minify
const cssSource = [
  'src/css/base.css',
  'src/css/layout.css',
  'src/css/sections.css',
  'src/css/components.css',
  'src/css/animations.css',
].map(f => readSrc(f)).join('\n');

const jsSource = [
  'src/js/writing.js',
  'src/js/boot.js',
  'src/js/nav.js',
  'src/js/uptime.js',
  'src/js/interactions.js',
  'src/js/skills.js',
  'src/js/validator.js',
  'src/js/timeline.js',
].map(f => readSrc(f)).join('\n');

// Write temp entry files
fs.writeFileSync('src/_bundle.css', cssSource);
fs.writeFileSync('src/_bundle.js', jsSource);

async function build() {
  await Promise.all([
    esbuild.build({
      entryPoints: ['src/_bundle.css'],
      bundle: false,
      minify: true,
      outfile: 'css/style.css',
      logLevel: 'info',
    }),
    esbuild.build({
      entryPoints: ['src/_bundle.js'],
      bundle: false,
      minify: true,
      outfile: 'js/main.js',
      logLevel: 'info',
    }),
  ]);
  console.log('Build complete.');
}

if (watch) {
  // Simple watch — re-run on any src change
  console.log('Watching src/ for changes...');
  build();
  fs.watch('src', { recursive: true }, (event, filename) => {
    if (filename && !filename.startsWith('_')) {
      console.log(`Changed: ${filename}`);
      // Regenerate bundles
      const newCss = [
        'src/css/base.css', 'src/css/layout.css',
        'src/css/sections.css', 'src/css/components.css', 'src/css/animations.css',
      ].map(f => readSrc(f)).join('\n');
      const newJs = [
        'src/js/writing.js', 'src/js/boot.js', 'src/js/nav.js',
        'src/js/uptime.js', 'src/js/interactions.js', 'src/js/skills.js',
        'src/js/validator.js', 'src/js/timeline.js',
      ].map(f => readSrc(f)).join('\n');
      fs.writeFileSync('src/_bundle.css', newCss);
      fs.writeFileSync('src/_bundle.js', newJs);
      build();
    }
  });
} else {
  build();
}
