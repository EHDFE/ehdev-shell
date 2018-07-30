const { promisify } = require('util');
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { EventEmitter } = require('events');
const { md5File, getLocalIP } = require('../../utils/');
const template = require('./template');

const access = promisify(fs.access);

class PortalService {
  constructor() {
    this.port = 8989;
    this.pool = new Map();
    this.state = new EventEmitter();
    this.server = http.createServer((req, res) => {
      const hash = url.parse(req.url).pathname.slice(1);
      if (this.pool.has(hash)) {
        const filePath = this.pool.get(hash);
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, {
          'Content-Type': 'text/html',
        });
        const assets = [];
        for (let key of this.pool.keys()) {
          assets.push(`<li><a href="/${key}">${this.pool.get(key)}</a></li>`);
        }
        res.write(template(assets));
        res.end();
      }
    });
    this.server.on('connection', socket => {
      function destroy() {
        socket.destroy();
      }
      this.state.once('shutdown', destroy);
      socket.once('close', () => {
        this.state.removeListener('shutdown', destroy);
      });
    });
  }
  start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, err => {
        if (err) return reject(err);
        resolve(this.host);
      });
    });
  }
  stop() {
    return new Promise((resolve, reject) => {
      this.state.emit('shutdown');
      this.server.close(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  get listening() {
    return !!this.server.listening;
  }
  get host() {
    const ip = getLocalIP();
    return `http://${ip}:${this.port}`;
  }
  getPool() {
    return [...this.pool.entries()];
  }
  async open(filePaths) {
    try {
      const ids = [];
      for (const filePath of filePaths) {
        await access(filePath, fs.constants.F_OK | fs.constants.R_OK);
        const id = await md5File(filePath);
        this.pool.set(id, filePath);
        ids.push(id);
      }
      return ids;
    } catch (e) {
      throw e;
    }
  }
  async close(id) {
    if (this.pool.has(id)) {
      this.pool.delete(id);
    }
  }
}

const portalService = new PortalService();

module.exports = portalService;

