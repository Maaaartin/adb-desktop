import { Fireworks } from 'fireworks/lib/react';
import { get as getProp } from 'lodash';
import React, { Component, KeyboardEvent } from 'react';
import { FaLink } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import { addHistory, loadConsoleSettings } from '../redux/actions';
import IconBtn from './IconBtn';

type State = {
  logs: { isCommand?: boolean; value: string }[];
  cmd: string;
  firework: boolean;
  execution: boolean;
};
type Props = {
  id: string;
  openShell: (id: string) => void;
  exec: (
    opt: { id: string; cmd: string },
    cb: (error: Error, output: string) => void
  ) => void;
  tag?: string;
  onExit?: VoidFunction;
};

class Console extends Component<Props, State> {
  private input = React.createRef<HTMLInputElement>();
  private list = React.createRef<HTMLUListElement>();
  constructor(props: any) {
    super(props);
    this.state = {
      logs: [],
      cmd: '',
      firework: false,
      execution: false,
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.focus = this.focus.bind(this);
  }

  componentDidMount() {
    this.input.current?.focus();
  }

  componentDidUpdate() {
    const { logs } = this.state;
    const { lines } = this.props as PropsRedux;
    if (logs.length > lines) {
      const index = logs.length - lines;
      const newLogs = logs.slice(index - 1, logs.length - 1);
      this.setState({ logs: newLogs });
    }
  }

  formatHelp(key: string, value: string) {
    const spaces = 20 - key.length;
    return `${key} ${' '.repeat(spaces)} ${value}`;
  }

  focus() {
    this.list.current?.scrollTo(0, this.list.current.scrollHeight);
    this.input.current?.focus();
  }

  parseExec(value?: string) {
    const lines = value?.split('\r');
    if (lines) {
      return lines.map((line) => ({
        value: line,
      }));
    } else return [{ value: value || '' }];
  }

  onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Enter':
        {
          const { logs, cmd } = this.state;
          switch (cmd) {
            case 'exit':
              {
                const { onExit } = this.props;
                onExit?.();
              }
              break;
            case 'cls':
              {
                this.setState({ logs: [], cmd: '' });
              }
              break;
            case 'hello':
              {
                logs.push({ value: cmd, isCommand: true });
                logs.push({ value: 'Hi! Hope you are having a good day' });
                this.setState({ logs, cmd: '' });
              }
              break;
            case 'blow it up':
              {
                logs.push({ value: cmd, isCommand: true });
                this.setState({ firework: true, cmd: '' });
                setTimeout(() => {
                  this.setState({ firework: false });
                }, 3000);
              }
              break;
            case 'help':
              {
                const { id, addHistory, exec } = this.props as PropsRedux;
                logs.push({ value: cmd, isCommand: true });
                logs.push(
                  { value: `${this.formatHelp('exit', 'close the console')}` },
                  { value: `${this.formatHelp('cls', 'clear the console')}` },
                  { value: `${this.formatHelp('help', 'display help')}` }
                );
                this.setState({ logs, cmd: '', execution: true });
                addHistory(cmd);
                exec({ id, cmd }, (error, output) => {
                  if (error) {
                    this.setState({ execution: false });
                    return;
                  } else {
                    logs.push(...this.parseExec(output));
                    this.setState({ logs, execution: false }, () =>
                      this.focus()
                    );
                  }
                });
              }
              break;
            default:
              {
                const { id, addHistory, exec } = this.props as PropsRedux;
                logs.push({ value: cmd, isCommand: true });
                exec({ id, cmd }, (error, output) => {
                  if (error) {
                    logs.push(...this.parseExec(error.message));
                  } else {
                    logs.push(...this.parseExec(output));
                  }
                  this.setState({ logs, execution: false }, () => this.focus());
                });
                addHistory(cmd);
                this.setState({ logs, cmd: '', execution: true });
              }
              break;
          }
          this.focus();
        }
        break;
      case 'ArrowDown':
        {
          const { cmd } = this.state;
          const { history } = this.props as PropsRedux;
          const index = history.indexOf(cmd);
          this.setState({ cmd: history[index + 1] || '' });
        }
        break;
      case 'ArrowUp':
        {
          const { cmd } = this.state;
          const { history } = this.props as PropsRedux;
          const index = history.indexOf(cmd);
          if (!cmd) {
            this.setState({ cmd: history[history.length - 1] });
          } else {
            this.setState({ cmd: history[index - 1] });
          }
        }
        break;
    }
  }

  render() {
    const { logs, cmd, firework, execution } = this.state;
    const { id, openShell, tag } = this.props;
    return (
      <div className=" font-mono" style={{ width: '149%' }}>
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
          onClick={() => openShell(id)}
          IconEl={FaLink}
        />
        <ul
          ref={this.list}
          className="border border-solid border-white-500 bg-black overflow-scroll overflow-x-hidden whitespace-pre-wrap"
          style={{ width: '67%', height: 'calc(70vh - 100px)' }}
        >
          {logs.map((line, index) => {
            return (
              <li key={index}>
                {line.isCommand && (
                  <span className="text-gray-500">{`${tag || id}> `}</span>
                )}
                <span>{line.value}</span>
              </li>
            );
          })}
          <li onClick={() => this.focus()}>
            <div>
              <span className="text-gray-500">{`${tag || id}> `}</span>
              <input
                disabled={execution}
                ref={this.input}
                onKeyDown={this.onKeyDown}
                value={cmd}
                onChange={(event) => this.setState({ cmd: event.target.value })}
                type="text"
                className="text-white bg-black border-0 w-0"
              />
              <span className="break-all">{cmd}</span>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    history: getProp(state, 'history.list', []) as string[],
    lines: getProp(state, 'settings.console.lines', 500) as number,
  };
};

const mapDispatchToProps = {
  addHistory,
  loadConsoleSettings,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = Props & ConnectedProps<typeof connector>;

export default connector(Console);
