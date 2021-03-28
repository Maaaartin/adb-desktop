# ADB Desktop

ADB Desktop is a GUI tool for [ADB](https://developer.android.com/studio/command-line/adb).

## Requirements

- Android platform tools downloaded
- telnet enabled on the machine

## Installation

### Windows

Run `Setup.exe` file or copy content of `win-unpacked` folder to the root drive.

### Linux

Move the `*.AppImage` file or `linux-unpacked` folder to the destination and grand the app permission by right clicking and going to `Properties -> Permissions -> Allow executing file as program` .

### Mac

Move the `*.dmg` file to `Applications` folder, start the application and if needed, grand ADB Desktop permission by going to `System Preferences -> Privacy and Security` and click the lock icon.

## Description

ADB Desktop needs to be specified an absolute path to the ADB binary. To do so go so `Settings` tab and locate the file. Settings save automatically when closed.

Application provides UI for ADB, ADB shell and Emulator console.

See links:

- [ADB](https://developer.android.com/studio/command-line/adb)
- [Emulator console](https://developer.android.com/studio/run/emulator-console)
- [adb-ts](https://www.npmjs.com/package/adb-ts)
- [emulator-ts](https://www.npmjs.com/package/emulator-ts)
