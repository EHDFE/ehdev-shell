# EHD SHELL
---

## INIT

```sh
ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ npm i electron -d --save-exact
npm init
```

## BUILD

```sh
ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ npm run dist
```

## POSSIBLE ISSUES

- `Cannot download winCodeSign, attempt #1: Error: Request timed out` refer to [https://github.com/electron-userland/electron-builder/issues/1859#issuecomment-320922905](https://github.com/electron-userland/electron-builder/issues/1859#issuecomment-320922905)
