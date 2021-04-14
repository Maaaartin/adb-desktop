import { Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import React from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaMobileAlt, FaRobot, FaTerminal } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import { isEmpty as emp } from 'lodash';
import { Tab, tabAdd, tabDel } from '../redux/actions';
import { GlobalState } from '../redux/reducers';
import DeviceConsole from './consoles/DeviceConsole';
import EmulatorConsole from './consoles/EmulatorConsole';
import MonkeyConsole from './consoles/MonkeyConsole';
import IconBtn from './subcomponents/IconBtn';
import Scrollable from './subcomponents/Scrollable';
import { getColor } from '../colors';

const DeviceCards = (props: any) => {
  const { devices, tabAdd, tabDel } = props as PropsRedux;
  return (
    <Scrollable className="pt-1 pb-1">
      <div
        className="overflow-hidden overflow-y-scroll pr-1"
        style={{ height: 'calc(77vh - 80px)' }}
      >
        {emp(devices) ? (
          <Typography className="pl-1">No devices connected</Typography>
        ) : (
          devices.map((device, index) => {
            const { id, state } = device;
            const isEmulator = state === 'emulator';
            return (
              <Card
                key={index}
                style={{
                  backgroundColor: getColor('card'),
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
          })
        )}
      </div>
    </Scrollable>
  );
};

const mapStateToProps = (state: GlobalState) => {
  return {
    devices: state.devices.list,
  };
};

const mapDispatchToProps = {
  tabAdd,
  tabDel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(DeviceCards);
