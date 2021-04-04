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

``` bash
yarn install
```

Start

``` bash
yarn start
```

Package

``` bash
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

See links:

* [ADB](https://developer.android.com/studio/command-line/adb)
* [Emulator console](https://developer.android.com/studio/run/emulator-console)
* [adb-ts](https://www.npmjs.com/package/adb-ts)
* [emulator-ts](https://www.npmjs.com/package/emulator-ts)
