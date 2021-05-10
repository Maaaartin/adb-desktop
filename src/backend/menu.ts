import { AdbClientOptions } from 'adb-ts';
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain as ipc,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from 'electron';
import { EmulatorClient } from 'emulator-ts';
import open from 'open';
import Path from 'path';
import {
  DELETE_FILE,
  DISPLAY_ERROR,
  EXEC_ADB,
  EXEC_DEVICE,
  EXEC_EMULATOR,
  EXEC_MONKEY,
  GET_BATTERY,
  GET_DIR,
  GET_FEATURES,
  GET_PACKAGES,
  GET_PROP,
  GET_PROPS,
  GET_SETTINGS,
  GET_SETTINGS_GLOBAL,
  GET_SETTINGS_SECURE,
  GET_SETTINGS_SYSTEM,
  GET_SETTING_GLOBAL,
  GET_SETTING_SECURE,
  GET_SETTING_SYSTEM,
  MKDIR,
  OPEN_ADB,
  OPEN_ADB_SHELL,
  OPEN_EMULATOR,
  OPEN_LINK,
  PULL_FILE,
  PUT_SETTING_GLOBAL,
  PUT_SETTING_SECURE,
  PUT_SETTING_SYSTEM,
  RENEW_TOKEN,
  SET_PROP,
  TOGGLE_ADB,
} from '../constants';
import {
  ADB_SETTINGS_LOAD,
  ADB_SETTINGS_WRITE,
  ADB_STATUS,
  DEVICE_ADD,
  DEVICE_CHANGE,
  DEVICE_REMOVE,
  LOAD_CONSOLE_SETTINGS,
  LOAD_TOKEN,
  WRITE_CONSOLE_SETTINGS,
  WRITE_TOKEN,
} from '../frontend/redux/actionTypes';
import { DOCS_LINK, ISSUES_LINK } from '../links';
import AdbHandler from './adb';
import EmulatorHandler from './emulator';
import OpenShell from './OpenShell';
import Preferences from './Preferences';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;
  adbHandler: AdbHandler;
  emulatorHandler: EmulatorHandler;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.adbHandler = new AdbHandler();
    this.emulatorHandler = new EmulatorHandler();
    this.hook();
  }

  private hook() {
    this.hookGetters();
    this.hookWindow();
    this.hookActions();
    this.hookExec();
    this.hookAdbHandler();
    this.hookSetters();
    this.hookSends();
    this.hookFileSystem();
  }

  destroy() {
    this.adbHandler.stop();
    ipc.removeAllListeners();
  }

  private hookFileSystem() {
    ipc.on(PULL_FILE, (event, data) => {
      const { id, serial, srcPath } = data;
      dialog
        .showOpenDialog(this.mainWindow, { properties: ['openDirectory'] })
        .then((value) => {
          const splitPath = srcPath.split('/');
          const filePath = splitPath[splitPath.length - 1];
          const destPath = Path.join(value.filePaths[0], filePath);
          this.adbHandler
            .getClient()
            .pullFile(serial, srcPath, destPath, (error) => {
              if (error) {
                this.send(PULL_FILE, { id, error });
              } else {
                this.send(PULL_FILE, { id, destPath });
              }
            });
        });
    });

    ipc.on(DELETE_FILE, (event, data) => {
      const { id, serial, path } = data;
      this.adbHandler
        .getClient()
        .shell(serial, `rm -r ${path}`, (error, output) => {
          if (error) {
            this.send(DELETE_FILE, { id, error });
          } else if (output) {
            this.send(DELETE_FILE, { id, error: new Error(`${output}`) });
          } else {
            this.send(DELETE_FILE, { id, path });
          }
        });
    });

    ipc.on(MKDIR, (event, data) => {
      const { id, serial, path } = data;
      this.adbHandler.getClient().mkdir(serial, path, (error, output) => {
        if (error) {
          this.send(MKDIR, { id, error });
        } else if (output) {
          this.send(MKDIR, { id, error: new Error(`${output}`) });
        } else {
          this.send(MKDIR, { id, path });
        }
      });
    });
  }

  private hookWindow() {
    this.mainWindow.once('show', () => {
      const options = this.adbHandler.getAdbOptions();
      this.adbHandler.start(options);
      this.send(ADB_SETTINGS_LOAD, options);

      this.emulatorHandler.getToken((token) => {
        this.send(LOAD_TOKEN, token);
      });

      const consoleSett = Preferences.get('console');
      this.send(LOAD_CONSOLE_SETTINGS, consoleSett);
    });
  }

  private hookAdbHandler() {
    this.adbHandler.on('add', (device) => {
      this.send(DEVICE_ADD, device);
    });

    this.adbHandler.on('change', (device) => {
      this.send(DEVICE_CHANGE, device);
    });

    this.adbHandler.on('remove', (device) => {
      this.send(DEVICE_REMOVE, device);
    });

    this.adbHandler.on('starting', () => {
      this.send(ADB_STATUS, {
        running: true,
        error: null,
        status: 'starting',
      });
    });

    this.adbHandler.on('start', () => {
      this.send(ADB_STATUS, {
        running: true,
        error: null,
        status: 'running',
      });
    });

    this.adbHandler.on('stopped', () => {
      this.send(ADB_STATUS, {
        running: false,
        error: null,
        status: 'stopped',
      });
    });

    this.adbHandler.on('error', (err) => {
      this.send(ADB_STATUS, {
        running: false,
        error: err,
        status: 'error',
      });
    });
  }

  private hookExec() {
    ipc.on(EXEC_MONKEY, (event, data) => {
      const { serial, cmd, id } = data;
      this.adbHandler.getMonkey(serial, (error, monkey) => {
        if (error) this.send(EXEC_MONKEY, { id, error });
        else {
          monkey.send(cmd, (error, value) => {
            if (error) this.send(EXEC_MONKEY, { id, error });
            else this.send(EXEC_MONKEY, { id, output: value || '' });
          });
        }
      });
    });

    ipc.on(EXEC_DEVICE, (event, data) => {
      const { serial, cmd, id } = data;
      this.adbHandler.getClient().execDevice(serial, cmd, (error, value) => {
        if (error) this.send(EXEC_DEVICE, { id, error });
        else this.send(EXEC_DEVICE, { id, output: value.trim() });
      });
    });

    ipc.on(EXEC_ADB, (event, data) => {
      const { cmd, id } = data;
      this.adbHandler.getClient().exec(cmd, (error, value) => {
        if (error) this.send(EXEC_ADB, { id, error });
        else this.send(EXEC_ADB, { id, output: value.trim() });
      });
    });

    ipc.on(EXEC_EMULATOR, (event, data) => {
      const { cmd, id, serial } = data;
      this.emulatorHandler.exec(serial, cmd, (error, output) => {
        if (error) this.send(EXEC_EMULATOR, { id, error });
        this.send(EXEC_EMULATOR, { id, output });
      });
    });
  }

  private hookActions() {
    ipc.on(OPEN_ADB, () => {
      OpenShell.adb().catch((err) => this.send(DISPLAY_ERROR, err));
    });

    ipc.on(OPEN_ADB_SHELL, (event, data) => {
      OpenShell.adbShell(data).catch((err) => this.send(DISPLAY_ERROR, err));
    });

    ipc.on(OPEN_EMULATOR, (event, data) => {
      OpenShell.emulator(data).catch((err) => this.send(DISPLAY_ERROR, err));
    });

    ipc.on(WRITE_TOKEN, (event, data) => {
      this.emulatorHandler.setToken(data);
    });

    ipc.on(ADB_SETTINGS_WRITE, (event, data: AdbClientOptions) => {
      this.adbHandler.start(data);
    });

    ipc.on(WRITE_CONSOLE_SETTINGS, (event, data) => {
      Preferences.save('console', data);
    });
  }

  private hookGetters() {
    ipc.on(GET_DIR, (event, data) => {
      const { id, serial, path } = data;
      this.adbHandler
        .getFiles(serial, path)
        .then((output) => {
          this.send(GET_DIR, { id, output });
        })
        .catch((error) => {
          this.send(GET_DIR, { id, error });
        });
    });

    ipc.on(GET_BATTERY, (event, data) => {
      const { serial, id } = data;
      this.adbHandler.getClient().batteryStatus(serial, (error, value) => {
        this.send(GET_BATTERY, { id, output: value || {}, error });
      });
    });

    ipc.on(GET_PROPS, (event, data) => {
      const { serial, id } = data;
      this.adbHandler.getClient().listProperties(serial, (error, value) => {
        this.send(GET_BATTERY, { id, output: value || {}, error });
      });
    });

    ipc.on(GET_SETTINGS, (event, data) => {
      const { serial, id } = data;
      const client = this.adbHandler.getClient();
      Promise.all([
        client.listSettings(serial, 'global'),
        client.listSettings(serial, 'secure'),
        client.listSettings(serial, 'system'),
      ])
        .then((res) => {
          this.send(GET_SETTINGS, {
            id,
            output: {
              global: res[0],
              secure: res[1],
              system: res[2],
            },
          });
        })
        .catch((error) => {
          this.send(GET_SETTINGS, { id, output: {}, error });
        });
    });

    ipc.on(GET_SETTINGS_GLOBAL, (event, data) => {
      const { serial, id } = data;
      this.adbHandler
        .getClient()
        .listSettings(serial, 'global', (error, value) => {
          this.send(GET_SETTINGS_GLOBAL, { id, output: value || {}, error });
        });
    });

    ipc.on(GET_SETTINGS_SECURE, (event, data) => {
      const { serial, id } = data;
      this.adbHandler
        .getClient()
        .listSettings(serial, 'secure', (error, value) => {
          this.send(GET_SETTINGS_SECURE, { id, output: value || {}, error });
        });
    });

    ipc.on(GET_SETTINGS_SYSTEM, (event, data) => {
      const { serial, id } = data;
      this.adbHandler
        .getClient()
        .listSettings(serial, 'system', (error, value) => {
          this.send(GET_SETTINGS_SYSTEM, { id, output: value || {}, error });
        });
    });

    ipc.on(GET_FEATURES, (event, data) => {
      const { serial, id } = data;
      this.adbHandler.getClient().listFeatures(serial, (error, value) => {
        this.send(GET_FEATURES, { id, output: value || {}, error });
      });
    });

    ipc.on(GET_PACKAGES, (event, data) => {
      const { serial, id } = data;
      this.adbHandler.getClient().listPackages(serial, (error, value) => {
        this.send(GET_PACKAGES, { id, output: value || [], error });
      });
    });

    ipc.on(GET_SETTING_GLOBAL, (event, data) => {
      const { serial, id, key } = data;
      this.adbHandler
        .getClient()
        .getSetting(serial, 'global', key, (error, value) => {
          this.send(GET_SETTING_GLOBAL, {
            id,
            output: value,
            error,
          });
        });
    });

    ipc.on(GET_SETTING_SECURE, (event, data) => {
      const { serial, id, key } = data;
      this.adbHandler
        .getClient()
        .getSetting(serial, 'secure', key, (error, value) => {
          this.send(GET_SETTING_SECURE, {
            id,
            output: value,
            error,
          });
        });
    });

    ipc.on(GET_SETTING_SYSTEM, (event, data) => {
      const { serial, id, key } = data;
      this.adbHandler
        .getClient()
        .getSetting(serial, 'system', key, (error, value) => {
          this.send(GET_SETTING_SYSTEM, {
            id,
            output: value,
            error,
          });
        });
    });

    ipc.on(GET_PROP, (event, data) => {
      const { serial, id, key } = data;
      this.adbHandler.getClient().getProp(serial, key, (error, value) => {
        this.send(GET_PROP, {
          id,
          output: value,
          error,
        });
      });
    });
  }

  private hookSetters() {
    ipc.on(SET_PROP, (event, data) => {
      const { serial, id, key, value } = data;
      this.adbHandler.getClient().setProp(serial, key, value, (error) => {
        this.send(SET_PROP, { error, id });
      });
    });

    ipc.on(PUT_SETTING_GLOBAL, (event, data) => {
      const { serial, id, key, value } = data;
      this.adbHandler
        .getClient()
        .putSetting(serial, 'global', key, value, (error) => {
          this.send(PUT_SETTING_GLOBAL, { error, id });
        });
    });

    ipc.on(PUT_SETTING_SECURE, (event, data) => {
      const { serial, id, key, value } = data;
      this.adbHandler
        .getClient()
        .putSetting(serial, 'secure', key, value, (error) => {
          this.send(PUT_SETTING_SECURE, { error, id });
        });
    });

    ipc.on(PUT_SETTING_SYSTEM, (event, data) => {
      const { serial, id, key, value } = data;
      this.adbHandler
        .getClient()
        .putSetting(serial, 'system', key, value, (error) => {
          this.send(PUT_SETTING_SYSTEM, { error, id });
        });
    });
  }

  private send(message: string, data?: any) {
    // object might have been destroyed
    try {
      this.mainWindow.webContents.send(message, data);
    } catch (e) {}
  }

  private hookSends() {
    ipc.on(OPEN_LINK, (ever, link) => {
      open(link);
    });

    ipc.on(TOGGLE_ADB, () => {
      const running = this.adbHandler.running;
      if (running) {
        this.adbHandler.stop();
      } else {
        this.adbHandler.start();
      }
    });

    ipc.on(RENEW_TOKEN, () => {
      EmulatorClient.readToken((err, token) => {
        if (!err) {
          this.emulatorHandler.setToken(token);
          this.send(LOAD_TOKEN, token);
        }
      });
    });
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'AdbDesktop',
      submenu: [
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide ADB Desktop',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click() {
            shell.openExternal(DOCS_LINK);
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal(ISSUES_LINK);
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  },
                },
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  },
                },
              ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click() {
              shell.openExternal(DOCS_LINK);
            },
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal(ISSUES_LINK);
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
