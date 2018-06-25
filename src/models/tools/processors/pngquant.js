const fs = require('fs');
const pngquant = require('pngquant-bin');
const { execProcessor } = require('../utils');

const fsPromises = fs.promises;
const { readFile } = fsPromises;

module.exports = async (input, opts) => {
  let inputBuffer;
  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else {
    inputBuffer = await readFile(input);
  }

  const args = ['-'];

  if (opts.floyd && typeof opts.floyd === 'number') {
    args.push(`--floyd=${opts.floyd}`);
  }
  if (opts.nofs) {
    args.push('--nofs');
  }
  if (opts.posterize) {
    args.push('--posterize', opts.posterize);
  }
  if (opts.quality) {
    args.push('--quality', opts.quality);
  }
  if (opts.speed) {
    args.push('--speed', opts.speed);
  }

  return execProcessor(pngquant, args, inputBuffer);
};
