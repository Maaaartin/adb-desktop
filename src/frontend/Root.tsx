import { Col, Row } from 'react-flexbox-grid';
import { ConnectedProps, connect } from 'react-redux';
import { DOCS_LINK, ISSUES_LINK } from '../links';
import {
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuList,
  Typography,
} from '@material-ui/core';
import { FaAndroid, FaCog, FaSync, FaTerminal } from 'react-icons/fa';
import React, { Component } from 'react';
import { tabAdd, tabDel, writeConsoleSettings } from './redux/actions';

import AdbConsole from './components/consoles/AdbConsole';
import AdbStatusDisplay from './components/AdbStatusPanel';
import DeviceCards from './components/DeviceCards';
import Devices from './components/Devices';
import { GlobalState } from './redux/reducers';
import Notifications from 'react-notification-system-redux';
import Settings from './components/Settings';
import Tabs from './components/Tabs';
import { typedIpcRenderer as ipc } from '../ipcIndex';
import { isDev } from '../shared';
import { version } from '../package.json';

class Root extends Component {
  constructor(props: PropsRedux) {
    super(props);
    window.addEventListener('beforeunload', () => {
      const { writeConsoleSettings, console } = this.props as PropsRedux;
      writeConsoleSettings({
        ...console.toObject(),
        history: console.get('history').toArray(),
      });
    });

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(type: string) {
    const { tabAdd, tabDel } = this.props as PropsRedux;
    switch (type) {
      case 'settings':
        tabAdd('Settings', () => <Settings />);
        break;
      case 'devices':
        tabAdd('Devices', () => <Devices />);
        break;
      case 'adb':
        tabAdd('ADB', (id) => <AdbConsole onExit={() => tabDel(id)} />);
        break;
      case 'reset':
        ipc.send('reset');
        break;
      default:
        break;
    }
  }

  render() {
    const { notifications } = this.props as PropsRedux;
    return (
      <div className="h-screen">
        <Notifications notifications={notifications} />
        <Row top="xs" style={{ height: 'calc(100% - 80px)' }}>
          <Col md={2} sm={4} xs={4} style={{ minWidth: '178px' }}>
            <Divider />
            <MenuList>
              <MenuItem onClick={() => this.onSelect('settings')}>
                <ListItemIcon>
                  <FaCog size="25" />
                </ListItemIcon>
                <Typography variant="inherit">Settings</Typography>
              </MenuItem>
              <MenuItem onClick={() => this.onSelect('devices')}>
                <ListItemIcon>
                  <FaAndroid size="25" />
                </ListItemIcon>
                <Typography variant="inherit">Devices</Typography>
              </MenuItem>
              <MenuItem onClick={() => this.onSelect('adb')}>
                <ListItemIcon>
                  <FaTerminal size="25" />
                </ListItemIcon>
                <Typography variant="inherit">ADB</Typography>
              </MenuItem>
              {isDev && (
                <MenuItem onClick={() => this.onSelect('reset')}>
                  <ListItemIcon>
                    <FaSync size="25" />
                  </ListItemIcon>
                  <Typography variant="inherit">Reset</Typography>
                </MenuItem>
              )}
            </MenuList>
            <Divider />
            <DeviceCards />
            <Divider />
          </Col>
          <Col md={9} sm={7} xs={5} className="h-full">
            <Tabs />
          </Col>
        </Row>
        <Row
          style={{ height: '80px' }}
          middle="xs"
          top="xs"
          between="xs"
          className="text-black bg-gray-400 sticky bottom-0"
        >
          <Col xs={6} sm={3}>
            <AdbStatusDisplay />
          </Col>
          <Col xs={6} sm={3}>
            <Row>
              <Col xs={6}>
                <Link
                  className="cursor-pointer"
                  onClick={() => ipc.send('openLink', DOCS_LINK)}
                >
                  Docs
                </Link>
              </Col>
              <Col xs={6}>
                <Link
                  className="cursor-pointer"
                  onClick={() => ipc.send('openLink', ISSUES_LINK)}
                >
                  Issues
                </Link>
              </Col>
            </Row>
          </Col>
          <Col xs={3} className="font-mono mr-3">
            <Row end="xs">version: {version}</Row>
            <Row end="xs">by Mr. Martin</Row>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    notifications: state.notifications,
    console: state.console,
  };
};

const mapDispatchToProps = {
  tabAdd,
  tabDel,
  writeConsoleSettings,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(Root as any);
