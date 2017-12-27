/**
 * backend starter
 * @author ryan.bian
 */
const Raven = require('raven');

module.exports = () => {

  Raven.config(
    process.env.NODE_ENV === 'production' &&
    'https://d2e7d99b1c414fe0ab0b02b67f17c1c8:d24b5c31a1a24020a73333fef1c306ab@sentry.io/247420'
  ).install();

};

