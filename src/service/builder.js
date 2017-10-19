/**
 * Builder Service
 * @author ryan.bian
 */
const { Service } = require('./base');

class Builder extends Service {
  constructor(...args) {
    super(...args);
    this.serviceName = 'builder';
  }
}

module.exports = Builder;

