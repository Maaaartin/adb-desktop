import Path from 'path';
import { clone } from 'lodash';
import fs from 'fs';
import getAppDataPath from 'appdata-path';
import { isTest } from '../shared';

function getAppData(path: string) {
  switch (process.platform) {
    // needs to use data folder on mac
    case 'darwin':
      return Path.join(process.env.HOME || '', 'data', path);
    default:
      return getAppDataPath(path);
  }
}

function readPreferences(path: string) {
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
  private static preferences = isTest ? {} : readPreferences(Preferences.path);

  static get(key: string): Record<string, any> {
    return clone(Preferences.preferences[key]) || {};
  }

  static save(key: string, data: Record<string, any>) {
    Preferences.preferences[key] = Preferences.preferences[key] || clone(data);
    Preferences.preferences[key] = {
      ...Preferences.preferences[key],
      ...data,
    };
    if (isTest) {
      return Promise.resolve();
    } else {
      return fs.promises.writeFile(
        Preferences.path,
        JSON.stringify(Preferences.preferences, null, '\t')
      );
    }
  }
}
