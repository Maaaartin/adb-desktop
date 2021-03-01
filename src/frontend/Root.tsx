import {
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuList,
  Typography,
} from '@material-ui/core';
import { ipcRenderer as ipc } from 'electron';
import { get as getProp } from 'lodash';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaAndroid, FaCog, FaTerminal } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import AdbStatusDisplay from './components/AdbStatusPanel';
import AdbConsole from './components/consoles/AdbConsole';
import DeviceCards from './components/DeviceCards';
import Devices from './components/Devices';
import Settings from './components/Settings';
import Tabs from './components/Tabs';
import { saveHistory } from './ipc';
import {
  deviceChange,
  loadAdbSettings,
  loadConsoleSettings,
  loadHistory,
  loadToken,
  setAdbStatus,
  Tab,
  tabAdd,
  tabDel,
} from './redux/actions';
import {
  ADB_SETTINGS_LOAD,
  ADB_STATUS,
  DEVICE_CHANGE,
  LOAD_CONSOLE_SETTINGS,
  LOAD_HISTORY,
  LOAD_TOKEN,
} from './redux/actionTypes';

class Root extends Component<any, any> {
  constructor(props: PropsRedux) {
    super(props);
    const {
      loadAdbSettings,
      deviceChange,
      loadHistory,
      loadToken,
      setAdbStatus,
      loadConsoleSettings,
    } = props as PropsRedux;

    ipc.on(ADB_SETTINGS_LOAD, (event, data) => {
      loadAdbSettings(data);
    });

    ipc.on(DEVICE_CHANGE, (event, data) => {
      deviceChange(data);
    });

    ipc.on(LOAD_HISTORY, (event, data) => {
      loadHistory(data);
    });

    ipc.on(LOAD_TOKEN, (event, data) => {
      loadToken(data);
    });

    ipc.on(ADB_STATUS, (event, data) => {
      setAdbStatus(data);
    });

    ipc.on(LOAD_CONSOLE_SETTINGS, (event, data) => {
      loadConsoleSettings(data);
    });

    window.addEventListener('beforeunload', () => {
      const { history } = this.props as PropsRedux;
      saveHistory(history);
    });

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(props: { type: string; id?: string }) {
    const { type, id } = props;
    const { tabAdd, tabDel } = this.props as PropsRedux;
    switch (type) {
      case 'settings':
        tabAdd(new Tab('Settings', <Settings />));
        break;
      case 'devices':
        tabAdd(new Tab('Devices', <Devices />));
        break;
      case 'adb':
        const tab = new Tab(
          'ADB',
          (
            <AdbConsole
              onExit={() => {
                return tabDel(tab.getId());
              }}
            />
          )
        );
        tabAdd(tab);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="relative">
        <Row top="xs" style={{ height: 'calc(100vh - 0px)' }}>
          <Col sm={3} style={{ marginRight: '17px' }}>
            <Divider />
            <MenuList>
              <MenuItem onClick={() => this.onSelect({ type: 'settings' })}>
                <ListItemIcon>
                  <FaCog size="25" />
                </ListItemIcon>
                <Typography variant="inherit">Settings</Typography>
              </MenuItem>
              <MenuItem onClick={() => this.onSelect({ type: 'devices' })}>
                <ListItemIcon>
                  <FaAndroid size="25" />
                </ListItemIcon>
                <Typography variant="inherit">Devices</Typography>
              </MenuItem>
              <MenuItem onClick={() => this.onSelect({ type: 'adb' })}>
                <ListItemIcon>
                  <FaTerminal size="25" />
                </ListItemIcon>
                <Typography variant="inherit">ADB</Typography>
              </MenuItem>
            </MenuList>
            <Divider />
            <DeviceCards />
            <Divider />
          </Col>
          <Col sm={8}>
            <Tabs />
          </Col>
        </Row>
        <Row
          middle="xs"
          top="xs"
          between="xs"
          className="text-black bg-gray-400 sticky bottom-0"
        >
          <Col sm={3}>
            <AdbStatusDisplay />
          </Col>
          <Col sm={3}>
            <Link>Docs</Link>
          </Col>
          <Col sm={3} className="font-mono text-right">
            © Martin Svoboda
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    history: getProp(state, 'history.list', []),
  };
};

const mapDispatchToProps = {
  deviceChange,
  loadAdbSettings,
  tabAdd,
  loadHistory,
  tabDel,
  loadToken,
  setAdbStatus,
  loadConsoleSettings,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(Root as any);
