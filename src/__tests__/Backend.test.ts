import Preferences from '../backend/Preferences';
import {
  escapeCwd,
  escapeCmd,
  escapeScriptPath,
  getScriptName,
} from '../backend/execute';

describe('escapeCwd', () => {
  it('win32', () => {
    const exp = '""cwd""';
    const result = escapeCwd({ cwd: 'cwd', platform: 'win32' });

    expect(exp).toBe(result);
  });

  it('linux', () => {
    const exp = '"./cwd"';
    const result = escapeCwd({
      cwd: 'cwd',
      platform: 'linux',
      separator: './',
    });

    expect(exp).toBe(result);
  });

  it('darwin', () => {
    const exp = '"./cwd"';
    const result = escapeCwd({
      cwd: 'cwd',
      platform: 'darwin',
      separator: './',
    });

    expect(exp).toBe(result);
  });
});

describe('escapeCmd', () => {
  it('win32 - with value', () => {
    const exp = '""cmd""';
    const result = escapeCmd({ cmd: 'cmd', platform: 'win32' });

    expect(exp).toBe(result);
  });

  it('win32 - without value', () => {
    const exp = '""start cmd""';
    const result = escapeCmd({ cmd: '', platform: 'win32' });

    expect(exp).toBe(result);
  });

  it('linux', () => {
    const exp = '"./cmd"';
    const result = escapeCmd({ cmd: 'cmd', prefix: './', platform: 'linux' });

    expect(exp).toBe(result);
  });

  it('darwin', () => {
    const exp = '"./cmd"';
    const result = escapeCmd({ cmd: 'cmd', prefix: './', platform: 'darwin' });

    expect(exp).toBe(result);
  });
});

describe('escapeScriptPath', () => {
  it('win32', () => {
    const exp = 'path';
    const result = escapeScriptPath('path', 'win32');

    expect(exp).toBe(result);
  });

  it('linux', () => {
    const exp = 'sh path';
    const result = escapeScriptPath('path', 'linux');

    expect(exp).toBe(result);
  });

  it('darwin', () => {
    const exp = 'sh path';
    const result = escapeScriptPath('path', 'darwin');

    expect(exp).toBe(result);
  });
});

describe('getScriptName', () => {
  it('win32', () => {
    const exp = 'script.bat';
    const result = getScriptName('win32');

    expect(exp).toBe(result);
  });

  it('linux', () => {
    const exp = 'script.sh';
    const result = getScriptName('linux');

    expect(exp).toBe(result);
  });

  it('darwin', () => {
    const exp = 'script.sh';
    const result = getScriptName('darwin');

    expect(exp).toBe(result);
  });
});

describe('preferences', () => {
  it('preferences', async () => {
    await Preferences.save('key', { one: { two: 'text' } });
    await Preferences.save('key', { one: 'text' });
    const result = Preferences.get('key');
    expect(result).toStrictEqual({ one: 'text' });
  });
});
