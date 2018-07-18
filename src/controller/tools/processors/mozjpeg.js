const fs = require('fs');
const mozjpeg = require('mozjpeg');
const { execProcessor } = require('../utils');

const { promisify } = require('util');
const readFile = promisify(fs.readFile);

module.exports = async (input, opts) => {
  let inputBuffer;
  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else {
    inputBuffer = await readFile(input);
  }

  const args = [];

  if (typeof opts.quality !== 'undefined') {
    args.push('-quality', opts.quality);
  }
  if (opts.progressive === false) {
    args.push('-baseline');
  }
  if (opts.targa) {
    args.push('-targa');
  }
  if (opts.revert) {
    args.push('-revert');
  }
  if (opts.fastCrush) {
    args.push('-fastcrush');
  }
  if (typeof opts.dcScanOpt !== 'undefined') {
    args.push('-dc-scan-opt', opts.dcScanOpt);
  }
  if (!opts.trellis) {
    args.push('-notrellis');
  }
  if (!opts.trellisDC) {
    args.push('-notrellis-dc');
  }
  if (opts.tune) {
    args.push(`-tune-${opts.tune}`);
  }
  if (!opts.overshoot) {
    args.push('-noovershoot');
  }
  if (opts.arithmetic) {
    args.push('-arithmetic');
  }
  if (opts.dct) {
    args.push('-dct', opts.dct);
  }
  if (opts.quantBaseline) {
    args.push('-quant-baseline', opts.quantBaseline);
  }
  if (typeof opts.quantTable !== 'undefined') {
    args.push('-quant-table', opts.quantTable);
  }
  if (opts.smooth) {
    args.push('-smooth', opts.smooth);
  }

  return execProcessor(mozjpeg, args, inputBuffer);
};
