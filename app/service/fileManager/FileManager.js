import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { extname, basename } from 'path';
import fileType from 'file-type';

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

export default class FileManager {
  async isDirectory(path) {
    const stats = await stat(path);
    return stats.isDirectory();
  }
  async resolveFiles(pathList) {
    const files = [];
    for (const path of pathList) {
      try {
        const stats = await stat(path);
        if (stats.isDirectory()) {
          const paths = await this.readDirectory(path);
          const filesInDirectory = await this.resolveFiles(paths);
          files.push(...filesInDirectory);
        } else {
          const ext = extname(path);
          const name = basename(path);
          const fileBuffer = await readFile(path);
          let type;
          if (ext === '.svg') {
            type = 'image/svg+xml';
          } else {
            const detection = fileType(fileBuffer);
            type = detection ? detection.mime : 'unknown';
          }
          const ab = fileBuffer.buffer.slice(
            fileBuffer.byteOffset,
            fileBuffer.byteOffset + fileBuffer.byteLength
          );
          const file = new File([ab], name, {
            type,
            lastModified: stats.mtime,
          });
          // 人为构造一个 file 对象
          Object.defineProperty(file, 'path', {
            value: path,
            enumerable: true,
          });
          files.push(file);
        }
      } catch (e) {
        // ignore this file
      }
    }
    return files;
  }
  async readDirectory(dir) {
    let paths;
    try {
      paths = await readdir(dir);
    } catch (e) {
      paths = [];
    }
    return paths.map(p => join(dir, p));
  }
  async saveFile(filePath, data) {
    return writeFile(filePath, data);
  }
}
