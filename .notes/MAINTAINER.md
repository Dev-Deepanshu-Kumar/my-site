# Site Maintainer Notes

> Personal reference — not for public consumption.
> URL: deepanshu-kumar.dev/.notes/MAINTAINER.md (noindex)

---

## Stack

Vanilla HTML + CSS + JS. No framework, no build step, no npm.
Edit files directly. Refresh browser. Done.

**Never use PowerShell `Set-Content` or `Out-File` to write these files.**
PS 5.1 adds a UTF-8 BOM that breaks special characters (—, ·, ◆ etc).
Use VS Code, Notepad++, or any editor that saves UTF-8 without BOM.
Git edits via Bash are also safe.

---

## File Map

```
index.html          — main portfolio (v2). All content lives here.
css/style.css       — all styles. Section comments mark each feature.
js/main.js          — all interactivity. Functions listed below.
api/portfolio.json  — machine-readable career data. Edit like config.
data/recognitions.json — award data (used by v1, not v2 directly).
images/awards/      — award + recommendation screenshots.
images/profile.png  — hero photo.
llms.txt            — AI-readable profile. Update when content changes.
sitemap.xml         — update lastmod when making significant changes.
404.html            — custom 404 page. Self-contained.
v1/                 — old site. Preserved. Don't touch unless needed.
assets/             — printable resume HTML (v1 version).
```

---

## Common Edits

### Update a job description / quote / text
Search in `index.html` for the text. Change it.
Section comments (`<!-- ── GET /experience -->`) mark each block.

### Add a new recommendation
In `index.html`, find `<div class="rec-list">`.
Copy an existing `.rec-item` block. Swap content.
Add screenshot to `images/awards/rec-NAME.png`.
Add `<img>` inside `.rec-proof-collapse-inner`.
Update response count: `application/json · 5 items` → 6.

### Add a new award / recognition
1. Add screenshot to `images/awards/`.
2. Add entry to `data/recognitions.json`.
3. In `index.html`, find `<div class="recog-screenshots-scroll">`.
   Copy a `.recog-screenshot-item` block, update src + alt + caption.

### Add a new skill tag
In `index.html`, find the right `skill-domain` block.
Add: `<span class="skill-tag" data-ms="X">Skill Name</span>`
Pick `data-ms` value: lower = more proficient (see legend on page).
In `js/main.js`, find `const SKILL_DATA = {` and add an entry:
```js
"Skill Name": { synopsis: "...", usage: "...", where: "...", see: "..." },
```
If you skip the SKILL_DATA entry, clicking the tag shows "No manual entry" — harmless.

### Add a new section
Requires 4 changes:
1. `index.html` — add `<section id="X">` block following existing pattern.
2. `index.html` — add sidebar nav link in the Endpoints group.
3. `js/main.js` — bump `totalEndpoints` (search for it, one line).
4. `js/main.js` — add entry to `CMD_ITEMS` array in command palette section.

### Update the hero photo
Replace `images/profile.png`. Same filename, no code change needed.

### Update resume PDF
Replace `Deepanshu_Kumar_Resume.pdf` at root. Same filename.

### Add a Dev.to article
Just publish on Dev.to. Widget auto-fetches latest 3. Nothing to change.

### Disable writing widget (Dev.to API down / changed)
In `js/main.js`, line near top:
```js
const WRITING_WIDGET_ENABLED = true;  // ← change to false
```
Hides both desktop sidebar widget and mobile block instantly.

### Update api/portfolio.json
Plain JSON. Edit like a config file. Matches content in index.html.
Keep in sync when changing jobs, adding skills, etc.

### Update llms.txt
Plain markdown. Update when: new job, new recommendation, new recognition.
AI tools that read this use it to recommend you — worth keeping current.

---

## JS Functions Quick Reference

| Function | What it does |
|---|---|
| `toggleJson(header)` | Expand/collapse experience role blocks |
| `toggleNestedJson(field)` | Expand/collapse recognition nested list |
| `toggleProof(btn)` | Open/close award proof screenshot strip |
| `toggleRecProof(btn)` | Open/close individual rec screenshot |
| `openExperienceRecognition(e)` | From soft skills — jumps to + opens recognition |
| `switchSkillTab(tab, btn)` | Switch between /skills/technical and /skills/soft |
| `runValidator()` | Runs the PAN name matcher demo |
| `openPalette()` | Opens command palette (/ or Ctrl+K) |
| `toggleRecProof(btn)` | Opens LinkedIn screenshot per rec card |

---

## Gotchas

- **BOM** — PowerShell `Set-Content`/`Out-File` adds BOM → corrupts special chars.
  Fix if it happens: restore file from git (`git show <hash>:file > file`), re-apply changes via editor.

- **Skill terminal breaks** — if you add a skill tag but the click shows "No manual entry",
  add the entry to `SKILL_DATA` in `js/main.js`.

- **Rate limit counter** — `totalEndpoints` in `js/main.js` controls the "X/6 endpoints explored"
  progress bar. Bump it when adding a new section.

- **Command palette** — new sections need an entry in `CMD_ITEMS` array in `js/main.js` or
  they won't appear in search.

- **Local testing** — open `index.html` directly in browser (`file://`).
  Writing widget and x-response-time won't work on file:// (CORS + no navigation timing).
  Test those on the deployed site.

- **Encoding** — always UTF-8 without BOM. VS Code bottom bar shows encoding.
  If it says UTF-8 with BOM, use "Save with Encoding" → UTF-8.

---

## Deploy

```bash
git add -A
git commit -m "your message"
git push origin main
```

GitHub Pages auto-deploys in ~60 seconds.
Check: https://deepanshu-kumar.dev
