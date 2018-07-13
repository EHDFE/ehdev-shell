const fs = require('fs');
const tempfile = require('tempfile');
const { promisify } = require('util');
const { execProcessor, getBinaryPath } = require('../utils');

const writeFile = promisify(fs.writeFile);
const jpegCompare = getBinaryPath('jpeg-archive', 'jpeg-compare');

module.exports = async (image1, image2, opts) => {
  const args = [];

  if (opts.method) {
    args.push('--method', opts.method);
  }

  if (Buffer.isBuffer(image1)) {
    const input1 = tempfile();
    await writeFile(input1, image1);
    args.push(input1);
  } else {
    args.push(image1);
  }

  if (Buffer.isBuffer(image2)) {
    const input2 = tempfile();
    await writeFile(input2, image2);
    args.push(input2);
  } else {
    args.push(image2);
  }

  let result;
  try {
    result = await execProcessor(jpegCompare, args);
  } catch (e) {
    throw e;
  }
  return result.toString();
};
