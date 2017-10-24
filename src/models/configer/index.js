/**
 * Configer Model
 * @author ryan.bian
 */
const Commander = require('../../service/commander');

class ConfigerAPI {
  async getConfigs(ctx) {
    ctx.body = ctx.app.responser([
      { id: 'ehdev-configer-test', name: 'test', version: '1.0', },
      { id: 'ehdev-configer-test222', name: 'test222', version: '1.1', },
    ], true);
  }
  async getRemoteConfigs(ctx) {
    try {
      const result = await Commander.run('npm search --json ehdev-configs');
      ctx.body = ctx.app.responser(result, true);
    } catch(e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  add(ctx) {

  }
  upload(ctx) {

  }
  remove(ctx) {

  }
  upgrade(ctx) {

  }
}

module.exports = ConfigerAPI;
