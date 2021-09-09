import Path from 'path';
import Shell from 'node-powershell';
import { app } from 'electron';
import { exec } from 'child_process';

export default class Executor {
  public opt: { cmd: string; cwd: string };
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

  private buildScriptCommand(path: string) {
    switch (process.platform) {
      case 'win32':
        return path;
      default:
        return `sh ${path}`;
    }
  }

  private getScriptPath() {
    switch (process.platform) {
      case 'win32':
        return 'script.bat';
      default:
        return `script.sh`;
    }
  }

  public buildCommand(path: string) {
    const { cmd, cwd } = this.opt;
    return `${path} "${this.formatCwd(cwd)}" "${cmd}"`;
  }

  private getPath() {
    const scriptPath = Path.join(
      'assets',
      process.platform,
      this.getScriptPath()
    );
    const p = app.isPackaged
      ? Path.join(process.resourcesPath, scriptPath)
      : Path.join(__dirname, '..', '..', scriptPath);
    return this.buildScriptCommand(p);
  }

  private executeWin() {
    const ps = new Shell({
      executionPolicy: 'Bypass',
      noProfile: true,
    });
    const cwd = `""${this.opt.cwd}""`;
    const cmd = `""${this.opt.cmd || 'start cmd'}""`;
    const path = this.getPath();
    ps.addCommand(`Start-Process -FilePath ${path} "${cwd} ${cmd}"`);
    return ps
      .invoke()
      .then(() => {})
      .finally(() => ps.dispose());
  }

  execute() {
    if (process.platform === 'win32') {
      return this.executeWin();
    } else {
      return new Promise<void>((resolve, reject) => {
        exec(this.buildCommand(this.getPath()), (err) => {
          if (!err) {
            return resolve();
          } else {
            return reject(err);
          }
        });
      });
    }
  }
}
