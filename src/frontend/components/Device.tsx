import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
} from '@material-ui/core';
import { Col, Row } from 'react-flexbox-grid';
import { ConnectedProps, connect } from 'react-redux';
import { Dictionary, noop } from 'lodash';
import { FaFolder, FaMobileAlt, FaRobot, FaTerminal } from 'react-icons/fa';
import React, { useState } from 'react';
import { Tab, tabAdd, tabDel } from '../redux/actions';
import {
  getBattery,
  getFeatures,
  getPackages,
  getProp,
  getProps,
  getSettingGlobal,
  getSettingSecure,
  getSettingSystem,
  getSettingsGlobal,
  getSettingsSecure,
  getSettingsSystem,
} from '../ipc/getters';
import {
  putSettingGlobal,
  putSettingSecure,
  putSettingSystem,
  setProp,
} from '../ipc/setters';

import CollapseButton from './subcomponents/CollapseButton';
import DeviceConsole from './consoles/DeviceConsole';
import DeviceItem from './DeviceItem';
import EmulatorConsole from './consoles/EmulatorConsole';
import FileSystem from './FileSystem';
import { IAdbDevice } from 'adb-ts';
import IconBtn from './subcomponents/IconBtn';
import MonkeyConsole from './consoles/MonkeyConsole';
import { getColor } from '../colors';
import { typedIpcRenderer as ipc } from '../../ipcIndex';

