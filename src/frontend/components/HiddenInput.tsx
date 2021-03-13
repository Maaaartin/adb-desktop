import React, { Component, KeyboardEvent } from 'react';

type State = {
  blink: boolean;
  start: string;
  end: string;
  markedStart: string;
  markedEnd: string;
};

type Props = {
  ref?: React.RefObject<HTMLInputElement>;
  initValue?: string;
  history?: string[];
  onEnter?: (value: string) => void;
};

class HiddenInput extends Component<Props, State> {
  private input = React.createRef<HTMLInputElement>();
  constructor(props: Props) {
    super(props);
    const start = props.initValue || '';
    this.state = {
      blink: false,
      start: start,
      end: '',
      markedEnd: '',
      markedStart: '',
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.getValue = this.getValue.bind(this);
    this.focus = this.focus.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleCut = this.handleCut.bind(this);
  }

  componentDidMount() {
    this.focus();
    setInterval(() => {
      const { blink } = this.state;
      this.setState({ blink: !blink });
    }, 500);
  }

  getValue() {
    const { start, end, markedEnd, markedStart } = this.state;
    return start.concat(markedStart, markedEnd, end);
  }

  focus() {
    this.input.current?.focus();
  }

  componentDidUpdate() {
    this.focus();
  }

  getMarked() {
    const { markedEnd, markedStart } = this.state;
    return markedStart.concat(markedEnd);
  }

  handleKeyDown(key: string) {
    const { start, end, markedEnd, markedStart } = this.state;
    switch (key) {
      case 'Enter':
        {
          const { onEnter } = this.props;
          onEnter?.(this.getValue());
          this.setState({ start: '', end: '' });
        }
        break;
      case 'ArrowDown':
        {
          const { history } = this.props;
          if (history) {
            const index = history.indexOf(this.getValue());
            const start = history[index + 1] || '';
            this.setState({ start, end: '' });
          }
        }
        break;
      case 'ArrowUp':
        {
          const { history } = this.props;
          const value = this.getValue();
          if (history) {
            const index = history.indexOf(value);
            if (!value) {
              this.setState({ start: history[history.length - 1] });
            } else {
              this.setState({ start: history[index - 1] });
            }
          }
        }
        break;
      case 'ArrowLeft':
        {
          let newStart: string;
          let newEnd: string;
          if (markedEnd || markedStart) {
            newStart = start;
            newEnd = this.getMarked().concat(end);
          } else {
            newStart = start.slice(0, start.length - 1);
            newEnd = start
              .slice(start.length - 1)
              .concat(end.concat(this.getMarked()));
          }
          this.setState({
            start: newStart,
            end: newEnd,
            markedEnd: '',
            markedStart: '',
          });
        }
        break;
      case 'ArrowRight':
        {
          let newStart: string;
          let newEnd: string;
          if (markedEnd || markedStart) {
            newEnd = end;
            newStart = start.concat(this.getMarked());
          } else {
            newStart = start.concat(end.slice(0, 1));
            newEnd = end.slice(1);
          }

          this.setState({
            start: newStart,
            end: newEnd,
            markedEnd: '',
            markedStart: '',
          });
        }
        break;
      case 'Backspace':
        {
          this.setState({ start: start.slice(0, start.length - 1) });
        }
        break;
      case 'Delete':
        {
          this.setState({ end: end.slice(1) });
        }
        break;
      default:
        if (key.length === 1) {
          this.setState({ start: start.concat(key) });
        }
        break;
    }
  }

  handleCtrlKey(key: string) {
    const { start, end, markedEnd, markedStart } = this.state;
    switch (key) {
      case 'ArrowLeft':
        if (!markedEnd) {
          const char = start.slice(start.length - 1);
          if (char) {
            const newStart = start.slice(0, start.length - 1);
            const newMarkedStart = char.concat(markedStart);
            this.setState({ markedStart: newMarkedStart, start: newStart });
          }
        } else {
          const char = markedEnd.slice(markedEnd.length - 1);
          if (char) {
            const newEnd = char.concat(end);
            const newMarkedEnd = markedEnd.slice(0, markedEnd.length - 1);
            this.setState({ markedEnd: newMarkedEnd, end: newEnd });
          }
        }
        break;
      case 'ArrowRight':
        {
          if (!markedStart) {
            const char = end.slice(0, 1);
            if (char) {
              const newEnd = end.slice(1);
              const newMarkedEnd = markedEnd.concat(char);
              this.setState({ end: newEnd, markedEnd: newMarkedEnd });
            }
          } else {
            const char = markedStart.slice(0, 1);
            if (char) {
              const newStart = start.concat(char);
              const newMarkedStart = markedStart.slice(1);
              this.setState({ start: newStart, markedStart: newMarkedStart });
            }
          }
        }
        break;
      default:
        break;
    }
  }

  onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const { key } = e;

    if (e.ctrlKey) {
      this.handleCtrlKey(key);
    } else {
      this.handleKeyDown(key);
    }

    this.focus();
  }

  onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const { start } = this.state;
    this.setState({ start: start.concat(e.clipboardData.getData('Text')) });
  }

  handleBlur() {
    const { start, end, markedEnd, markedStart } = this.state;
    this.setState({
      start: start.concat(markedStart),
      end: end.concat(markedEnd),
      markedEnd: '',
      markedStart: '',
    });
  }

  handleCopy() {
    navigator.clipboard.writeText(this.getMarked());
  }

  handleCut() {
    this.handleCopy();
    this.setState({ markedEnd: '', markedStart: '' });
  }

  render() {
    const { blink, start, end, markedEnd, markedStart } = this.state;
    return (
      <span className="break-all" onClick={() => this.focus()}>
        <input
          onCut={this.handleCut}
          onCopy={this.handleCopy}
          onPaste={this.onPaste}
          value={this.getValue()}
          ref={this.input}
          onKeyDown={this.onKeyDown}
          type="text"
          className="text-white w-0"
          onBlur={this.handleBlur}
        />
        <span>{start}</span>
        <span className="bg-gray-400">{markedStart}</span>
        <span className={blink ? 'opacity-0' : ''}>|</span>
        <span className="bg-gray-400">{markedEnd}</span>
        <span>{end}</span>
      </span>
    );
  }
}

export default HiddenInput;
