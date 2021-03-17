import {
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuList,
  Typography,
} from '@material-ui/core';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaAndroid, FaCog, FaTerminal } from 'react-icons/fa';
import Notifications from 'react-notification-system-redux';
import { connect, ConnectedProps } from 'react-redux';
import AdbStatusDisplay from './components/AdbStatusPanel';
import AdbConsole from './components/consoles/AdbConsole';
import DeviceCards from './components/DeviceCards';
import Devices from './components/Devices';
import Settings from './components/Settings';
import Tabs from './components/Tabs';
import { Tab, tabAdd, tabDel, writeConsoleSettings } from './redux/actions';
import { GlobalState } from './redux/reducers';

class Root extends Component {
  constructor(props: PropsRedux) {
    super(props);
    window.addEventListener('beforeunload', () => {
      const { writeConsoleSettings, console } = this.props as PropsRedux;
      writeConsoleSettings(console);
    });

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(type: string) {
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
    const { notifications } = this.props as PropsRedux;
    return (
      <div className="h-screen">
        <Notifications notifications={notifications} />
        <Row top="xs" style={{ height: 'calc(100% - 80px)' }}>
          <Col xs={3} style={{ marginRight: '17px' }}>
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
            </MenuList>
            <Divider />
            <DeviceCards />
            <Divider />
          </Col>
          <Col xs={8} className="h-full">
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
          <Col xs={3}>
            <AdbStatusDisplay />
          </Col>
          <Col xs={3}>
            <Link>Docs</Link>
          </Col>
          <Col xs={3} className="font-mono text-right mr-2">
            © Martin Svoboda
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
