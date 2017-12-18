/**
 * util libs
 * @author ryan.bian
 */
const { promisify } = require('util');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const path = require('path');
const QRCode = require('qrcode');
const glob = require('glob');

const mkdir = exports.mkdir = promisify(fs.mkdir);
exports.stat = promisify(fs.stat);
exports.readFile = promisify(fs.readFile);
exports.glob = promisify(glob);


/**
 * transform response format
 * @param {Object} content - response content
 * @param {boolean} successful - successful status
 */
exports.responser = (content, successful = false) => {
  if (successful) {
    return {
      success: true,
      data: content,
    };
  }
  return {
    success: false,
    errorMsg: content,
  };
};

/**
 * read a JSON format file
 * @param {string} file - file path
 */
exports.readJSON = file => new Promise((resolve, reject) => {
  fs.readFile(file, 'utf-8', (err, data) => {
    if (err) {
      return reject(err);
    }
    try {
      const dataObj = JSON.parse(data);
      resolve(dataObj);
    } catch (e) {
      reject(e);
    }
  });
});

/**
 * write a JSON format file
 * @param {string} file - file path
 * @param {string} json - input json
 */
exports.writeJSON = (file, json) => new Promise((resolve, reject) => {
  fs.writeFile(file, json, 'utf-8', err=>{
    if (err) {
      return reject(err);
    }
    resolve(err);
  });
});

/**
 * indicate whether a given path is a direcotry
 * @param {string} string - directory path
 */
const hasDir = exports.hasDir = path => new Promise((resolve, reject) => {
  fs.stat(path, (err, stats) => {
    if (!err && stats.isDirectory()) {
      resolve();
    } else {
      reject();
    }
  });
});

/**
 * indicate whether a given path is a file
 * @param {string} string - file path
 */
exports.hasFile = path => new Promise((resolve, reject) => {
  fs.stat(path, (err, stats) => {
    if (!err && stats.isFile()) {
      resolve();
    } else {
      reject();
    }
  });
});

/**
 * http.request
 * @param {string} options - request option
 */
exports.httpGet = url => new Promise((resolve, reject) => {
  const req = http.get(url, (res) => {
    res.setEncoding('utf8');
    let result = '';
    res.on('data', (chunk) => {
      result += chunk;
    });
    res.on('end', () => {
      try {
        resolve(JSON.parse(result));
      } catch (e) {
        reject(e);
      }
    });
  });
  req.on('error', (e) => {
    reject(e);
  });
});

const makeDir = async path => {
  let dirExist;
  try {
    await hasDir(path);
    dirExist = true;
  } catch (e) {
    dirExist = false;
  }
  if (!dirExist) {
    return mkdir(path);
  }
  return dirExist;
};

const saveRemoteFile = (filePath, options) => new Promise((resolve, reject) => {
  const req = https.request(options, (res) => {
    res.pipe(fs.createWriteStream(filePath));
    res.on('end', ()=>{
      resolve();
    });
  });

  req.on('error', (e) => {
    reject(e);
  });
  req.end();
});

/**
 * save wallpaper
 */
exports.saveImage = async (filePath, options) => {
  try {
    await makeDir(path.dirname(filePath));
    return await saveRemoteFile(filePath, options);
  } catch (e) {
    throw Error(e);
  }
};

/**
 * generate qrcode
 * @param {string} text
 * @param {object} options
 */
exports.generateQRCode = (text, options) => new Promise((resolve, reject) => {
  QRCode.toDataURL(text, options, (err, url) => {
    if (err) {
      return reject(err);
    }
    resolve(url);
  });
});

/**
 * generate md5 code
 * @param {string} str
 */
exports.md5 = str => crypto.createHash('md5').update(str).digest('hex');

exports.killPid = (ps, pid, callback) => {
  const platform = os.platform();
  if (platform === 'win32') {
    // windows
    exec(`taskkill /pid ${pid} /T /F`, callback);
  } else {
    // unix
    try {
      ps.kill('SIGTERM');
    } catch (e) {
      return callback(e);
    }
    return callback();
  }
};
