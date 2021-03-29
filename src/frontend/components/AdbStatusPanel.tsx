import { Button, Card, Typography } from '@material-ui/core';
import React from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { connect, ConnectedProps } from 'react-redux';
import { toggleAdb } from '../ipc/send';
import { setAdbStatus } from '../redux/actions';
import { GlobalState } from '../redux/reducers';

const AdbStatusPanel = (props: any) => {
  const {
    status: { status },
  } = props as PropsRedux;
  const start = status === 'error' || status === 'stopped';
  const color =
    status === 'running'
      ? '#a9c9ac'
      : status === 'starting'
      ? '#e3b446'
      : '#e86868';
  return (
    <Card
      className="p-1"
      style={{ backgroundColor: color, height: '10vh', minHeight: '75px' }}
      title={'ADB'}
    >
      <Row style={{ height: '30%' }}>
        <Col className="ml-3">
          <Typography>ADB</Typography>
        </Col>
      </Row>
      <Row>
        <Col className="pt-1" xs={6}>
          Status: {status}
        </Col>
        <Col xs={6}>
          <Button variant="contained" size="small" onClick={() => toggleAdb()}>
            {start ? 'Start' : 'Stop'}
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

const mapStateToProps = (state: GlobalState) => {
  return {
    status: state.adb.status,
  };
};

const mapDispatchToProps = {
  setAdbStatus,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(AdbStatusPanel as any);
