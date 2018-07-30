/**
 * Common API
 * @author ryan.bian
 * TODO: clean wallpaper diretory
 */
const { generateQRCode } = require('../../utils/');

/**
 * generate qrcode
 * @param {*} ctx
 */
exports.getQRCode = async text => {
  const opts = {
    color: {
      dark: '#000000ff',
      light: '#ffffffff',
    },
  };
  try {
    const url = await generateQRCode(text, opts);
    return {
      url,
    };
  } catch (e) {
    throw e;
  }
};
