/**
 * Server Service
 * @author ryan.bian
 */
const { Service } = require('./base');

class Server extends Service {
  constructor(...args) {
    super(...args);
    this.serviceName = 'server';
  }
}

module.exports = Server;

