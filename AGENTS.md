# Repository Guidelines

When working, do not use powershell and do not work through meaningless py.

## Project Structure & Module Organization
- Root entry: `index.html` drives the static site.
- Client scripts in `js/`; keep modules small and focused.
- Styles in `style/`; images in `img/`; shared libs in `library/`.
- Content/data lives in `data/`, menu configuration in `menu/`.
- Site settings in `config.js`. Avoid committing secrets or machine‑specific paths.
- Blog/content assets in `blog/` and `readme_img/` as applicable.

## Build, Test, and Development Commands
- Local preview (no build step):
  - Open `index.html` directly in a browser, or serve the folder:
  - Python: `python -m http.server 8000` (then visit `http://localhost:8000`).
  - Node (optional): `npx serve .` for a simple static server.
- Lint (optional if you use one locally): run your preferred JS/CSS linters before pushing.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; UTF‑8 files; Unix line endings preferred.
- JavaScript: ES2015+; camelCase for variables/functions; PascalCase for classes.
- Filenames: kebab-case for JS/CSS (e.g., `note-editor.js`, `site-theme.css`).
- CSS: prefer component‑scoped classes; keep selectors simple; avoid `!important`.
- Keep DOM access centralized in helpers; avoid inline event handlers in HTML.

## Testing Guidelines
- No formal test harness: perform manual browser testing.
- Validate core flows in Chrome and Firefox; check console for errors.
- Verify responsive layout (≈360–1440px), keyboard navigation, and basic a11y.
- If adding JS, test with a fresh cache or a static server to avoid stale assets.

## Commit & Pull Request Guidelines
- Commits: imperative, present tense (e.g., "Add note list filter"); scope small.
- Include a concise body explaining the rationale when non‑trivial.
- PRs: describe changes, link related issues, and add before/after screenshots for UI.
- Keep diffs focused; update `README.md` when behavior or usage changes.

## Security & Configuration Tips
- Do not embed secrets or tokens in `config.js` or the repo.
- Use relative paths for assets; keep external dependencies minimal to reduce breakage.
- Sanitize any dynamic content before inserting into the DOM.

## Agent‑Specific Instructions
- Follow existing structure; avoid introducing build tooling without prior discussion.
- Touch only necessary files; keep changes minimal and consistent with surrounding code.
- When adding modules, place them under `js/` and reference them from `index.html`.
