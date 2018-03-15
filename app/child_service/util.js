/* eslint-disable */
// refer to https://github.com/webpack/webpack-dev-server/blob/f0534fc3b900735a6474207365209406cda574ad/lib/Server.js#L400
const path = require('path');
const fs = require('fs');
const del = require('del');
const selfsigned = require('selfsigned');

const getHttpsConfig = sslPath => {
  // Use a self-signed certificate if no certificate was configured.
  // Cycle certs every 24 hours

  const certPath = path.join(sslPath, 'server.pem');
  let certExists = fs.existsSync(certPath);

  if (certExists) {
    const certStat = fs.statSync(certPath);
    const certTtl = 1000 * 60 * 60 * 24;
    const now = new Date();

    // cert is more than 30 days old, kill it with fire
    if ((now - certStat.ctime) / certTtl > 30) {
      console.info('SSL Certificate is more than 30 days old. Removing.');
      del.sync([certPath], { force: true });
      certExists = false;
    }
  }

  if (!certExists) {
    console.info('Generating SSL Certificate');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, {
      algorithm: 'sha256',
      days: 30,
      keySize: 2048,
      extensions: [{
        name: 'basicConstraints',
        cA: true
      }, {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      }, {
        name: 'subjectAltName',
        altNames: [
          {
            // type 2 is DNS
            type: 2,
            value: 'localhost'
          },
          {
            type: 2,
            value: 'localhost.localdomain'
          },
          {
            type: 2,
            value: 'lvh.me'
          },
          {
            type: 2,
            value: '*.lvh.me'
          },
          {
            type: 2,
            value: '[::1]'
          },
          {
            // type 7 is IP
            type: 7,
            ip: '127.0.0.1'
          },
          {
            type: 7,
            ip: 'fe80::1'
          }
        ]
      }]
    });

    fs.writeFileSync(certPath, pems.private + pems.cert, { encoding: 'utf-8' });
  }
  const fakeCert = fs.readFileSync(certPath);

  return {
    key: fakeCert,
    cert: fakeCert,
  };
};

exports.getHttpsConfig = getHttpsConfig;
