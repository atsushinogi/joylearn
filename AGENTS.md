# Repository Guidelines

## Project Structure & Module Organization

This repository is a collection of static browser learning apps. Root `index.html` links to apps in `kanji-test/`, `handwriting/`, `globe/`, `spring-lab/`, `quiz/`, `poketyping/`, and `stickman/`. Several apps keep editable, deployed HTML, CSS, and JavaScript directly in `dist/`; do not assume these directories are disposable build output. Quiz pages and images live under lesson directories such as `quiz/social-studies-2-lesson9/`. Kanji tests live in `kanji-test/tests/`; supporting scripts and documentation stay with their app.

## Build, Test, and Development Commands

Run commands from the repository root unless noted:

- `python3 -m http.server 8000`: serve the site locally; open `http://localhost:8000/`.
- `node kanji-test/scripts/build-questions.cjs`: validate question text and regenerate question data.
- `node --test kanji-test/tests/*.cjs`: run the kanji app’s Node.js tests.
- `npm --prefix spring-lab run check`: check JavaScript syntax and run physics verification.
- `python3 ftp-sync.py`: preview deployment files without connecting or uploading.

There is no repository-wide build or test command. Consult each app’s documentation before changing generated assets.

## Coding Style & Naming Conventions

Match the surrounding file’s indentation and formatting; avoid reformatting unrelated code. Use four-space indentation for Python. Preserve UTF-8 Japanese text, HTML document structure, relative links, and existing asset filenames. Use descriptive JavaScript names and follow nearby naming conventions. No shared formatter or linter configuration is established. Edit kanji question sources in `kanji-test/dist/questions/*.txt`, then regenerate `question-bank.js` and `questions/index.json` rather than editing those outputs manually.

## Testing Guidelines

Kanji tests use `node:test` and strict assertions, with filenames such as `core.test.cjs` and `app.test.cjs`. Add behavior-focused regression tests when changing parsing, grading, or navigation. No numeric coverage threshold is defined. Run relevant app checks and manually verify affected pages, root navigation, touch interactions, and asset loading in a browser.

## Commit & Pull Request Guidelines

Recent commits use concise, imperative English subjects, such as “Restore HTML document structure for Stickman Battle.” Keep commits focused. Pull requests should describe the affected app, resulting behavior, and validation performed; link relevant issues and include screenshots for visible changes.

## Deployment & Configuration

Read `FTP-SYNC.md` before deployment. Never commit `.env` credentials or print passwords. Uploads overwrite remote files; cleanup options delete files. The uploader cannot discover dynamically constructed asset paths, so verify those assets explicitly.
