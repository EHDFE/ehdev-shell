const { runProcessor } = require('./utils');

exports.process = async (input, compressor, config) => {
  let result;
  try {
    result = await runProcessor(
      input,
      compressor,
      config,
    );
  } catch (e) {
    throw e;
  }
  return result;
};

// exports.processBuffer = buffer => {
//   const imageData = buffer.replace(/^data:image\/\w+;base64,/, '');
//   return imagemin.buffer(Buffer.from(imageData, 'base64'));
// };
