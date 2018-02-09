const fs = require('fs');

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminSvgo = require('imagemin-svgo');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const imageminGifsicle = require('imagemin-gifsicle');

/**
 * ImageMin
 *
 */
const ImageMin = async ({ fileArr, config }) => {
  const { output, quality, webp } = config;
  let paths = [];
  fileArr.map(file => {
    paths.push(file.path);
  });

  let formatConfig = {};
  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      const value = config[key];
      const pArr = key.split('-');
      if (pArr.length === 2) {
        const fItem = pArr[0];
        const fKey = pArr[1];
        if (!formatConfig[fItem]) {
          formatConfig[fItem] = {};
        }
        formatConfig[fItem][fKey] = value;
      }
    }
  }

  if (formatConfig.svg) {
    let { svgo } = formatConfig.svg;
    var svgPugins = [];
    svgo.map(item => {
      svgPugins.push({
        [item]: true
      });
    });
  }
  let res1;
  try {
    res1 = await imagemin(paths, output, {
      use: [
        imageminPngquant(
          Object.assign({}, { quality: quality }, formatConfig.png)
        ),
        imageminMozjpeg(
          Object.assign({}, { quality: quality }, formatConfig.jpg)
        ),
        imageminSvgo({
          plugins: svgPugins
        }),
        imageminGifsicle(
          Object.assign({}, { optimizationLevel: 2 }, formatConfig.gif)
        )
      ]
    });
  } catch (error) {
    throw error;
  }

  let res2;
  if (webp) {
    let webpOutput = output + '/webp';

    try {
      const statDir = fs.existsSync(webpOutput);
      if (!statDir) {
        fs.mkdirSync(webpOutput);
      }

      res2 = await imagemin(paths, webpOutput, {
        use: [
          imageminWebp(
            Object.assign({}, { quality: quality }, formatConfig.webp)
          )
        ]
      });
    } catch (error) {
      throw error;
    }

    return [res1, res2];
  }

  return [res1];
};

module.exports = ImageMin;
