import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
} from '@material-ui/core';
import { IAdbDevice } from 'adb-ts';
import { Dictionary } from 'lodash';
import React, { useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaFolder, FaMobileAlt, FaRobot, FaTerminal } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import {
  getBattery,
  getFeatures,
  getPackages,
  getProp,
  getProps,
  getSettingGlobal,
  getSettingSecure,
  getSettingsGlobal,
  getSettingsSecure,
  getSettingsSystem,
  getSettingSystem,
} from '../ipc/getters';
import {
  putSettingGlobal,
  putSettingSecure,
  putSettingSystem,
  setProp,
} from '../ipc/setters';
import { Tab, tabAdd, tabDel } from '../redux/actions';
import CollapseButton from './subcomponents/CollapseButton';
import DeviceConsole from './consoles/DeviceConsole';
import EmulatorConsole from './consoles/EmulatorConsole';
import MonkeyConsole from './consoles/MonkeyConsole';
import DeviceItem from './DeviceItem';
import FileSystem from './FileSystem';
import IconBtn from './subcomponents/IconBtn';
import { getColor } from '../colors';

type Props = { device: IAdbDevice };

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
            getBattery(serial, (err, output: Dictionary<any>) => {
              cb(output);
            });
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
            getProps(serial, (err, output: Dictionary<any>) => {
              cb(output);
            });
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
              getSettingsGlobal(serial, (err, output: Dictionary<any>) => {
                cb(output);
              });
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
              getSettingsSystem(serial, (err, output: Dictionary<any>) => {
                cb(output);
              });
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
              getSettingsSecure(serial, (err, output: Dictionary<any>) => {
                cb(output);
              });
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
            getFeatures(serial, (err, output: Dictionary<any>) => {
              cb(output);
            });
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
            getPackages(serial, (err, output) => {
              const map: Dictionary<string> = {};
              Object.assign(map, [...output]);
              cb(map);
            });
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
