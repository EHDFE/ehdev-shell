const sharp = require('sharp');

/**
 * ImageMin
 *
 */
const ImageMin = (
  file,
  quality = 100,
  cwebp = false,
  mimetype,
  next
) => {
  const image = sharp(file);

  if (cwebp) {
    sharp(file)
      .webp({
        quality: quality
      })
      .toFile('./output.webp', (err, info) => {
        if (err) {
          throw Error(err);
        }
      });
  } else {
    switch (mimetype) {
    case 'image/jpeg':
      return sharp(file)
        .jpeg({
          quality: quality
        })
        .toBuffer()
        .then(data => {
          return data;
        });
      break;
    case 'image/png':
      sharp(file)
        .png({
          quality: quality
        })
        .toFile('./output.png', (err, info) => {
          if (err) {
            throw Error(err);
          }
        });
      break;
    default: {
      let type = mimetype.split('/')[1];
      sharp(file).toFile('./output.' + type, (err, info) => {
        if (err) {
          throw Error(err);
        }
      });
    }
    }
  }
  
};


module.exports = ImageMin;