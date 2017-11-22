/**
 * util libs
 * @author ryan.bian
 */
const { promisify } = require('util');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

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

exports.readFile = promisify(fs.readFile);

/**
 * indicate whether a given path is a direcotry
 * @param {string} string - directory path
 */
exports.hasDir = path => new Promise((resolve, reject) => {
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
exports.get = url => new Promise((resolve, reject) => {
  const req = http.get(url, (res) => {
    res.setEncoding('utf8');
    let result = '';
    res.on('data', (chunk) => {
      result += chunk;
    });
    res.on('end', () => {
      resolve(JSON.parse(result));
    });
  });
  req.on('error', (e) => {
    reject(e);
  });
});

const makeDir = (filePath) => new Promise((resolve, reject) => {
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      resolve();
    } else {
      fs.mkdir(filePath, err2 => {
        if (err2) {
          reject(err2);
        } else {
          resolve();
        }
      });
    }
  });
});

const makeRequest = (filePath, options) => new Promise((resolve, reject) => {
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
    return await makeRequest(filePath, options);
  } catch (e) {
    throw Error(e);
  }
};

exports.mkdir = promisify(fs.mkdir);
exports.stat = promisify(fs.stat);
