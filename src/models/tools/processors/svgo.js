const { promisify } = require('util');
const fs = require('fs');
const SVGO = require('svgo');
const readFile = promisify(fs.readFile);

module.exports = async (input, opts) => {
  let inputBuffer;
  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else {
    inputBuffer = await readFile(input);
  }
  const svgo = new SVGO(opts);
  return svgo
    .optimize(inputBuffer)
    .then(res => Buffer.from(res.data));
};
