import { isEmpty as emp } from 'lodash';
import React from 'react';
import { Grid } from 'react-flexbox-grid';
import { connect, ConnectedProps } from 'react-redux';
import { deviceChange, tabAdd } from '../redux/actions';
import { GlobalState } from '../redux/reducers';
import Device from './Device';
import Scrollable from './subcomponents/Scrollable';

const Devices = (props: any) => {
  const { devices } = props as PropsRedux;
  return (
    <Scrollable>
      <div
        className="align-middle overflow-y-scroll"
        style={{ maxHeight: 'calc(80vh - 100px)' }}
      >
        {emp(devices) ? (
          <span>No devices connected</span>
        ) : (
          devices.map((d, index) => <Device key={index} device={d} />)
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
  deviceChange,
  tabAdd,
};
const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(Devices as any);
