const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const pngquant = require('pngquant-bin');
const mozjpeg = require('mozjpeg');
const gifsicle = require('gifsicle');
const webp = require('cwebp-bin');
const guetzli = require('guetzli');
const tempfile = require('tempfile');

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const PROCESSOR_LIST = {
  pngquant,
  mozjpeg,
  gifsicle,
  webp,
  guetzli,
  // gif2webp,
};

const PROCESSORS_WHICH_WRITE_TO_FS = new Set([
  'guetzli',
  'webp',
]);

const PROCESSORS_WHICH_ACCPET_FILEPATH = new Set([
  'guetzli',
  'webp',
]);

exports.runProcessor = async (input, processor, config, tempOutput) => {
  const useFilePath = PROCESSORS_WHICH_ACCPET_FILEPATH.has(processor);
  const outputWriteToFs = PROCESSORS_WHICH_WRITE_TO_FS.has(processor);
  const isStream = Buffer.isBuffer(input);
  let imageInput, outputPath;
  try {
    if (!useFilePath && !isStream) {
      imageInput = await readFile(input);
    } else {
      imageInput = input;
    }
  } catch (e) {
    throw e;
  }
  if (outputWriteToFs) {
    outputPath = tempfile();
  }
  const args = argParser(
    processor,
    config,
    input,
    outputPath,
  );

  return new Promise((resolve, reject) => {
    const cp = execFile(PROCESSOR_LIST[processor], args, {
      encoding: null,
      maxBuffer: Infinity,
    }, (err, stdout) => {
      if (err) return reject(err);
      if (outputWriteToFs) {
        readFile(outputPath)
          .then(buffer => {
            resolve(buffer);
            unlink(outputPath);
          });
      } else {
        resolve(stdout);
      }
    });
    if (!useFilePath) {
      cp.stdin.end(imageInput);
    }
  });
};

const argParser = (processor, opts, input, output) => {
  const args = [];
  switch (processor) {
  case 'pngquant':
    args.push('-');
    if (opts.floyd && typeof opts.floyd === 'number') {
      args.push(`--floyd=${opts.floyd}`);
    }
    if (opts.floyd && typeof opts.floyd === 'boolean') {
      args.push('--floyd');
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
    break;
  case 'mozjpeg':
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
    break;
  case 'gifsicle':
    args.push('--no-warnings', '--no-app-extensions');
    if (opts.interlaced) {
      args.push('--interlace');
    }
    if (opts.optimizationLevel) {
      args.push(`--optimize=${opts.optimizationLevel}`);
    }
    if (opts.colors) {
      args.push(`--colors=${opts.colors}`);
    }
    break;
  case 'webp':
    args.push('-quiet', '-mt');
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
    args.push('-o', output, input);
    break;
  case 'guetzli':
    if (opts.quality >= 0 && opts.quality <= 100) {
      args.push('--quality', opts.quality);
    }
    if (opts.memlimit > 0) {
      args.push('--memlimit', opts.memlimit);
    }
    if (opts.nomemlimit) {
      args.push('--nomemlimit');
    }
    args.push(input, output);
    break;
  }

  return args;
};
