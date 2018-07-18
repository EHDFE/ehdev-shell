const { execFile } = require('child_process');
const { platform } = require('os');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const { promisify } = require('util');
const readFile = promisify(fs.readFile);

const appPath = app.getAppPath();

exports.readFile = readFile;

exports.getBinaryPath = (binary, tool_name) => {
  let binaryPath = [appPath, 'vendor'];
  switch (platform()) {
  case 'darwin':
    binaryPath.push('mac');
    break;
  case 'win32':
    binaryPath.push('win');
    break;
  default:
    binaryPath.push('linux');
    break;
  }
  binaryPath.push(binary);
  if (tool_name) {
    binaryPath.push(tool_name);
  } else {
    binaryPath.push(binary);
  }
  return path.resolve(...binaryPath);
};

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
            fs.unlink(outputPath);
          }).catch(err => {
            reject(err);
            fs.unlink(outputPath);
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
