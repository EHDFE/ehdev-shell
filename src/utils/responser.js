/**
 * define json response format
 * @author ryan.bian
 */

module.exports = (content, successful = false) => {
  if (successful) {
    return {
      success: true,
      data: content,
    };
  }
  return {
    success: false,
    errorMsg: content,
  }
};
