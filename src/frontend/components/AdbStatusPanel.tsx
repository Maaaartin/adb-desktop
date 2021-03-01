import { Button, Card, Typography } from '@material-ui/core';
import { get as getProp } from 'lodash';
import React from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaCircle } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import { toggleAdb } from '../ipc';
import { AdbStatus, setAdbStatus } from '../redux/actions';

const AdbStatusPanel = (props: any) => {
  const {
    status: { status },
  } = props as PropsRedux;
  const start = status === 'error' || status === 'stopped';
  const color =
    status === 'running'
      ? 'green'
      : status === 'starting'
      ? '#eda600'
      : '#bd1300';
  return (
    <Card
      className="p-1"
      style={{ backgroundColor: '#dddd', height: '10vh', minHeight: '75px' }}
      title={'ADB'}
    >
      <Row style={{ height: '30%' }}>
        <Col sm={2}>
          <Typography>ADB</Typography>
        </Col>
        <Col sm={10}>
          <FaCircle size="20" color={color} />
        </Col>
      </Row>
      <Row>
        <Col className="pt-1" sm={6}>
          Status: {status}
        </Col>
        <Col sm={6}>
          <Button variant="contained" onClick={() => toggleAdb()}>
            {start ? 'Start' : 'Stop'}
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

const mapStateToProps = (state: any) => {
  return {
    status: getProp(state, 'adb.status', {}) as AdbStatus,
  };
};

const mapDispatchToProps = {
  setAdbStatus,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(AdbStatusPanel as any);
