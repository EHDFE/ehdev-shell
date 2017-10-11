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

- `Cannot download winCodeSign, attempt #1: Error: Request timed out` refer to [https://github.com/trazyn/weweChat/issues/26](https://github.com/trazyn/weweChat/issues/26)
