const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

exports.execProcessor = (processor, args, inputBuffer, outputPath) => {
  return new Promise((resolve, reject) => {
    const cp = execFile(processor, args, {
      encoding: null,
      maxBuffer: Infinity,
    }, (err, stdout) => {
      if (err) return reject(err);
      if (outputPath) {
        readFile(outputPath)
          .then(buffer => {
            resolve(buffer);
            unlink(outputPath);
          }).catch(err => {
            reject(err);
            unlink(outputPath);
          });
      } else {
        resolve(stdout);
      }
    });
    if (inputBuffer) {
      cp.stdin.end(inputBuffer);
    }
  });
};
