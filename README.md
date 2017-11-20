# <img src="http://image.tf56.com/dfs/group1/M00/3E/76/CiFBCloSOVqAKLpeAAA2grm54IA264.png" alt="" style="vertical-align:middle" height="60" /> EHD SHELL

---
[![Build Status](https://travis-ci.org/EHDFE/ehdev-shell.svg)](https://travis-ci.org/EHDFE/ehdev-shell)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/dcd2d67edf7946dba8afa86693d2b511)](https://www.codacy.com/app/macisi/ehdev-shell?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=EHDFE/ehdev-shell&amp;utm_campaign=Badge_Grade)
[![GitHub tag](https://img.shields.io/github/tag/ehdfe/ehdev-shell.svg)]()
[![David](https://img.shields.io/david/EHDFE/ehdev-shell.svg)]()
[![David](https://img.shields.io/david/dev/EHDFE/ehdev-shell.svg)]()

## Introduction
Javis aims to provide an easy to use gui tool for developers.

TL;DR

- Provide the project scarffold with pre-defined structure.
- Support dev server & bundle project.
- Dependency management.
- Images upload.

## Dev Environment Setup

1. Install dependence: `ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ npm i`.
2. Precompile the dll bundle: `npm run dll-dev`.
3. Start the app: `npm run debug` or use vscode's debugger
  ![](https://image.tf56.com/dfs/group1/M00/39/4E/CiFBClnkCzqABJhqAAGYIokpzjs880.png)

## Test the production package locally

1. Precompile the dll build for production: `npm run dll-prod`.
2. Compile the app bundle: `npm run build-prod`.
2. `npm run pack`.

## Publish

1. npm version patch
2. git push origin v0.x.x master

## Possible Issues

- `Cannot download winCodeSign, attempt #1: Error: Request timed out` refer to [https://github.com/electron-userland/electron-builder/issues/1859#issuecomment-320922905](https://github.com/electron-userland/electron-builder/issues/1859#issuecomment-320922905)
