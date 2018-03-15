const path = require('path');
const { hasDir } = require('../../utils');

module.exports = {
  async detect(projectRoot) {
    const isGitProject = await hasDir(
      path.join(projectRoot, '.git'),
    );
    const isSvnProject = await hasDir(
      path.join(projectRoot, '.svn'),
    );
    return {
      isGitProject,
      isSvnProject,
    };
  },
};
