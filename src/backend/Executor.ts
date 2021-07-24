import Path from 'path';
import Shell from 'node-powershell';
import { app } from 'electron';
import { exec } from 'child_process';

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

  private getScriptPath() {
    switch (process.platform) {
      case 'win32':
        return 'script.bat';
      default:
        return `sh script.sh`;
    }
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
    return this.build(p);
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
      const { cmd, cwd } = this.opt;
      return new Promise<void>((resolve, reject) => {
        exec(`${this.getPath()} "${this.formatCwd(cwd)}" "${cmd}"`, (err) => {
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
