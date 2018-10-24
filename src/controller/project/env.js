/**
 * Project Environment Model
 * @author ryan.bian
 */
const path = require('path');
const { readJSON } = require('../../utils/');
const context = require('../../context');
const scmProvider = require('../../provider/scm');

exports.setRoot = async rootPath => {
  const ret = {};
  const configPath = path.join(rootPath, 'abc.json');
  try {
    const projectConfig = await readJSON(configPath);
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
    const pkg = await readJSON(path.join(rootPath, 'package.json'));
    Object.assign(ret, {
      pkg,
    });
  } catch (e) {
    Object.assign(ret, {
      pkg: {},
    });
  }
  try {
    const scmInfo = await scmProvider.detect(rootPath);
    Object.assign(ret, {
      scmInfo,
    });
  } catch (e) {
    // ignore
  }
  return ret;
};

exports.makeRecord = async projectPath => {
  // insert project to db
  let pkg;
  try {
    pkg = await readJSON(path.join(projectPath, 'package.json'));
  } catch (e) {
    throw e;
  }
  return new Promise((resolve, reject) => {
    context.getDataBase('workspace').update(
      {
        projectPath,
      },
      {
        $inc: {
          count: 1,
        },
        $set: {
          name: pkg.name,
          lastTime: Date.now(),
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
      },
    );
  });
};
