import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  TextField,
} from '@material-ui/core';
import { Col, Row } from 'react-flexbox-grid';
import { ConnectedProps, connect } from 'react-redux';
import React, { ChangeEvent, Component } from 'react';
import { isEqual as eql, identity, noop } from 'lodash';
import {
  writeAdbSettings,
  writeConsoleSettings,
  writeToken,
} from '../redux/actions';

import { AdbClientOptions } from 'adb-ts';
import CollapseButton from './subcomponents/CollapseButton';
import { FaSync } from 'react-icons/fa';
import { GlobalState } from '../redux/reducers';
import I from 'immutable';
import IconBtn from './subcomponents/IconBtn';
import { getColor } from '../colors';
import { typedIpcRenderer as ipc } from '../../ipcIndex';

type State = {
  adb: I.Record<AdbClientOptions>;
  token: string;
  lines: number;
  openAdb: boolean;
  openEmulator: boolean;
  openConsole: boolean;
  historyLen: number;
};

class Settings extends Component<any, State> {
  constructor(props: Record<string, any>) {
    super(props);
    this.state = {
      adb: I.Record({})(),
      token: '',
      openAdb: false,
      openEmulator: false,
      lines: 0,
      openConsole: false,
      historyLen: 0,
    };
    this.onChangeFile = this.onChangeFile.bind(this);
    this.onPortChange = this.onPortChange.bind(this);
    this.onTokenChange = this.onTokenChange.bind(this);
    this.onLinesChange = this.onLinesChange.bind(this);
    this.onHistoryLenChange = this.onHistoryLenChange.bind(this);
    this.resetAdbSettings = this.resetAdbSettings.bind(this);
    this.resetToken = this.resetToken.bind(this);
    this.resetConsole = this.resetConsole.bind(this);
    this.renewToken = this.renewToken.bind(this);
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
      historyLen,
    } = this.state;
    const {
      writeAdbSettings,
      writeToken,
      writeConsoleSettings,
      adb: adbProp,
      token: tokenProp,
      lines: linesProp,
      historyLen: historyLenProp,
    } = this.props as PropsRedux;
    const { token: prevTokenProp } = prevProps as PropsRedux;

    // when token is renewed
    if (prevTokenProp != tokenProp) {
      this.setState({ token: tokenProp });
    }

    if (prevOpenAdb && !openAdb && !eql(adb, adbProp)) {
      writeAdbSettings(adb.toJSON());
    }

    if (prevOpenEmulator && !openEmulator && !eql(token, tokenProp)) {
      writeToken(token);
    }

    if (
      prevOpenConsole &&
      !openConsole &&
      (!eql(lines, linesProp) || !eql(historyLen, historyLenProp))
    ) {
      writeConsoleSettings({ lines, historyLen });
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
      historyLen,
    } = this.state;
    const {
      writeAdbSettings,
      writeToken,
      writeConsoleSettings,
      adb: adbProp,
      token: tokenProp,
      lines: linesProp,
      historyLen: historyLenProp,
    } = this.props as PropsRedux;
    if (openAdb && !eql(adb, adbProp)) {
      writeAdbSettings(adb.toJSON());
    }

    if (openEmulator && !eql(token, tokenProp)) {
      writeToken(token);
    }

