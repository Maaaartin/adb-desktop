import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  TextField,
} from '@material-ui/core';
import { AdbClientOptions } from 'adb-ts';
import { get as getProp, isEqual as eql } from 'lodash';
import React, { ChangeEvent, Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { connect, ConnectedProps } from 'react-redux';
import {
  loadAdbSettings,
  loadToken,
  writeAdbSettings,
  writeToken,
  loadConsoleSettings,
  writeConsoleSettings,
} from '../redux/actions';
import CollapseButton from './CollapseButton';

type State = {
  adb: AdbClientOptions;
  token: string;
  lines: number;
  openAdb: boolean;
  openEmulator: boolean;
  openConsole: boolean;
};

class Settings extends Component<any, State> {
  constructor(props: Record<string, any>) {
    super(props);
    this.state = {
      adb: {},
      token: '',
      openAdb: false,
      openEmulator: false,
      lines: 0,
      openConsole: false,
    };
    this.onChangeFile = this.onChangeFile.bind(this);
    this.onPortChange = this.onPortChange.bind(this);
    this.onHostChange = this.onHostChange.bind(this);
    this.onTokenChange = this.onTokenChange.bind(this);
    this.onLinesChange = this.onLinesChange.bind(this);
  }

  componentDidUpdate(prevProps: PropsRedux, prevState: State) {
    const {
      openAdb: prevOpenAdb,
      openEmulator: prevOpenEmulator,
      openConsole: prevOpenConsole,
    } = prevState;
    const {
      openAdb,
      openEmulator,
      adb,
      token,
      lines,
      openConsole,
    } = this.state;
    const {
      writeAdbSettings,
      writeToken,
      writeConsoleSettings,
      adb: adbProp,
      token: tokenProp,
      lines: linesProp,
    } = this.props as PropsRedux;

    if (prevOpenAdb && !openAdb && !eql(adb, adbProp)) {
      writeAdbSettings(adb);
    }

    if (prevOpenEmulator && !openEmulator && !eql(token, tokenProp)) {
      writeToken(token);
    }

    if (prevOpenConsole && !openConsole && !eql(lines, linesProp)) {
      writeConsoleSettings({ lines });
    }
  }

  componentWillUnmount() {
    const {
      openAdb,
      openEmulator,
      adb,
      token,
      lines,
      openConsole,
    } = this.state;
    const {
      writeAdbSettings,
      writeToken,
      writeConsoleSettings,
      adb: adbProp,
      token: tokenProp,
      lines: linesProp,
    } = this.props as PropsRedux;
    if (openAdb && !eql(adb, adbProp)) {
      writeAdbSettings(adb);
    }

    if (openEmulator && !eql(token, tokenProp)) {
      writeToken(token);
    }

    if (openConsole && !eql(lines, linesProp)) {
      writeConsoleSettings({ lines });
    }
  }

  componentDidMount() {
    const { adb, token, lines } = this.props as PropsRedux;
    this.setState({ adb, token, lines });
  }

  onChangeFile(event: ChangeEvent<HTMLInputElement>) {
    const { adb } = this.state;
    this.setState({ adb: { ...adb, bin: event.target.files?.[0].path } });
  }

  onPortChange(event: ChangeEvent<HTMLInputElement>) {
    const { adb } = this.state;
    this.setState({ adb: { ...adb, port: Number(event.target.value) } });
  }

  onHostChange(event: ChangeEvent<HTMLInputElement>) {
    const { adb } = this.state;
    this.setState({ adb: { ...adb, host: event.target.value } });
  }

  onTokenChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ token: event.target.value });
  }

  onLinesChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ lines: Number(event.target.value) });
  }

  render() {
    const {
      adb: { bin, host, port },
      token,
      openAdb,
      openEmulator,
      openConsole,
      lines,
    } = this.state;
    return (
      <Card style={{ backgroundColor: '#dddd' }} className="w-full mb-1">
        <CardHeader title={'Settings'} />
        <CardContent>
          <Divider />
          <CollapseButton
            open={openAdb}
            onClick={() => this.setState({ openAdb: !openAdb })}
            tag="ADB"
          />
          <Collapse in={openAdb}>
            <Row>
              <Col sm={4}>
                <Row>
                  <Button
                    variant="contained"
                    component="label"
                    className="m-auto"
                  >
                    <span>ADB Path</span>
                    <input type="file" hidden onChange={this.onChangeFile} />
                  </Button>
                </Row>
                <Row>{bin}</Row>
              </Col>
              <Col sm={4}>
                <TextField
                  label="port"
                  type="number"
                  value={port}
                  onChange={this.onPortChange}
                />
              </Col>
              <Col sm={4}>
                <TextField
                  label={'host'}
                  value={host}
                  onChange={this.onTokenChange}
                />
              </Col>
            </Row>
          </Collapse>
          <CollapseButton
            open={openEmulator}
            onClick={() => this.setState({ openEmulator: !openEmulator })}
            tag="Emulator"
          />
          <Collapse in={openEmulator}>
            <TextField
              label={'emulator token'}
              value={token}
              onChange={this.onTokenChange}
            />
          </Collapse>
          <CollapseButton
            open={openConsole}
            onClick={() => this.setState({ openConsole: !openConsole })}
            tag="Console"
          />
          <Collapse in={openConsole}>
            <TextField
              type="number"
              label={'number of lines'}
              value={lines}
              onChange={this.onLinesChange}
            />
          </Collapse>
        </CardContent>
      </Card>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    adb: getProp(state, 'settings.adb', {}) as AdbClientOptions,
    token: getProp(state, 'settings.token', '') as string,
    lines: getProp(state, 'settings.console.lines', 0) as number,
  };
};

const mapDispatchToProps = {
  loadAdbSettings,
  writeAdbSettings,
  loadToken,
  writeToken,
  writeConsoleSettings,
  loadConsoleSettings,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsRedux = ConnectedProps<typeof connector>;

export default connector(Settings);
