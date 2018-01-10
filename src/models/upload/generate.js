// /**
//  * generate file Model
//  * @author Hefan
//  */
// const ImageMin = require('./imagemain');

// class GenerateAPI {
//   /**
//    * 图片处理
//    * files: Array<Object>
//    */
//   async post(ctx) {
//     const reqBody = ctx.request.body;
//     const files = reqBody.files.files;
//     let resArr = [];
//     const config = JSON.parse(reqBody.fields.config);

//     try {
//       if (Array.isArray(files)) {
//         for (let file of files) {
//           const res = await ImageMin(file, config);
//           resArr = resArr.concat(res);
//         }
//       } else {
//         const file = files;
//         const res = await ImageMin(file, config);
//         resArr = resArr.concat(res);
//       }


//       ctx.body = JSON.stringify({
//         result: 'success',
//         success: true,
//         data: resArr
//       });
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.message, false);
//     }
//   }
// }

// module.exports = GenerateAPI;
