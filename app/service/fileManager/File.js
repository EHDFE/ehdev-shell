import { readFileSync } from 'fs';
import { extname, basename } from 'path';
import fileType from 'file-type';

export default class File {
  static from(path, stats) {
    const ext = extname(path);
    const name = basename(path);
    let type;
    if (ext === '.svg') {
      type = 'image/svg+xml';
    } else {
      const buffer = readFileSync(path);
      const detection = fileType(buffer);
      type = detection.mime;
    }
    return new File({
      name,
      type,
      path,
      size: stats.size,
      lastModified: stats.mtime,
    });
  }
  constructor(config) {
    this.name = config.name;
    this.type = config.type;
    this.path = config.path;
    this.size = config.size;
    this.lastModified = config.lastModified;
  }
}
