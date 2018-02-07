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
  
  let res1;
  try {
    res1 = await imagemin(paths, output, {
      use: [
        imageminPngquant({
          quality: quality,
          speed: 4,
          verbose: true
        }),
        imageminMozjpeg({
          quality: quality
        }),
  
        imageminSvgo({
          removeTitle: true,
          removeDesc: true,
          removeXMLNS: true
        }),
        imageminGifsicle({
          optimizationLevel: 2
        }),
      ]
    });
  } catch (error) {
    throw error;
  }

  let res2;
  if(webp) {
    let webpOutput = output + '/webp';

    try {
      const statDir = fs.existsSync(webpOutput);
      if (!statDir) {
        fs.mkdirSync(webpOutput);
      }

      res2 = await imagemin(paths, webpOutput, {
        use: [
          imageminWebp({
            quality: quality,
            lossless: true
          })
        ]
      });
    } catch (error) {
      throw error;
    }
    
  }

  return [res1, res2];

};

module.exports = ImageMin;







