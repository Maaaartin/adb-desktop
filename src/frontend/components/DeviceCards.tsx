import { Card, CardContent, CardHeader } from '@material-ui/core';
import AdbDevice from 'adb-ts/lib/device';
import { get as getProp } from 'lodash';
import React from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaMobileAlt, FaRobot, FaTerminal } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import { Tab, tabAdd, tabDel } from '../redux/actions';
import DeviceConsole from './consoles/DeviceConsole';
import EmulatorConsole from './consoles/EmulatorConsole';
import MonkeyConsole from './consoles/MonkeyConsole';
import IconBtn from './IconBtn';
import Scrollable from './Scrollable';

const DeviceCards = (props: any) => {
  const { devices, tabAdd, tabDel } = props as PropsRedux;
  return (
    <Scrollable>
      <div className="overflow-y-scroll pr-1">
        {devices.map((device, index) => {
          const { id, state } = device;
          const isEmulator = state === 'emulator';
          return (
            <Card
              key={index}
              style={{
                backgroundColor: '#dddd',
                marginBottom: '5px',
              }}
            >
              <CardHeader title={id} className="break-all" />
              <CardContent>
                {device.state}
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Scrollable>
  );
};

const mapStateToProps = (state: any) => {
  return {
    devices: getProp(state, 'devices.list', []) as AdbDevice[],
  };
};

const mapDispatchToProps = {
  tabAdd,
  tabDel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(DeviceCards);
