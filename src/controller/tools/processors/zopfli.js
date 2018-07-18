const zopfli = require('zopflipng-bin');
const tempfile = require('tempfile');
const { execProcessor } = require('../utils');

module.exports = (input, opts) => {
  const args = ['-y'];

  if (opts['8bit']) {
    args.push('--lossy_8bit');
  }
  if (opts.transparent) {
    args.push('--lossy_transparent');
  }
  // if (opts.iterations) {
  //   args.push(`--iterations=${opts.iterations}`);
  // }
  // if (opts.iterationsLarge) {
  //   args.push(`--iterations_large=${opts.iterationsLarge}`);
  // }
  if (opts.more) {
    args.push('-m');
  }

  const output = tempfile();
  args.push(input, output);

  return execProcessor(zopfli, args, null, output);
};
