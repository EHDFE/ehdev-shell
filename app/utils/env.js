import os from 'os';

const EnvUtils = {
  isMac: os.platform() === 'darwin',
  isWinows: os.platform() === 'win32',
};

export default EnvUtils;
