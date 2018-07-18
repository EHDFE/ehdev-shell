const webp = require('cwebp-bin');
const tempfile = require('tempfile');
const { execProcessor } = require('../utils');

module.exports = (input, opts) => {
  const args = ['-quiet', '-mt'];
  if (opts.preset) {
    args.push('-preset', opts.preset);
  }
  if (opts.quality) {
    args.push('-q', opts.quality);
  }
  if (opts.alphaQuality) {
    args.push('-alpha_q', opts.alphaQuality);
  }
  if (opts.method) {
    args.push('-m', opts.method);
  }
  if (opts.size) {
    args.push('-size', opts.size);
  }
  if (opts.sns) {
    args.push('-sns', opts.sns);
  }
  if (opts.filter) {
    args.push('-f', opts.filter);
  }
  if (opts.autoFilter) {
    args.push('-af');
  }
  if (opts.sharpness) {
    args.push('-sharpness', opts.sharpness);
  }
  if (opts.lossless) {
    args.push('-lossless');
  }
  if (opts.nearLossless) {
    args.push('-near_lossless', opts.nearLossless);
  }

  const output = tempfile();
  args.push('-o', output, input);

  return execProcessor(webp, args, null, output);
};