    if (
      openConsole &&
      (!eql(lines, linesProp) || !eql(historyLen, historyLenProp))
    ) {
      writeConsoleSettings({ lines, historyLen });
    }
  }

  componentDidMount() {
    const { adb, token, lines, historyLen } = this.props as PropsRedux;
    this.setState({ adb, token, lines, historyLen });
  }

  private renewToken() {
    const { writeToken } = this.props as PropsRedux;
    ipc
      .invoke('renewToken')
      .then(({ output }) => output && writeToken(output), noop);
  }

  onChangeFile(event: ChangeEvent<HTMLInputElement>) {
    const { adb } = this.state;
    this.setState({
      adb: adb.update('bin', () => event.target.files?.[0].path),
    });
  }

  onPortChange(event: ChangeEvent<HTMLInputElement>) {
    const { adb } = this.state;
    this.setState({
      adb: adb.update('port', () => Number(event.target.value)),
    });
  }

  onTokenChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ token: event.target.value });
  }

  onLinesChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ lines: Number(event.target.value) });
  }

  onHistoryLenChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ historyLen: Number(event.target.value) });
  }

  resetAdbSettings() {
    const { adb: adbProp } = this.props as PropsRedux;
    this.setState({ adb: { ...adbProp } });
  }

  resetToken() {
    const { token: tokenProp } = this.props as PropsRedux;
    this.setState({ token: tokenProp });
  }

  resetConsole() {
    const { lines: linesProp, historyLen: historyLenProp } = this
      .props as PropsRedux;
    this.setState({ lines: linesProp, historyLen: historyLenProp });
  }

  render() {
    const {
      adb,
      token,
      openAdb,
      openEmulator,
      openConsole,
      lines,
      historyLen,
    } = this.state;

    return (
      <Card style={{ backgroundColor: getColor('card') }} className="w-full">
        <CardHeader title={'Settings'} />
        <CardContent>
          <Divider />
          <CollapseButton
            className="mb-1"
            btnTag={openAdb ? 'Reset' : ''}
            btnOnClick={this.resetAdbSettings}
            open={openAdb}
            onClick={() => this.setState({ openAdb: !openAdb })}
            tag="ADB"
          />
          <Collapse in={openAdb}>
            <Row>
              <Col>
                <Button
                  variant="contained"
                  component="label"
                  className="m-auto"
                >
                  <span>ADB Path</span>
                  <input
                    type="file"
                    hidden
                    onChange={this.onChangeFile}
                    value={''}
                  />
                </Button>
              </Col>
              <Col className="ml-3" style={{ lineHeight: '40px' }}>
                {adb.get('bin') || 'ADB path not set!'}
              </Col>
              <Col className="ml-3" sm={4}>
                <TextField
                  label="port"
                  type="number"
                  value={adb.get('port')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={this.onPortChange}
                />
              </Col>
            </Row>
          </Collapse>
          <Divider />
          <CollapseButton
            className="mb-1"
            btnTag={openEmulator ? 'Reset' : ''}
            btnOnClick={this.resetToken}
            open={openEmulator}
            onClick={() => this.setState({ openEmulator: !openEmulator })}
            tag="Emulator"
          />
          <Collapse in={openEmulator}>
            <Row>
              <Col>
                <TextField
                  label={'emulator token'}
                  value={token}
                  onChange={this.onTokenChange}
                />
              </Col>
              <Col>
                <IconBtn
                  tag="Renew token"
                  IconEl={FaSync}
                  onClick={this.renewToken}
                />
              </Col>
            </Row>
          </Collapse>
          <Divider />
          <CollapseButton
            btnTag={openConsole ? 'Reset' : ''}
            btnOnClick={this.resetConsole}
            open={openConsole}
            onClick={() => this.setState({ openConsole: !openConsole })}
            tag="Console"
          />
          <Collapse in={openConsole}>
            <Row>
              <Col xs={6}>
                <TextField
                  type="number"
                  label={'number of lines'}
                  value={lines}
                  onChange={this.onLinesChange}
                />
              </Col>
              <Col xs={6}>
                <TextField
                  type="number"
                  label={'history length'}
                  value={historyLen}
                  onChange={this.onHistoryLenChange}
                />
              </Col>
            </Row>
          </Collapse>
        </CardContent>
      </Card>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    adb: state.adb.settings.withMutations(identity),
    token: '',
    lines: state.console.lines,
    historyLen: state.console.historyLen,
  };
};

const mapDispatchToProps = {
  writeAdbSettings,
  writeToken,
  writeConsoleSettings,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsRedux = ConnectedProps<typeof connector>;

export default connector(Settings);
