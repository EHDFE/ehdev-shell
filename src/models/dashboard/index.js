/**
 * Dashboard Model
 * @author ryan.bian
 */
const context = require('../../context');

exports.getProjectList = async (ctx) => {
  await new Promise((resolve, reject) => {
    context.getDataBase('project').project.find({}, (err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          docs,
        });
      }
    });
  });
};

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
  context.getDataBase('project').count({}, (err, count) => {
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

// class DashboardAPI {
//   async getProjectList(ctx) {
//     await new Promise(resolve => {
//       ctx.app.db.project.find({}, (err, docs) => {
//         if (err) {
//           ctx.body = ctx.app.responser(err.toString(), false);
//         } else {
//           ctx.body = ctx.app.responser(
//             {
//               docs,
//             },
//             true
//           );
//         }
//         resolve();
//       });
//     });
//   }
//   async getOverall(ctx) {
//     const { db } = ctx.app;
//     const getAssetsCount = new Promise((resolve, reject) => {
//       db.upload.count({}, (err, count) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(count);
//         }
//       });
//     });
//     const getProjectsCount = new Promise((resolve, reject) => {
//       db.project.count({}, (err, count) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(count);
//         }
//       });
//     });
//     try {
//       const assetsCount = await getAssetsCount;
//       const projectsCount = await getProjectsCount;
//       ctx.body = ctx.app.responser(
//         {
//           assetsCount,
//           projectsCount,
//         },
//         true
//       );
//     } catch (e) {
//       // ignore
//       ctx.body = ctx.app.responser(
//         {
//           assetsCount: 0,
//           projectsCount: 0,
//         },
//         true
//       );
//     }
//   }
// }

// module.exports = DashboardAPI;
