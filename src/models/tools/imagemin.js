const pngquant = require('./processors/pngquant');
const mozjpeg = require('./processors/mozjpeg');
const gifsicle = require('./processors/gifsicle');
const webp = require('./processors/webp');
const guetzli = require('./processors/guetzli');
const zopfli = require('./processors/zopfli');
const svgo = require('./processors/svgo');
const upng = require('./processors/upng');

const PROCESSOR_LIST = new Map([
  ['pngquant', pngquant],
  ['mozjpeg', mozjpeg],
  ['gifsicle', gifsicle],
  ['webp', webp],
  ['guetzli', guetzli],
  ['zopfli', zopfli],
  ['svgo', svgo],
  ['upng', upng],
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
