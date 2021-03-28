import { Fireworks } from 'fireworks/lib/react';
import React, { Component } from 'react';
import { FaLink } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import { addHistory } from '../redux/actions';
import { GlobalState } from '../redux/reducers';
import HiddenInput from './HiddenInput';
import IconBtn from './IconBtn';

type State = {
  logs: { isCommand?: boolean; value: string }[];
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
  private input = React.createRef<HiddenInput>();
  private list = React.createRef<HTMLUListElement>();
  constructor(props: any) {
    super(props);
    this.state = {
      logs: [
        { value: `type 'help' for help` },
        { value: `use 'Shift' + arrow keys to mark the textcls` },
      ],
      firework: false,
      execution: false,
    };

    this.focus = this.focus.bind(this);
    this.onEnter = this.onEnter.bind(this);
  }

  componentDidMount() {
    this.input.current?.focus();
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
          const { id, addHistory, exec } = this.props as PropsRedux;
          logs.push({ value: cmd, isCommand: true });
          logs.push(
            { value: `${this.formatHelp('exit', 'close the console')}` },
            { value: `${this.formatHelp('cls', 'clear the console')}` },
            { value: `${this.formatHelp('help', 'display help')}` }
          );
          this.setState({ logs, execution: true });
          addHistory(cmd);
          exec({ id, cmd }, (error, output) => {
            if (error) {
              this.setState({ execution: false }, () => this.focus());
              return;
            } else {
              logs.push(...this.parseExec(output));
              this.setState({ logs, execution: false }, () => this.focus());
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
          this.setState({ logs, execution: true });
        }
        break;
    }
    this.focus();
  }

  render() {
    const { logs, firework, execution } = this.state;
    const { id, openShell, tag, history } = this.props as PropsRedux;
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
          onClick={() => openShell(id)}
          IconEl={FaLink}
        />
        <ul
          ref={this.list}
          className="border border-solid border-white-500 bg-black overflow-scroll overflow-x-hidden whitespace-pre-wrap"
          style={{ width: '100%', height: 'calc(100% - 60px)' }}
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
              <HiddenInput
                disabled={execution}
                ref={this.input}
                history={history}
                onEnter={(value) => this.onEnter(value)}
              ></HiddenInput>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    history: state.console.history,
    lines: state.console.lines,
  };
};

const mapDispatchToProps = {
  addHistory,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = Props & ConnectedProps<typeof connector>;

export default connector(Console);
