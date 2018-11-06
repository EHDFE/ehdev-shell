![Jarvis](http://image.tf56.com/dfs/group1/M00/3F/22/CiFBCVoXseOAJz1_AAAjpvFXiYk329.png)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FEHDFE%2Fehdev-shell.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FEHDFE%2Fehdev-shell?ref=badge_shield)

---
[![Build Status](https://travis-ci.org/EHDFE/ehdev-shell.svg)](https://travis-ci.org/EHDFE/ehdev-shell)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/dcd2d67edf7946dba8afa86693d2b511)](https://www.codacy.com/app/macisi/ehdev-shell?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=EHDFE/ehdev-shell&amp;utm_campaign=Badge_Grade)
[![GitHub tag](https://img.shields.io/github/tag/ehdfe/ehdev-shell.svg)]()
[![Github All Releases](https://img.shields.io/github/downloads/ehdfe/ehdev-shell/total.svg)]()
[![David](https://img.shields.io/david/EHDFE/ehdev-shell.svg)]()
[![David](https://img.shields.io/david/dev/EHDFE/ehdev-shell.svg)]()
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FEHDFE%2Fehdev-shell.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FEHDFE%2Fehdev-shell?ref=badge_shield)

## Introduction
Javis aims to provide an easy to use gui tool for developers.

![image](https://user-images.githubusercontent.com/1787187/42255258-6950a76c-7f7d-11e8-987c-527e52a7ab67.png)
![image](https://user-images.githubusercontent.com/1787187/48038283-f4a5da00-e1aa-11e8-9866-c290cb9c3317.png)
![image](https://user-images.githubusercontent.com/1787187/48038326-1737f300-e1ab-11e8-84f2-62294d22a482.png)

## Dev Environment Setup

1. Install dependence: `ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ npm i`.
2. Precompile the dll bundle: `npm run build-dll`.
3. Start the app: `npm run debug` or use vscode's debugger
  ![](https://image.tf56.com/dfs/group1/M00/39/4E/CiFBClnkCzqABJhqAAGYIokpzjs880.png)

## Test the production package locally

2. npm start.

## Publish

1. npm version patch
2. git push origin v0.x.x master

## Possible Issues

- `Cannot download winCodeSign, attempt #1: Error: Request timed out` refer to [https://github.com/electron-userland/electron-builder/issues/1859#issuecomment-320922905](https://github.com/electron-userland/electron-builder/issues/1859#issuecomment-320922905)


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FEHDFE%2Fehdev-shell.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FEHDFE%2Fehdev-shell?ref=badge_large)
