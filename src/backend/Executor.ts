import Path from 'path';
import { app } from 'electron';
import { exec } from 'child_process';
import { exec as execSudo } from 'sudo-prompt';

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

  private getPath(script: 'request' | 'script') {
    const scriptPath = Path.join('assets', process.platform, `${script}.sh`);
    const p = app.isPackaged
      ? Path.join(process.resourcesPath, scriptPath)
      : Path.join(__dirname, '..', '..', scriptPath);
    return this.build(p);
  }

  private request() {
    return new Promise<void>((resolve, reject) => {
      execSudo(this.getPath('request'), (err) => {
        if (err) return reject(err);
        else return resolve();
      });
    });
  }

  execute() {
    const { cmd, cwd } = this.opt;
    const internal = () => {
      return new Promise<void>((resolve, reject) => {
        exec(
          `${this.getPath('script')} "${this.formatCwd(cwd)}" "${cmd}"`,
          (err) => {
            if (!err) return resolve();
            else return reject(err);
          }
        );
      });
    };
    return internal();
  }
}