type Props = { device: IAdbDevice };
// TODO ipc display errors
const Device = (props: Props) => {
  const [open, setOpen] = useState(false);
  const {
    tabAdd,
    device: { id: serial, state, model, transport },
  } = props as PropsRedux;
  const isEmulator = state === 'emulator';
  return (
    <Card style={{ backgroundColor: getColor('card') }} className="w-full mb-1">
      <CardHeader title={serial} />
      <CardContent>
        <Row>
          <Col sm={6}>
            <ul>
              <li>ID: {serial}</li>
              <li>State: {state}</li>
              <li>Model: {model}</li>
              <li>Transport: {transport}</li>
            </ul>
          </Col>
          <Col sm={6}>
            <Row>
              <Col sm={isEmulator ? 3 : 6}>
                <IconBtn
                  onClick={() => {
                    const tab = new Tab(
                      serial,
                      (
                        <DeviceConsole
                          onExit={() => tabDel(tab.getId())}
                          id={serial}
                        />
                      )
                    );
                    tabAdd(tab);
                  }}
                  IconEl={FaTerminal}
                  tag="Shell console"
                />
              </Col>
              <Col sm={isEmulator ? 3 : 6}>
                <IconBtn
                  onClick={() => {
                    const tab = new Tab(
                      serial,
                      (
                        <MonkeyConsole
                          onExit={() => tabDel(tab.getId())}
                          id={serial}
                        />
                      )
                    );
                    tabAdd(tab);
                  }}
                  IconEl={FaRobot}
                  tag="Monkey console"
                />
              </Col>
              {isEmulator && (
                <Col sm={3}>
                  <IconBtn
                    onClick={() => {
                      const tab = new Tab(
                        serial,
                        (
                          <EmulatorConsole
                            onExit={() => tabDel(tab.getId())}
                            id={serial}
                          />
                        )
                      );
                      tabAdd(tab);
                    }}
                    IconEl={FaMobileAlt}
                    tag="Emulator console"
                  />
                </Col>
              )}
            </Row>
            <Row>
              <IconBtn
                onClick={() =>
                  tabAdd(
                    new Tab(serial, <FileSystem serial={serial}></FileSystem>)
                  )
                }
                IconEl={FaFolder}
                tag="File System"
              />
            </Row>
          </Col>
        </Row>
      </CardContent>
      <CollapseButton onClick={() => setOpen(!open)} open={open} />

      <Divider />
      <Collapse in={open}>
        <DeviceItem
          serial={serial}
          tag="Battery"
          getter={(cb) => {
            ipc.invoke('getBattery', serial).then(({ output }) => {
              if (output) {
                cb(output);
              }
            }, noop);
          }}
          itemMaker={{
            createKey: (item: [string, any]) => item[0],
            createValue: (item: [string, any]) => item[1],
            delimiter: ': ',
            styleValue: true,
          }}
          onSearch={(item, text) => item[0].includes(text)}
          valueToString={(item) => item[0]}
        />
        <DeviceItem
          serial={serial}
          tag="Properties"
          getter={(cb) => {
            ipc.invoke('getProps', serial).then(({ output }) => {
              if (output) {
                cb(output);
              }
            }, noop);
          }}
          itemMaker={{
            createKey: (item: [string, any]) => item[0],
            createValue: (item: [string, any]) => item[1],
            delimiter: ': ',
            styleValue: true,
            itemGetter: (key, cb) => getProp(serial, key, cb),
            itemSetter: (key, value, cb) => setProp(serial, key, value, cb),
          }}
          onSearch={(item, text) => item[0].includes(text)}
          valueToString={(item) => item[0]}
        />

        <DeviceItem tag="Settings" serial={serial}>
          <DeviceItem
            serial={serial}
            tag="Global"
            style={{ marginLeft: '5px' }}
            getter={(cb) => {
              ipc.invoke('getSettingsGlobal', serial).then(({ output }) => {
                if (output) {
                  cb(output);
                }
              }, noop);
            }}
            itemMaker={{
              createKey: (item: [string, any]) => item[0],
              createValue: (item: [string, any]) => item[1],
              delimiter: ': ',
              styleValue: true,
              itemGetter: (key, cb) => getSettingGlobal(serial, key, cb),
              itemSetter: (key, value, cb) =>
                putSettingGlobal(serial, key, value, cb),
            }}
            onSearch={(item, text) => item[0].includes(text)}
            valueToString={(item) => item[0]}
          />
          <DeviceItem
            serial={serial}
            style={{ marginLeft: '5px' }}
            tag="System"
            getter={(cb) => {
              ipc.invoke('getSettingsSystem', serial).then(({ output }) => {
                if (output) {
                  cb(output);
                }
              }, noop);
            }}
            itemMaker={{
              createKey: (item: [string, any]) => item[0],
              createValue: (item: [string, any]) => item[1],
              delimiter: ': ',
              styleValue: true,
              itemGetter: (key, cb) => getSettingSystem(serial, key, cb),
              itemSetter: (key, value, cb) =>
                putSettingSystem(serial, key, value, cb),
            }}
            onSearch={(item, text) => item[0].includes(text)}
            valueToString={(item) => item[0]}
          />
          <DeviceItem
            serial={serial}
            style={{ marginLeft: '5px' }}
            tag="Secure"
            getter={(cb) => {
              ipc.invoke('getSettingsSecure', serial).then(({ output }) => {
                if (output) {
                  cb(output);
                }
              }, noop);
            }}
            itemMaker={{
              createKey: (item: [string, any]) => item[0],
              createValue: (item: [string, any]) => item[1],
              delimiter: ': ',
              styleValue: true,
              itemGetter: (key, cb) => getSettingSecure(serial, key, cb),
              itemSetter: (key, value, cb) =>
                putSettingSecure(serial, key, value, cb),
            }}
            onSearch={(item, text) => item[0].includes(text)}
            valueToString={(item) => item[0]}
          />
        </DeviceItem>
        <DeviceItem
          serial={serial}
          tag="Features"
          getter={(cb) => {
            ipc.invoke('getFeatures', serial).then(({ output }) => {
              if (output) {
                cb(output);
              }
            }, noop);
          }}
          itemMaker={{
            createKey: (item: [string, any]) => item[0],
            createValue: (item: [string, any]) =>
              item[1] !== true ? item[1] : '',
            delimiter: ': ',
            styleValue: true,
          }}
          onSearch={(item, text) => item[0].includes(text)}
          valueToString={(item) => item[0]}
        />
        <DeviceItem
          serial={serial}
          tag="Packages"
          getter={(cb: (output: Dictionary<string>) => void) => {
            ipc.invoke('getPackages', serial).then(({ output }) => {
              if (output) {
                const map: Dictionary<string> = {};
                Object.assign(map, [...output]);
                cb(map);
              }
            }, noop);
          }}
          itemMaker={{
            createValue: (item: [string, any]) => item[1],
          }}
          onSearch={(item, text) => (item[1] as string).includes(text)}
          valueToString={(item) => item[1] as string}
        />
      </Collapse>
    </Card>
  );
};

const mapDispatchToProps = {
  tabAdd,
  tabDel,
};

const connector = connect(null, mapDispatchToProps);

type PropsRedux = Props & ConnectedProps<typeof connector>;

export default connector(Device);
