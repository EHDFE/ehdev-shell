// const sharp = require('sharp');
// const fs = require('fs');

// function checkDir(path) {
//   const statDir = fs.existsSync(path);
//   if (!statDir) {
//     fs.mkdirSync(path);
//   }
// }
// /**
//  * ImageMin
//  *
//  */
// const ImageMin = async (file, config) => {
//   const Image = sharp(file.path);
//   const mimetype = file.type;
//   const fileName = file.name + '_min.';
//   const { webp, quality, format } = config;
//   const inputFormat =
//     mimetype.split('/')[1] === 'jpeg' ? 'jpg' : mimetype.split('/')[1];
//   let downloadPath = config.output;
//   downloadPath =
//     downloadPath.substr(-1) === '/' ? downloadPath : downloadPath + '/';

//   const res = [];

//   checkDir(downloadPath);
//   if (config.webp) {
//     checkDir(downloadPath + 'webp/');
//   }

//   //转为特定格式
//   if (format) {
//     let newImage;
//     let url = downloadPath + fileName + format;
//     newImage = await Image.toFormat(format)
//       .toFile(url)
//       .then(data => data);

//     newImage['originalName'] = file.name;
//     newImage['name'] = fileName + format;
//     newImage['uri'] = url;
//     res.push(newImage);
//   } else {
//     let newImage;
//     let url;
//     switch (mimetype) {
//     case 'image/jpeg':
//       url = downloadPath + fileName + 'jpg';
//       newImage = await Image.jpeg({ quality: quality })
//         .toFile(url)
//         .then(data => data);
//       break;
//     case 'image/png': {
//       url = downloadPath + fileName + 'png';
//       let pngQ = 0;
//       if (quality < 60) {
//         pngQ = 60;
//       } else if (quality > 90) {
//         pngQ = 90;
//       } else {
//         pngQ = quality;
//       }
//       pngQ = 15 - parseInt(pngQ / 10);
//       newImage = await Image.png({
//         compressionLevel: pngQ,
//         adaptiveFiltering: false
//       })
//         .toFile(url)
//         .then(data => data);
//       break;
//     }
//     default: {
//       url = downloadPath + fileName + type;
//       let type = mimetype.split('/')[1];
//       newImage = await Image.toFile(url).then(data => data);
//     }
//     }

//     newImage['originalName'] = file.name;
//     newImage['name'] = fileName + inputFormat;
//     newImage['uri'] = url;
//     res.push(newImage);
//   }
//   //生成webp
//   if (webp) {
//     let newImage;
//     let url = downloadPath + 'webp/' + fileName + 'webp';
//     newImage = await Image.webp({
//       quality: quality,
//       lossless: true
//     })
//       .toFile(url)
//       .then(data => data);

//     newImage['originalName'] = file.name;
//     newImage['name'] = fileName + inputFormat;
//     newImage['uri'] = url;
//     res.push(newImage);
//   }

//   return res;
// };

// module.exports = ImageMin;







