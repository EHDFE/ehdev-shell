const fs = require('fs');
const { execProcessor, getBinaryPath } = require('../utils');

const { promisify } = require('util');
const readFile = promisify(fs.readFile);

const gifsicle = getBinaryPath('gifsicle');

module.exports = async (input, opts) => {
  let inputBuffer;
  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else {
    inputBuffer = await readFile(input);
  }

  const args = ['--no-warnings'];

  if (opts.interlaced) {
    args.push('--interlace');
  }
  if (opts.optimizationLevel) {
    args.push(`--optimize=${opts.optimizationLevel}`);
  }
  if (opts.colors) {
    args.push(`--colors=${opts.colors}`);
  }
  if (opts.lossy) {
    args.push(`--lossy=${opts.lossy}`);
  }
  if (opts.loop) {
    args.push('--loopcount=0');
  } else {
    args.push('--no-loopcount');
  }

  return execProcessor(gifsicle, args, inputBuffer);
};
