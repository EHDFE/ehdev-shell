/**
 * util libs
 * @author ryan.bian
 */
const { promisify } = require('util');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const QRCode = require('qrcode');
const glob = require('glob');
const isString = require('lodash/isString');

const platform = os.platform();

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

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
exports.readJSON = async file => {
  try {
    const data = await readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    throw e;
  }
};

/**
 * write a JSON format file
 * @param {string} file - file path
 * @param {string} json - input json
 */
exports.writeJSON = async (file, json) => {
  try {
    writeFile(file, json, 'utf-8');
    return true;
  } catch (e) {
    throw e;
  }
};

/**
 * indicate whether a given path is a direcotry
 * @param {string} string - directory path
 */
exports.hasDir = async path => {
  let isDirectory;
  try {
    const stats = await stat(path);
    isDirectory = stats.isDirectory();
  } catch (e) {
    isDirectory = false;
  }
  return isDirectory;
};

/**
 * indicate whether a given path is a file
 * @param {string} string - file path
 */
exports.hasFile = async path => {
  let isFile;
  try {
    const stats = await stat(path);
    isFile = stats.isFile();
  } catch (e) {
    isFile = false;
  }
  return isFile;
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

exports.md5File = filePath => new Promise((resolve) => {
  const rs = fs.createReadStream(filePath);
  const md5hash = crypto.createHash('md5');
  rs.on('data', chunk => {
    md5hash.update(chunk);
  });
  rs.on('end', () => {
    resolve(md5hash.digest('hex'));
  });
});

exports.killPid = (ps, pid) => new Promise((resolve, reject) => {
  if (platform === 'win32') {
    // windows
    exec(`taskkill /pid ${pid} /T /F`, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  } else {
    // unix
    try {
      ps.kill('SIGTERM');
      resolve();
    } catch (e) {
      return reject(new Error(e));
    }
  }
});

exports.getLocalIP = () => {
  const ifs = require('os').networkInterfaces();
  return Object.keys(ifs)
    .map(x => ifs[x].filter(x => x.family === 'IPv4' && !x.internal)[0])
    .filter(x => x)[0].address;
};

exports.findExecutable = (command, cwd, options) => {
  // If we have an absolute path then we take it.
  if (path.isAbsolute(command)) {
    return command;
  }
  let dir = path.dirname(command);
  if (dir !== '.') {
    // We have a directory and the directory is relative (see above). Make the path absolute
    // to the current working directory.
    return path.join(cwd, command);
  }
  let paths;
  // The options can override the PATH. So consider that PATH if present.
  if (options && options.env) {
    // Path can be named in many different ways and for the execution it doesn't matter
    for (let key of Object.keys(options.env)) {
      if (key.toLowerCase() === 'path') {
        if (isString(options.env[key])) {
          paths = options.env[key].split(path.delimiter);
        }
        break;
      }
    }
  }
  if (paths === void 0 && isString(process.env.PATH)) {
    paths = process.env.PATH.split(path.delimiter);
  }
  // No PATH environment. Make path absolute to the cwd.
  if (paths === void 0 || paths.length === 0) {
    return path.join(cwd, command);
  }
  // We have a simple file name. We get the path variable from the env
  // and try to find the executable on the path.
  for (let pathEntry of paths) {
    // The path entry is absolute.
    let fullPath;
    if (path.isAbsolute(pathEntry)) {
      fullPath = path.join(pathEntry, command);
    } else {
      fullPath = path.join(cwd, pathEntry, command);
    }
    // if (fs.existsSync(fullPath)) {
    //   return fullPath;
    // }
    let withExtension = fullPath + '.cmd';
    if (fs.existsSync(withExtension)) {
      return withExtension;
    }
    withExtension = fullPath + '.exe';
    if (fs.existsSync(withExtension)) {
      return withExtension;
    }
  }
  return path.join(cwd, command);
};
