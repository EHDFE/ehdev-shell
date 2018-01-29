/**
 * Project Environment Model
 * @author ryan.bian
 */
const path = require('path');
const { readJSON, writeJSON, glob } = require('../../utils/');
const context = require('../../context');
const scmProvider = require('../../provider/scm');

exports.setRoot = async rootPath => {
  let projectConfig;
  let runnable;
  try {
    projectConfig = await readJSON(
      path.join(rootPath, 'abc.json')
    );
    runnable = true;
  } catch (e) {
    runnable = false;
  }
  try {
    const pkg = await readJSON(
      path.join(rootPath, 'package.json')
    );
    const files = await glob('.eslintrc*', {
      cwd: rootPath,
      nodir: true,
    });
    const scmInfo = await scmProvider.detect(rootPath);
    return {
      pkg,
      config: projectConfig,
      runnable,
      useESlint: files.length > 0,
      scmInfo,
    };
  } catch (e) {
    throw e;
  }
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
