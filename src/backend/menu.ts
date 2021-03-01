import { AdbClientOptions } from 'adb-ts';
import AdbDevice from 'adb-ts/lib/device';
import {
  app,
  BrowserWindow,
  ipcMain as ipc, Menu,
  MenuItemConstructorOptions, shell
} from 'electron';
import { EXEC_ADB, GET_BATTERY, EXEC_DEVICE, EXEC_EMULATOR, EXEC_MONKEY, OPEN_ADB, OPEN_ADB_SHELL, OPEN_EMULATOR, SAVE_HISTORY, GET_PROPS, GET_SETTINGS, GET_FEATURES, GET_PACKAGES, GET_SETTINGS_GLOBAL, GET_SETTINGS_SECURE, GET_SETTINGS_SYSTEM, TOGGLE_ADB } from '../constants';
import { ADB_SETTINGS_LOAD, ADB_SETTINGS_WRITE, DEVICE_CHANGE, LOAD_HISTORY, LOAD_TOKEN, WRITE_TOKEN, ADB_STATUS, WRITE_CONSOLE_SETTINGS, LOAD_CONSOLE_SETTINGS } from '../frontend/redux/actionTypes';
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

    this.hookGet();
    this.hookWindow();
    this.hookActions();
    this.hookExec();
    this.hookAdbHandler();
  }

  private hookWindow() {
    this.mainWindow.once('show', () => {
      // const dev1: AdbDevice = {
      //   id: 'one',
      //   state: 'device',
      //   transport: 'usb'
      // }
      // const dev2: AdbDevice = {
      //   id: 'twho',
      //   state: 'device',
      //   transport: 'usb'
      // }
      // const dev3: AdbDevice = {
      //   id: 'three',
      //   state: 'device',
      //   transport: 'usb'
      // }
      // const dev4: AdbDevice = {
      //   id: 'foud',
      //   state: 'device',
      //   transport: 'usb'
      // }
      // this.send(DEVICE_CHANGE, { id: dev1.id, data: dev1 });
      // this.send(DEVICE_CHANGE, { id: dev2.id, data: dev2 });
      // this.send(DEVICE_CHANGE, { id: dev3.id, data: dev3 });
      // this.send(DEVICE_CHANGE, { id: dev4.id, data: dev4 });

      const options = this.adbHandler.getAdbOptions();
      this.adbHandler.start(options);
      this.send(ADB_SETTINGS_LOAD, options);

      const history = Object.values(Preferences.get('history'));
      this.send(LOAD_HISTORY, history);

      this.emulatorHandler.getToken((token) => {
        this.send(LOAD_TOKEN, token);
      });

      const consoleSett = Preferences.get('console');
      this.send(LOAD_CONSOLE_SETTINGS, consoleSett);
    });
  }

  private hookAdbHandler() {
    this.adbHandler.on('add', (device) => {
      this.send(DEVICE_CHANGE, { id: device.id, data: device });
    });

    this.adbHandler.on('change', (device) => {
      this.send(DEVICE_CHANGE, { id: device.id, data: device });
    });

    this.adbHandler.on('remove', (device) => {
      this.send(DEVICE_CHANGE, { id: device.id });
    });

    this.adbHandler.on('starting', () => {
      this.send(ADB_STATUS, {
        running: true,
        error: null,
        status: 'starting'
      });
    });

    this.adbHandler.on('start', () => {
      this.send(ADB_STATUS, {
        running: true,
        error: null,
        status: 'running'
      });
    });

    this.adbHandler.on('stopped', () => {
      this.send(ADB_STATUS, {
        running: false,
        error: null,
        status: 'stopped'
      });
    });

    this.adbHandler.on('error', (err) => {
      this.send(ADB_STATUS, {
        running: false,
        error: err,
        status: 'error'
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
      OpenShell.adb();
    });

    ipc.on(OPEN_ADB_SHELL, (event, data) => {
      OpenShell.adbShell(data);
    });

    ipc.on(OPEN_EMULATOR, (event, data) => {
      OpenShell.emulator(data);
    });

    ipc.on(SAVE_HISTORY, (event, data) => {
      Preferences.save('history', data);
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

    ipc.on(TOGGLE_ADB, () => {
      const running = this.adbHandler.running;
      if (running) {
        this.adbHandler.stop();
      }
      else {
        this.adbHandler.start();
      }
    });
  }

  private hookGet() {
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
        client.listSettings(serial, 'system')
      ])
        .then((res) => {
          this.send(GET_SETTINGS, {
            id, output: {
              global: res[0],
              secure: res[1],
              system: res[2]
            }
          });
        })
        .catch((error) => {
          this.send(GET_SETTINGS, { id, output: {}, error });
        });
    });

    ipc.on(GET_SETTINGS_GLOBAL, (event, data) => {
      const { serial, id } = data;
      this.adbHandler.getClient().listSettings(serial, 'global', (error, value) => {
        this.send(GET_SETTINGS_GLOBAL, { id, output: value || {}, error });
      });
    });

    ipc.on(GET_SETTINGS_SECURE, (event, data) => {
      const { serial, id } = data;
      this.adbHandler.getClient().listSettings(serial, 'secure', (error, value) => {
        this.send(GET_SETTINGS_SECURE, { id, output: value || {}, error });
      });
    });

    ipc.on(GET_SETTINGS_SYSTEM, (event, data) => {
      const { serial, id } = data;
      this.adbHandler.getClient().listSettings(serial, 'system', (error, value) => {
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
  }

  private send(message: string, data?: any) {
    this.mainWindow.webContents.send(message, data);
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
      label: 'Electron',
      submenu: [
        {
          label: 'About ElectronReact',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide ElectronReact',
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
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/master/docs#readme'
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues');
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
            label: 'Learn More',
            click() {
              shell.openExternal('https://electronjs.org');
            },
          },
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/electron/electron/tree/master/docs#readme'
              );
            },
          },
          {
            label: 'Community Discussions',
            click() {
              shell.openExternal('https://www.electronjs.org/community');
            },
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/electron/electron/issues');
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
