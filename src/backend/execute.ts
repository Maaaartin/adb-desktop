import Path from 'path';
import Shell from 'node-powershell';
import { app } from 'electron';
import { exec } from 'child_process';

export const escapeCwd = ({
  cwd,
  platform = process.platform,
  separator = Path.sep,
}: {
  cwd: string;
  platform?: typeof process.platform;
  separator?: string;
}) => (platform === 'win32' ? `""${cwd}""` : `"${separator}${cwd}"`);

export const escapeCmd = ({
  cmd,
  prefix = '',
  platform = process.platform,
}: {
  cmd: string;
  prefix?: string;
  platform?: typeof process.platform;
}) =>
  platform === 'win32' ? `""${cmd || 'start cmd'}""` : `"${prefix}${cmd}"`;

export const escapeScriptPath = (path: string, platform = process.platform) =>
  platform === 'win32' ? path : `sh ${path}`;

export const getScriptName = (platform = process.platform) =>
  platform === 'win32' ? 'script.bat' : 'script.sh';

const getScriptPath = () => {
  const scriptPath = Path.join('assets', process.platform, getScriptName());
  const p = app.isPackaged
    ? Path.join(process.resourcesPath, scriptPath)
    : Path.join(__dirname, '..', '..', scriptPath);
  return escapeScriptPath(p);
};

const execWin32 = (cmd: string, cwd: string) => {
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true,
  });

  const path = getScriptPath();
  ps.addCommand(
    `Start-Process -FilePath ${path} "${escapeCwd({
      cwd,
      platform: 'win32',
    })} ${escapeCmd({
      cmd,
      platform: 'win32',
    })}"`
  );
  return ps
    .invoke()
    .then(() => {})
    .finally(() => ps.dispose());
};

export const execute = ({
  cwd = '',
  cmd = '',
  prefixCmd = false,
  platform = process.platform,
}: {
  cmd?: string;
  cwd?: string;
  prefixCmd?: boolean;
  platform?: typeof process.platform;
}) => {
  if (platform === 'win32') {
    return execWin32(cmd, cwd);
  } else {
    return new Promise<void>((resolve, reject) => {
      exec(
        `${getScriptPath()} ${escapeCwd({ cwd })} ${escapeCmd({
          cmd,
          prefix: prefixCmd ? './' : '',
        })}`,
        (err) => {
          if (!err) {
            return resolve();
          } else {
            return reject(err);
          }
        }
      );
    });
  }
};
// export default class Executor {
//   public opt: { cmd: string; cwd: string };
//   constructor(opt: { cmd?: string; cwd?: string }) {
//     const cmd = opt.cmd || '';
//     const cwd = opt.cwd || '';
//     this.opt = { cwd, cmd };
//   }

//   public buildCommand(path: string) {
//     const { cmd, cwd } = this.opt;
//     return `${path} "${escapeCwd(cwd)}" "${cmd}"`;
//   }

//   private getPath() {
//     const scriptPath = Path.join('assets', process.platform, getScriptName());
//     const p = app.isPackaged
//       ? Path.join(process.resourcesPath, scriptPath)
//       : Path.join(__dirname, '..', '..', scriptPath);
//     return escapeScriptPath(p);
//   }

//   private executeWin() {
//     const ps = new Shell({
//       executionPolicy: 'Bypass',
//       noProfile: true,
//     });
//     const cwd = `""${this.opt.cwd}""`;
//     const cmd = `""${this.opt.cmd || 'start cmd'}""`;
//     const path = this.getPath();
//     ps.addCommand(`Start-Process -FilePath ${path} "${cwd} ${cmd}"`);
//     return ps
//       .invoke()
//       .then(() => {})
//       .finally(() => ps.dispose());
//   }

//   execute() {
//     if (process.platform === 'win32') {
//       return this.executeWin();
//     } else {
//       return new Promise<void>((resolve, reject) => {
//         exec(this.buildCommand(this.getPath()), (err) => {
//           if (!err) {
//             return resolve();
//           } else {
//             return reject(err);
//           }
//         });
//       });
//     }
//   }
// }
