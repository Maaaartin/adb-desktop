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
import { version } from '../package.json';
import { DOCS_LINK, ISSUES_LINK } from '../links';
import { openLink } from './ipc/send';

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
          <Col
            md={2}
            sm={4}
            xs={4}
            style={{ marginRight: '17px', minWidth: '150px' }}
          >
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
          <Col md={9} sm={7} xs={7} className="h-full">
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
                  onClick={() => openLink(DOCS_LINK)}
                >
                  Docs
                </Link>
              </Col>
              <Col xs={6}>
                <Link
                  className="cursor-pointer"
                  onClick={() => openLink(ISSUES_LINK)}
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
