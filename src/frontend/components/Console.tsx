import { ConnectedProps, connect } from 'react-redux';
import React, { Component } from 'react';

import { CommandResponse } from '../../ipcIndex';
import { FaLink } from 'react-icons/fa';
import { Fireworks } from 'fireworks/lib/react';
import { GlobalState } from '../redux/reducers';
import IconBtn from './subcomponents/IconBtn';
import ResizeInput from './subcomponents/ResizeInput';
import Scrollable from './subcomponents/Scrollable';
import { addHistory } from '../redux/actions';
import { isEmpty as emp } from 'lodash';
import { typedIpcRenderer as ipc } from '../../ipcIndex';

type State = {
  logs: { isCommand?: boolean; value: string; isLink?: boolean }[];
  firework: boolean;
  execution: boolean;
};

type Props = {
  serial: string;
  openShell: (id: string) => void;
  exec: (serial: string, cmd: string) => Promise<CommandResponse<string>>;
  tag?: string;
  onExit?: VoidFunction;
  links?: string[];
};

class Console extends Component<Props, State> {
  private inputRef = React.createRef<HTMLDivElement>();
  constructor(props: any) {
    super(props);
    this.state = {
      logs: [
        { value: `type 'help' for help` },
        { value: `use 'Shift' + arrow keys to mark the text` },
      ],
      firework: false,
      execution: false,
    };

    this.focus = this.focus.bind(this);
    this.onEnter = this.onEnter.bind(this);
  }

  componentDidMount() {
    this.inputRef.current?.focus();
  }

  componentDidUpdate() {
    const { logs } = this.state;
    const { lines } = this.props as PropsRedux;
    if (logs.length > lines) {
      const index = logs.length - lines;
      const newLogs = logs.slice(index);
      this.setState({ logs: newLogs });
    }
  }

  formatHelp(key: string, value: string) {
    const spaces = 20 - key.length;
    return `${key} ${' '.repeat(spaces)} ${value}`;
  }

  focus() {
    this.inputRef.current?.scrollIntoView();
  }

  parseExec(value?: string) {
    const lines = value?.split('\r');
    if (lines) {
      return lines.map((line) => ({
        value: line,
      }));
    } else return [{ value: value || '' }];
  }

  onEnter(cmd: string) {
    const { logs } = this.state;

    switch (cmd) {
      case 'exit':
        {
          const { onExit } = this.props;
          onExit?.();
        }
        break;
      case 'cls':
        {
          this.setState({ logs: [] });
        }
        break;
      case 'hello':
        {
          logs.push({ value: cmd, isCommand: true });
          logs.push({ value: 'Hi! Hope you are having a good day' });
          this.setState({ logs });
        }
        break;
      case 'blow it up':
        {
          logs.push({ value: cmd, isCommand: true });
          this.setState({ firework: true });
          setTimeout(() => {
            this.setState({ firework: false });
          }, 3000);
        }
        break;
      case 'help':
        {
          const { serial, addHistory, exec, links } = this.props as PropsRedux;
          logs.push({ value: cmd, isCommand: true });
          logs.push(
            { value: `${this.formatHelp('exit', 'close the console')}` },
            { value: `${this.formatHelp('cls', 'clear the console')}` },
            { value: `${this.formatHelp('help', 'display help')}` }
          );
          if (!emp(links)) {
            logs.push({ value: 'For more information check links below:' });
            links?.forEach((link) => logs.push({ value: link, isLink: true }));
          }
          logs.push({ value: '\r\n' });
          this.setState({ logs, execution: true });
          if (cmd) {
            addHistory(cmd);
          }
          exec(serial, cmd).then(({ error, output }) => {
            if (error) {
              this.setState({ execution: false }, () => this.focus());
            } else {
              logs.push(...this.parseExec(output));
              this.setState({ logs, execution: false }, () => this.focus());
            }
          });
        }
        break;
      default:
        {
          const { serial, addHistory, exec } = this.props as PropsRedux;
          logs.push({ value: cmd, isCommand: true });
          if (cmd) {
            exec(serial, cmd).then(({ error, output }) => {
              if (error) {
                logs.push(...this.parseExec(error.message));
              }
              if (output) {
                logs.push(...this.parseExec(output));
              }
              this.setState({ logs, execution: false }, () => this.focus());
            });
            addHistory(cmd);
          }
          this.setState({ logs, execution: true });
        }
        break;
    }
    this.focus();
  }

  render() {
    const { logs, firework, execution } = this.state;
    const { serial, openShell, tag } = this.props as PropsRedux;

    return (
      <div className="font-mono h-full w-full">
        {firework && (
          <Fireworks
            {...{
              count: 3,
              interval: 200,
              colors: ['#cc3333', '#4CAF50', '#81C784'],
              calc: (props, i) => ({
                ...props,
                x: (i + 1) * (window.innerWidth / 3) - (i + 1) * 100,
                y: 200 + Math.random() * 100 - 50 + (i === 2 ? -80 : 0),
              }),
            }}
          />
        )}
        <IconBtn
          tag="Open dedicated console"
          onClick={() => openShell(serial)}
          IconEl={FaLink}
        />
        <Scrollable
          className="border border-solid border-white-500 bg-black whitespace-pre-wrap"
          options={{ suppressScrollX: true }}
        >
          <ul style={{ width: '100%', height: 'calc(100% - 60px)' }}>
            {logs.map((line, index) => {
              return (
                <li key={index}>
                  {line.isCommand && (
                    <span className="text-gray-500">{`${
                      tag || serial
                    }> `}</span>
                  )}
                  <span>
                    {line.isLink ? (
                      <span
                        className="underline cursor-pointer"
                        onClick={() => ipc.send('openLink', line.value)}
                      >
                        {line.value}
                      </span>
                    ) : (
                      line.value
                    )}
                  </span>
                </li>
              );
            })}
            <li onClick={() => this.focus()}>
              <div>
                <ResizeInput
                  disabled={execution}
                  autofocus
                  tag={
                    <span className="text-gray-500">{`${
                      tag || serial
                    }> `}</span>
                  }
                  onEnter={(value: string) => this.onEnter(value)}
                  withHistory
                />
              </div>
            </li>
          </ul>
        </Scrollable>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    lines: state.console.lines,
  };
};

const mapDispatchToProps = {
  addHistory,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = Props & ConnectedProps<typeof connector>;

export default connector(Console);
