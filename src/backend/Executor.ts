import { exec } from 'child_process';
import { app } from 'electron';
import Path from 'path';

export default class Executor {
  private opt: { cmd: string; cwd: string };
  constructor(opt: { cmd?: string; cwd?: string }) {
    const cmd = opt.cmd || '';
    const cwd = opt.cwd || '';
    this.opt = { cwd, cmd };
  }

  private formatCwd(cwd: string) {
    switch (process.platform) {
      case 'win32':
        return cwd;
      default:
        return `${Path.sep}${cwd}`;
    }
  }

  private build(path: string) {
    switch (process.platform) {
      case 'win32':
        return path;
      default:
        return `sh ${path}`;
    }
  }

  private getPath() {
    const scriptPath = Path.join('assets', process.platform, `script.sh`);
    const p = app.isPackaged
      ? Path.join(process.resourcesPath, scriptPath)
      : Path.join(__dirname, '..', '..', scriptPath);
    return this.build(p);
  }

  execute() {
    const { cmd, cwd } = this.opt;
    return new Promise<void>((resolve, reject) => {
      exec(`${this.getPath()} "${this.formatCwd(cwd)}" "${cmd}"`, (err) => {
        if (!err) return resolve();
        else return reject(err);
      });
    });
  }
}
