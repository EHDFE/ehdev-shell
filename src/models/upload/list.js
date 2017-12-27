/**
 * Upload List Model
 * @author ryan.bian
 */
const context = require('../../context');

/**
 * fetch file list by limit & start
 * limit: Number,
 * start: Number
 */
exports.get = async (config) => {
  const { limit, start } = Object.assign({
    limit: 100,
    start: 0,
  }, config);
  return new Promise((resolve, reject) => {
    context.getDataBase('upload').find({})
      .skip(start)
      .limit(limit)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            content: docs,
            limit,
            start,
          });
        }
      });
  });
};
/**
 * update files in the list
 * files: Array<Object>
 */
exports.post = async files => {
  try {
    const insertData = files;
    return new Promise((resolve, reject) => {
      context.getDataBase('upload').insert(
        Array.isArray(insertData) ? insertData : [insertData],
        (err, newDocs) => {
          if (err) {
            reject(err);
          } else {
            resolve(newDocs);
          }
        }
      );
    });
  } catch (e) {
    throw e;
  }
};
/**
 * delete files by id
 * ids: Array<String>
 */
exports.del = async (ids) => {
  // const ids = ctx.params.ids ? ctx.params.ids.split(',') : [];
  try {
    return new Promise((resolve, reject) => {
      context.getDataBase('upload').remove(
        {
          _id: { $in: ids }
        },
        { multi: true },
        (err, numRemoved) => {
          if (err) {
            reject(err);
          } else {
            resolve(numRemoved);
          }
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

// class ListAPI {
//   /**
//    * fetch file list by limit & start
//    * limit: Number,
//    * start: Number
//    */
//   async get(ctx) {
//     const { limit, start } = Object.assign({
//       limit: 100,
//       start: 0,
//     }, ctx.query);
//     await new Promise(resolve => {
//       ctx.app.db.upload.find({})
//         .skip(start)
//         .limit(limit)
//         .exec((err, docs) => {
//           if (err) {
//             ctx.body = ctx.app.responser(err, false);
//           } else {
//             ctx.body = ctx.app.responser({
//               content: docs,
//               limit,
//               start,
//             }, true);
//           }
//           resolve();
//         });
//     });
//   }
//   // async put() {
//   // }
//   /**
//    * update files in the list
//    * files: Array<Object>
//    */
//   async post(ctx) {
//     const { files } = ctx.request.body;
//     try {
//       const insertData = JSON.parse(files);
//       await new Promise(resolve => {
//         ctx.app.db.upload.insert(
//           Array.isArray(insertData) ? insertData : [insertData],
//           (err, newDocs) => {
//             if (err) {
//               ctx.body = ctx.app.responser(err, false);
//             } else {
//               ctx.body = ctx.app.responser(newDocs, true);
//             }
//             resolve();
//           }
//         );
//       });
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.message, false);
//     }
//   }
//   /**
//    * delete files by id
//    * ids: Array<String>
//    */
//   async del(ctx) {
//     const ids = ctx.params.ids ? ctx.params.ids.split(',') : [];
//     await new Promise(resolve => {
//       ctx.app.db.upload.remove(
//         {
//           _id: { $in: ids }
//         },
//         { multi: true },
//         (err, numRemoved) => {
//           if (err) {
//             ctx.body = ctx.app.responser(err, false);
//           } else {
//             ctx.body = ctx.app.responser(numRemoved, true);
//           }
//           resolve();
//         }
//       );
//     });
//   }
// }

// module.exports = ListAPI;
