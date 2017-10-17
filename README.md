# <img src="http://image.tf56.com/dfs/group1/M00/39/50/CiFBCVnkI_iAYRYdAAWllnuhu4k085.ico" alt="" height="60" /> EHD SHELL

---
[![Build Status](https://travis-ci.org/EHDFE/ehdev-shell.svg)](https://travis-ci.org/EHDFE/ehdev-shell)

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
