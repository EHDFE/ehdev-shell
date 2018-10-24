const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const { promisify } = require('util');
const { platform } = require('../../utils/env');
const readFile = promisify(fs.readFile);

const appPath = app.getAppPath();

exports.readFile = readFile;

exports.getBinaryPath = (binary, tool_name) => {
  let binaryPath = [appPath, 'vendor'];
  let ext = '';
  switch (platform) {
    case 'Mac':
      binaryPath.push('mac');
      break;
    case 'Windows':
      ext = '.exe';
      binaryPath.push('win');
      break;
    default:
      binaryPath.push('linux');
      break;
  }
  binaryPath.push(binary);
  if (tool_name) {
    binaryPath.push(`${tool_name}${ext}`);
  } else {
    binaryPath.push(`${binary}${ext}`);
  }
  return path.resolve(...binaryPath);
};

exports.execProcessor = (processor, args, inputBuffer, outputPath) => {
  return new Promise((resolve, reject) => {
    const cp = execFile(
      processor,
      args,
      {
        encoding: null,
        maxBuffer: Infinity,
      },
      (err, stdout) => {
        if (err) return reject(err);
        if (outputPath) {
          readFile(outputPath)
            .then(buffer => {
              resolve(buffer);
              fs.unlink(outputPath);
            })
            .catch(err => {
              reject(err);
              fs.unlink(outputPath);
            });
        } else {
          resolve(stdout);
        }
      },
    );
    if (inputBuffer) {
      cp.stdin.end(inputBuffer);
    }
  });
};
