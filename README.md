# WTF-CPF

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache-blue.svg)](https://opensource.org/licenses/apache-2-0)
[![CI](https://github.com/storopoli/WTF-CPF/actions/workflows/deploy-pages.yml/badge.svg?event=push)](https://github.com/storopoli/WTF-CPF/actions)

Whisky-Tango-Foxtrot CPF: **WTF-CPF**.

This repository contains a static web front-end port of
[`plebemineira/cpf_quilingue`](https://github.com/plebemineira/cpf_quilingue),
rewritten from Rust CLI tool to TypeScript + Preact web app.

CPF is the Brazilian tax ID for physical persons (Cadastro de Pessoas Fisicas).

## What this app does

- Runs fully in the browser (no backend required).
- Accepts a valid CPF as input.
- Allows selecting an issuing state (UF) filter based on CPF fiscal-region
  digit mapping.
- Searches for valid CPF variations by changing:
  1. one digit;
  2. two digits;
  3. three digits.
- Stops at the first level that yields valid candidates.
- Shows each result formatted as `XXX.XXX.XXX-XX` plus the number of changed
  digits.

The purpose is technical experimentation only, including studying how systems
behave when CPF input is required and how broad validation or vigilance
mechanisms react.

This project does **not** incentivize fraud, impersonation, or unlawful use of
personal identifiers.

## Stack

- TypeScript
- Preact
- Vite

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build static files

```bash
npm run build
```

The generated static site is in `dist/`.

To test the production build locally:

```bash
npm run preview
```

## GitHub Pages deployment

This project is configured for static deployment on GitHub Pages.

- For local/manual builds, set the base path explicitly if needed:
  - `VITE_BASE_PATH="/<repo-name>/" npm run build`
- In GitHub Actions, the base path can be inferred from
  `GITHUB_REPOSITORY` automatically.

You can publish either:
- manually from `dist/`, or
- with a workflow that builds and deploys `dist/` to GitHub Pages.

## License

This work is dual-licensed under MIT and Apache 2.0.
You can choose either one if you use this work.