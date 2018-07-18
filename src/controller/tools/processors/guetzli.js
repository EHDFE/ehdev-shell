const guetzli = require('guetzli');
const tempfile = require('tempfile');
const { execProcessor } = require('../utils');

module.exports = (input, opts) => {
  const args = [];

  if (opts.quality >= 0 && opts.quality <= 100) {
    args.push('--quality', opts.quality);
  }
  if (opts.memlimit > 0) {
    args.push('--memlimit', opts.memlimit);
  }
  if (opts.nomemlimit) {
    args.push('--nomemlimit');
  }

  const output = tempfile();
  args.push(input, output);

  return execProcessor(guetzli, args, null, output);
};
