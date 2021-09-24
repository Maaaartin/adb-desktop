import Executor from '../backend/Executor';
import Path from 'path';
import Preferences from '../backend/Preferences';

describe('executor', () => {
  it('executor darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    // Needs to mock sep property
    Object.defineProperty(Path, 'sep', { value: '/' });
    const scriptPath = new Executor({ cmd: 'cmd', cwd: 'cwd' }).buildCommand(
      'path'
    );

    expect(scriptPath).toBe('path "/cwd" "cmd"');
  });

  it('executor win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    Object.defineProperty(Path, 'sep', { value: '\\' });
    const scriptPath = new Executor({ cmd: 'cmd', cwd: 'cwd' }).buildCommand(
      'path'
    );

    expect(scriptPath).toBe('path "cwd" "cmd"');
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
