import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  app,
  ipcMain as ipc,
  shell,
} from 'electron';
import { DOCS_LINK, ISSUES_LINK } from '../links';

import AdbHandler from './adb';
import { ConsoleSettings } from '../shared';
import EmulatorHandler from './emulator';
import Preferences from './Preferences';
import { allWebContents } from './ipc';
import { thru } from 'lodash';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class Root {
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
    this.mainWindow.once('show', () => {
      const options = this.adbHandler.getAdbOptions();
      this.adbHandler.saveAndStart(options);
      allWebContents((c) => {
        c.send('loadAdbSettings', options);
      });

      this.emulatorHandler.getToken((token) => {
        allWebContents((c) => {
          c.send('loadToken', token);
        });
      });

      const consoleSett = Preferences.get('console');
      allWebContents((c) => {
        c.send('loadConsoleSettings', {
          lines: consoleSett.lines || 20,
          history: consoleSett.history || [],
          historyLen: consoleSett.historyLen || 50,
        });
      });
    });

    this.adbHandler.on('add', (device) => {
      allWebContents((c) => {
        c.send('deviceAdd', device);
      });
    });

    this.adbHandler.on('change', (device) => {
      allWebContents((c) => {
        c.send('deviceChange', device);
      });
    });

    this.adbHandler.on('remove', (device) => {
      allWebContents((c) => {
        c.send('deviceRemove', device);
      });
    });

    this.adbHandler.on('starting', () => {
      allWebContents((c) => {
        c.send('adbStatus', {
          running: false,
          error: null,
          status: 'starting',
        });
      });
    });

    this.adbHandler.on('start', () => {
      allWebContents((c) => {
        c.send('adbStatus', {
          running: true,
          error: null,
          status: 'running',
        });
      });
    });

    this.adbHandler.on('stopped', () => {
      allWebContents((c) => {
        c.send('adbStatus', {
          running: false,
          error: null,
          status: 'stopped',
        });
      });
    });

    this.adbHandler.on('error', (err) => {
      allWebContents((c) => {
        c.send('adbStatus', {
          running: false,
          error: err,
          status: 'error',
        });
      });
    });
  }

  destroy() {
    this.adbHandler.stop();
    ipc.removeAllListeners();
  }

  getConsoleSettings(): ConsoleSettings {
    return thru(Preferences.get('console'), (consoleSett) => ({
      lines: consoleSett.lines || 20,
      history: consoleSett.history || [],
      historyLen: consoleSett.historyLen || 50,
    }));
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
