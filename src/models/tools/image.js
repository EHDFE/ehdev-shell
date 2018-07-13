const sharp = require('sharp');
const pngquant = require('./processors/pngquant');
const mozjpeg = require('./processors/mozjpeg');
const gifsicle = require('./processors/gifsicle');
const webp = require('./processors/webp');
const guetzli = require('./processors/guetzli');
const zopfli = require('./processors/zopfli');
const svgo = require('./processors/svgo');
const upng = require('./processors/upng');
const ffmpeg = require('./processors/ffmpeg');
const jpegCompare = require('./processors/jpeg-compare');
const { readFile } = require('./utils');

const PROCESSOR_LIST = new Map([
  ['pngquant', pngquant],
  ['mozjpeg', mozjpeg],
  ['gifsicle', gifsicle],
  ['webp', webp],
  ['guetzli', guetzli],
  ['zopfli', zopfli],
  ['svgo', svgo],
  ['upng', upng],
  ['ffmpeg', ffmpeg],
]);

exports.process = async (input, processorName, config, extraData) => {
  let result;
  const processor = PROCESSOR_LIST.get(processorName.toLowerCase());
  try {
    result = await processor(input, config, extraData);
  } catch (e) {
    throw e;
  }
  return result;
};

exports.getSSIMScore = async (base, compare) => {
  let result;
  try {
    result = await jpegCompare(base, compare, {
      method: 'ssim',
    });
  } catch (e) {
    throw e;
  }
  return result;
};

exports.getButteraugliScore = async () => {

};

exports.resize = async (inputPath, maxWidth = 1920, maxHeight = 1080) => {
  try {
    const inputBuffer = await readFile(inputPath);
    return sharp(inputBuffer)
      .limitInputPixels(false)
      .sequentialRead(true)
      .resize(maxWidth, maxHeight)
      .max()
      .toBuffer();
  } catch (e) {
    throw e;
  }
};
