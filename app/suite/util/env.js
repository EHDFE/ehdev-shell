exports.isMac = process.platform === 'darwin';
exports.isWin = process.platform === 'win32';
exports.isLinux = process.platform === 'linux';
exports.isDEV = process.env.NODE_ENV === 'development';
