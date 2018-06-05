const imagemin = require('imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const gifsicle = require('imagemin-gifsicle');
const webp = require('imagemin-webp');
const gif2webp = require('imagemin-gif2webp');

const COMPRESSOR_LIST = {
  pngquant,
  mozjpeg,
  gifsicle,
  webp,
  gif2webp,
};

exports.process = (input, compressor, config) => {
  return imagemin(input, {
    plugins: [
      COMPRESSOR_LIST[compressor](config)
    ],
  });
};

exports.processBuffer = buffer => {
  const imageData = buffer.replace(/^data:image\/\w+;base64,/, '');
  return imagemin.buffer(Buffer.from(imageData, 'base64'));
};
