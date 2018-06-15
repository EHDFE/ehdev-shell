const { promisify } = require('util');
const fs = require('fs');
const gifsicle = require('gifsicle');
const { execProcessor } = require('../utils');
const readFile = promisify(fs.readFile);

module.exports = async (input, opts) => {
  let inputBuffer;
  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else {
    inputBuffer = await readFile(input);
  }

  const args = ['--no-warnings', '--no-app-extensions'];

  if (opts.interlaced) {
    args.push('--interlace');
  }
  if (opts.optimizationLevel) {
    args.push(`--optimize=${opts.optimizationLevel}`);
  }
  if (opts.colors) {
    args.push(`--colors=${opts.colors}`);
  }

  return execProcessor(gifsicle, args, inputBuffer);
};
