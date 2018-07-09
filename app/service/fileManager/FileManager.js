import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import File from './File';

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

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
          files.push(File.from(path, stats));
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
