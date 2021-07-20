import { Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import { Col, Row } from 'react-flexbox-grid';
import { ConnectedProps, connect } from 'react-redux';
import { FaMobileAlt, FaRobot, FaTerminal } from 'react-icons/fa';
import { tabAdd, tabDel } from '../redux/actions';

import DeviceConsole from './consoles/DeviceConsole';
import EmulatorConsole from './consoles/EmulatorConsole';
import { GlobalState } from '../redux/reducers';
import IconBtn from './subcomponents/IconBtn';
import MonkeyConsole from './consoles/MonkeyConsole';
import React from 'react';
import Scroll from './subcomponents/Scrollable';
import { isEmpty as emp } from 'lodash';
import { getColor } from '../colors';

const DeviceCards = (props: PropsRedux) => {
  const { adbRunning, devices, tabAdd, tabDel } = props;
  return (
    <Scroll className="pt-1 pb-1">
      <div className="pr-1" style={{ height: 'calc(77vh - 80px)' }}>
        {!adbRunning ? (
          <Typography className="pl-1">ADB is not running</Typography>
        ) : emp(devices) ? (
          <Typography className="pl-1">No devices connected</Typography>
        ) : (
          devices.map((device, index) => {
            const { id: serial, state } = device;
            const isEmulator = state === 'emulator';
            return (
              <Card
                key={index}
                style={{
                  backgroundColor: getColor('card'),
                  marginBottom: '5px',
                }}
              >
                <CardHeader title={serial} className="break-all" />
                <CardContent>
                  {device.state}
                  <Row>
                    <Col sm={isEmulator ? 3 : 6}>
                      <IconBtn
                        onClick={() => {
                          tabAdd(serial, (id) => (
                            <DeviceConsole
                              onExit={() => tabDel(id)}
                              id={serial}
                            />
                          ));
                        }}
                        IconEl={FaTerminal}
                        tag="Device console"
                      />
                    </Col>
                    <Col sm={isEmulator ? 3 : 6}>
                      <IconBtn
                        onClick={() => {
                          tabAdd(serial, (id) => (
                            <MonkeyConsole
                              onExit={() => tabDel(id)}
                              id={serial}
                            />
                          ));
                        }}
                        IconEl={FaRobot}
                        tag="Monkey console"
                      />
                    </Col>
                    {isEmulator && (
                      <Col sm={3}>
                        <IconBtn
                          onClick={() => {
                            tabAdd(serial, (id) => (
                              <EmulatorConsole
                                onExit={() => tabDel(id)}
                                id={id}
                              />
                            ));
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
          })
        )}
      </div>
    </Scroll>
  );
};

const mapStateToProps = (state: GlobalState) => {
  return {
    devices: state.devices
      .get('list')
      .toArray()
      .map(([_i, value]) => value),
    adbRunning: state.adb.get('status').get('running'),
  };
};

const mapDispatchToProps = {
  tabAdd,
  tabDel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(DeviceCards);
