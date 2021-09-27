# ADB Desktop

GUI tool for Android debugging bridge.

Developed and tested with Android Debug Bridge version 1.0.41
Version 29.0.5-5949299.

## Development

### Requirements

* Android platform tools downloaded
* telnet enabled on the machine
* Node >=14.\*

### Scripts

Install dependencies

```bash
yarn install
```

Start

```bash
yarn start
```

Package

```bash
yarn package
```

ADB Desktop is a GUI tool for [ADB](https://developer.android.com/studio/command-line/adb).

## Release

### Requirements

* Android platform tools downloaded
* telnet enabled on the machine

### Installation

#### Windows

Run `Setup.exe` file or copy content of `win-unpacked` folder to the root drive.

#### Linux

Move the `*.AppImage` file or `linux-unpacked` folder to the destination and grand the app permission by right clicking and going to `Properties -> Permissions -> Allow executing file as program` .

#### Mac

Move the `*.dmg` file to `Applications` folder, start the application and if needed, grand ADB Desktop permission by going to `System Preferences -> Privacy and Security` and click the lock icon.

### Description

ADB Desktop needs to be specified an absolute path to the ADB binary. To do so go so `Settings` tab and locate the file. Settings save automatically when closed.

Application provides UI for ADB, ADB shell and Emulator console.

#### Manage ADB Devices

ADB Desktop show connected ADB devices and their state. In `Devices` view you can see device details, such as properties, settings ect.

![ADB Devices](https://github.com/Maaaartin/adb-desktop/blob/master/docs/devices.PNG?raw=true "ADB Devices")

#### Change device settings and properties

You can edit settings and properties of the device by clicking `Open in new tab` in `Devices` view.

![ADB Devices](https://github.com/Maaaartin/adb-desktop/blob/master/docs/edit.PNG?raw=true "ADB Devices")

#### Android file system

Access file system of the device by clicking `File system` icon in `Devices` view. File system view enables the user to read the file system, move, copy or create files/ folders on the device.

![ADB Devices](https://github.com/Maaaartin/adb-desktop/blob/master/docs/fs.PNG?raw=true "ADB Devices")

#### Consoles

ADB desktop provides build in consoles for ADB, ADB shell, ADB monkey and Emulator consoles. Choice of these consoles in available in the left pane view or `Devices` view. 

![ADB Devices](https://github.com/Maaaartin/adb-desktop/blob/master/docs/consoles.PNG?raw=true "ADB Devices")

You can also open native command line by clicking `Open dedicated console` in left top corner of the console view.

![ADB Devices](https://github.com/Maaaartin/adb-desktop/blob/master/docs/console.PNG?raw=true "ADB Devices")

For documentation for consoles see links:

* [ADB](https://developer.android.com/studio/command-line/adb)
* [Emulator console](https://developer.android.com/studio/run/emulator-console)
* [adb-ts](https://www.npmjs.com/package/adb-ts)
* [emulator-ts](https://www.npmjs.com/package/emulator-ts)

#### ADB Desktop settings

In `Settings` view you can edit settings for ADB environment and basic console settings.
