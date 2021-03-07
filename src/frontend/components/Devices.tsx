import AdbDevice from 'adb-ts/lib/device';
import { get as getProp, isEmpty as emp } from 'lodash';
import React from 'react';
import { Grid } from 'react-flexbox-grid';
import { connect, ConnectedProps } from 'react-redux';
import { deviceChange, tabAdd } from '../redux/actions';
import Device from './Device';
import Scrollable from './Scrollable';

const Devices = (props: any) => {
  const { devices } = props as PropsRedux;
  return (
    <Scrollable>
      <Grid
        className="align-middle overflow-y-scroll"
        style={{ maxHeight: 'calc(80vh - 100px)', width: '200vh' }}
      >
        {emp(devices) ? (
          <span>No devices connected</span>
        ) : (
          devices.map((d, index) => <Device key={index} device={d} />)
        )}
      </Grid>
    </Scrollable>
  );
};

const mapStateToProps = (state: any) => {
  return {
    devices: getProp(state, 'devices.list', []) as AdbDevice[],
  };
};

const mapDispatchToProps = {
  deviceChange,
  tabAdd,
};
const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(Devices as any);
