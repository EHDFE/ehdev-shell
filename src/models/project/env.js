/**
 * Project Environment Model
 * @author ryan.bian
 */
const path = require('path');
const { readJSON, writeJSON, glob } = require('../../utils/');
const context = require('../../context');
const scmProvider = require('../../provider/scm');

exports.setRoot = async rootPath => {
  const ret = {};
  try {
    const projectConfig = await readJSON(
      path.join(rootPath, 'abc.json')
    );
    Object.assign(ret, {
      runnable: true,
      config: projectConfig,
    });
  } catch (e) {
    Object.assign(ret, {
      runnable: false,
      config: {},
    });
  }
  try {
    const pkg = await readJSON(
      path.join(rootPath, 'package.json')
    );
    Object.assign(ret, {
      pkg,
    });
  } catch (e) {
    Object.assign(ret, {
      pkg: {},
    });
  }
  try {
    const files = await glob('.eslintrc*', {
      cwd: rootPath,
      nodir: true,
    });
    const scmInfo = await scmProvider.detect(rootPath);
    Object.assign(ret, {
      useESlint: files.length > 0,
      scmInfo,
    });
  } catch (e) {
    // ignore
  }
  return ret;
};

exports.makeRecord = rootPath => {
  // insert project to db
  return new Promise((resolve, reject) => {
    context.getDataBase('project').update(
      {
        projectPath: rootPath,
      },
      {
        $inc: {
          count: 1,
        },
      },
      { upsert: true },
      (err, newDoc) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            newDoc,
          });
        }
      });
  });
};

exports.setConfig = async (rootPath, config) => {
  try {
    let configStr = JSON.stringify(config, null, '\t');
    await writeJSON(path.join(rootPath, 'abc.json'), configStr);
    return '修改成功';
  } catch (e) {
    throw e;
  }
};
