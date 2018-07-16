const fs = require('fs');
const tempfile = require('tempfile');
const { promisify } = require('util');

const { execProcessor, getBinaryPath } = require('../utils');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const ffmpeg = getBinaryPath('ffmpeg', undefined);

module.exports = async (input, opts) => {
  const args = ['-i'];

  if (Buffer.isBuffer(input)) {
    const tmpPath = tempfile();
    await writeFile(tmpPath, input);
    args.push(tmpPath);
  } else {
    args.push(input);
  }

  switch (opts.target) {
  case 'mp4':
  // ignore here
    args.push('-c:v', 'libx264');
    break;
  case 'webm':
    args.push('-c', 'vp9');
    break;
  case 'gif':
    break;
  }

  if (opts.crf) {
    args.push('-b:v', 0);
    args.push('-crf', opts.crf);
  }

  if (opts.vframes && opts.vframes !== 0) {
    args.push('-vframes', opts.vframes);
  }

  if (opts.frameRate) {
    args.push('-r', opts.frameRate);
  }

  const output = tempfile(`.${opts.target}`);
  args.push(output);

  try {
    await execProcessor(ffmpeg, args);
    return readFile(output);
  } catch (e) {
    throw e;
  }
};
