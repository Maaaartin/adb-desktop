import { clone } from 'lodash';
import { stringToType } from 'adb-ts';
import fs from 'fs';
import Path from 'path';
import getAppDataPath from 'appdata-path';

function getAppData(path: string) {
  switch (process.platform) {
    // needs to use data folder on mac
    case 'darwin':
      return Path.join(process.env.HOME || '', 'data', path);
    default:
      return getAppDataPath(path);
  }
}

// TODO test path on mac
function getPreferences(path: string) {
  let preferences: Record<string, any>;
  try {
    preferences = JSON.parse(fs.readFileSync(path).toString());
  } catch (e) {
    fs.mkdirSync(getAppData('AdbDesktop'));
    preferences = {};
  }
  return preferences;
}

export default class Preferences {
  private static path = Path.join(getAppData('AdbDesktop'), 'settings.json');
  private static preferences = getPreferences(Preferences.path);

  static get(key: string): Record<string, any> {
    const value = clone(Preferences.preferences[key]) || {};
    for (const item of Object.entries<any>(value)) {
      value[item[0]] = stringToType(item[1]);
    }
    return value;
  }

  static save(key: string, data: Record<string, any>) {
    Preferences.preferences[key] = Preferences.preferences[key] || clone(data);
    Preferences.preferences[key] = {
      ...Preferences.preferences[key],
      ...data,
    };
    fs.writeFile(
      Preferences.path,
      JSON.stringify(Preferences.preferences, null, 3.5),
      () => null
    );
  }
}
