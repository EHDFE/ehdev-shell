/**
 * Dashboard Model
 * @author ryan.bian
 */
const context = require('../../context');

exports.getProjectList = () =>
  new Promise((resolve, reject) => {
    context.getDataBase('workspace').find({}, (err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          docs,
        });
      }
    });
  });

const getAssetsCount = () => new Promise((resolve, reject) => {
  context.getDataBase('upload').count({}, (err, count) => {
    if (err) {
      reject(err);
    } else {
      resolve(count);
    }
  });
});
const getProjectsCount = () => new Promise((resolve, reject) => {
  context.getDataBase('workspace').count({}, (err, count) => {
    if (err) {
      reject(err);
    } else {
      resolve(count);
    }
  });
});
exports.getOverall = async () => {
  try {
    const assetsCount = await getAssetsCount();
    const projectsCount = await getProjectsCount();
    return {
      assetsCount,
      projectsCount,
    };
  } catch (e) {
    // ignore
    return {
      assetsCount: 0,
      projectsCount: 0,
    };
  }
};
