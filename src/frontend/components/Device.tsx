import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
} from '@material-ui/core';
import AdbDevice from 'adb-ts/lib/device';
import { Dictionary } from 'lodash';
import React, { useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaMobileAlt, FaRobot, FaTerminal } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import {
  getBattery,
  getFeatures,
  getPackages,
  getProps,
  getSettingsGlobal,
  getSettingsSecure,
  getSettingsSystem,
} from '../ipc';
import { Tab, tabAdd, tabDel } from '../redux/actions';
import CollapseButton from './CollapseButton';
import DeviceConsole from './consoles/DeviceConsole';
import EmulatorConsole from './consoles/EmulatorConsole';
import MonkeyConsole from './consoles/MonkeyConsole';
import DeviceItem from './DeviceItem';
import IconBtn from './IconBtn';

type Props = { device: AdbDevice };

const Device = (props: Props) => {
  const [open, setOpen] = useState(false);
  const {
    tabAdd,
    device: { id, state, model, transport },
  } = props as PropsRedux;
  const isEmulator = state === 'emulator';
  return (
    <Card style={{ backgroundColor: '#dddd' }} className="w-full mb-1">
      <CardHeader title={id} />
      <CardContent>
        <Row>
          <Col sm={6}>
            <ul>
              <li>ID: {id}</li>
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
                      id,
                      (
                        <DeviceConsole
                          onExit={() => tabDel(tab.getId())}
                          id={id}
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
                      id,
                      (
                        <MonkeyConsole
                          onExit={() => tabDel(tab.getId())}
                          id={id}
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
                        id,
                        (
                          <EmulatorConsole
                            onExit={() => tabDel(tab.getId())}
                            id={id}
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
          </Col>
        </Row>
      </CardContent>
      <CollapseButton onClick={() => setOpen(!open)} open={open} />

      <Divider />
      <Collapse in={open}>
        <DeviceItem
          serial={id}
          tag="Battery"
          getter={(cb) => {
            getBattery(id, (err, output: Dictionary<any>) => {
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
          serial={id}
          tag="Properties"
          getter={(cb) => {
            getProps(id, (err, output: Dictionary<any>) => {
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

        <DeviceItem tag="Settings" serial={id}>
          <DeviceItem
            serial={id}
            tag="Global"
            style={{ marginLeft: '5px' }}
            getter={(cb) => {
              getSettingsGlobal(id, (err, output: Dictionary<any>) => {
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
            serial={id}
            style={{ marginLeft: '5px' }}
            tag="System"
            getter={(cb) => {
              getSettingsSystem(id, (err, output: Dictionary<any>) => {
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
            serial={id}
            style={{ marginLeft: '5px' }}
            tag="Secure"
            getter={(cb) => {
              getSettingsSecure(id, (err, output: Dictionary<any>) => {
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
        </DeviceItem>
        <DeviceItem
          serial={id}
          tag="Features"
          getter={(cb) => {
            getFeatures(id, (err, output: Dictionary<any>) => {
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
          serial={id}
          tag="Packages"
          getter={(cb: (output: Dictionary<string>) => void) => {
            getPackages(id, (err, output) => {
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
