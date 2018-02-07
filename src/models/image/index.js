/**
 * generate imageMin Model
 * @author Hefan
 */
const generate = require('./generate');
const imageInfo = require('image-info');

function imageInfo2(path) {
  return new Promise(function(resolve, reject) {
    imageInfo(path, (err, info) => {
      if (err) {
        console.warn(err);
        reject(err);
      }
      resolve(info);
    });
  });
}

const imageMin = async ({ fileArr, config }) => {
  let filePaths = [];
  const res = await generate({ fileArr, config });

  if (res && res.length) {
    for (let i = 0; i < res.length; i++) {
      let files = res[i];
      if (!files || !files.length) return;
      for (let j = 0; j < files.length; j++) {
        let file = files[j];

        let info = await imageInfo2(file.path);
        Object.assign(res[i][j], info);
      }
    }
  }

  if (res && res.length) {
    return {
      result: 'success',
      msg: '处理成功',
      data: res
    };
  } else {
    return {
      result: 'error',
      msg: '处理失败',
      data: res
    };
  }
};

module.exports = imageMin;
