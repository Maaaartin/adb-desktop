import React, { Component, KeyboardEvent, useState } from 'react';

type State = {
  start: string;
  end: string;
  markedStart: string;
  markedEnd: string;
  focused: boolean;
};

type Props = {
  ref?: React.RefObject<HiddenInput>;
  initValue?: string;
  history?: string[];
  onEnter?: (value: string) => void;
  onEscape?: (value?: string) => void;
  markedColor?: string;
};

const BlinkCursor = () => {
  const [blink, setBlink] = useState(false);
  setTimeout(() => {
    setBlink(!blink);
  }, 500);
  return <span className={blink ? 'opacity-0' : ''}>|</span>;
};

class HiddenInput extends Component<Props, State> {
  private input = React.createRef<HTMLInputElement>();
  constructor(props: Props) {
    super(props);
    const start = props.initValue || '';
    this.state = {
      start: start,
      end: '',
      markedEnd: '',
      markedStart: '',
      focused: true,
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
  }

  getEmptyMarked() {
    return { markedEnd: '', markedStart: '' };
  }

  getValue() {
    const { start, end } = this.state;
    return start.concat(this.getMarked(), end);
  }

  isMarked() {
    const { markedEnd, markedStart } = this.state;
    return markedEnd || markedStart;
  }

  focus() {
    const { start, end, markedEnd, markedStart } = this.state;
    this.setState({
      start: start.concat(markedStart),
      end: end.concat(markedEnd),
      markedEnd: '',
      markedStart: '',
      focused: true,
    });
    this.input.current?.focus();
  }

  getMarked() {
    const { markedEnd, markedStart } = this.state;
    return markedStart.concat(markedEnd);
  }

  handleKeyDown(key: string) {
    const { start, end, markedEnd, markedStart } = this.state;
    switch (key) {
      case 'Escape':
        {
          const { onEscape } = this.props;
          onEscape?.(this.getValue());
        }
        break;
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
          if (history) {
            const value = this.getValue();
            const index = history.indexOf(value);
            if (!value) {
              this.setState({ start: history[history.length - 1] });
            } else {
              this.setState({ start: history[index - 1] || '' });
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
            ...this.getEmptyMarked(),
          });
        }
        break;
      case 'ArrowRight':
        {
          let newStart: string;
          let newEnd: string;
          if (this.isMarked()) {
            newEnd = end;
            newStart = start.concat(this.getMarked());
          } else {
            newStart = start.concat(end.slice(0, 1));
            newEnd = end.slice(1);
          }

          this.setState({
            start: newStart,
            end: newEnd,
            ...this.getEmptyMarked(),
          });
        }
        break;
      case 'Backspace':
        {
          if (this.isMarked()) this.setState(this.getEmptyMarked());
          else this.setState({ start: start.slice(0, start.length - 1) });
        }
        break;
      case 'Delete':
        {
          if (this.isMarked()) this.setState(this.getEmptyMarked());
          else this.setState({ end: end.slice(1) });
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
  }

  onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const { start } = this.state;
    this.setState({ start: start.concat(e.clipboardData.getData('Text')) });
  }

  handleBlur() {
    this.setState({ focused: false });
  }

  handleCopy() {
    navigator.clipboard.writeText(this.getMarked());
  }

  handleCut() {
    this.handleCopy();
    this.setState(this.getEmptyMarked());
  }

  render() {
    const { markedColor } = this.props;
    const { start, end, markedEnd, markedStart, focused } = this.state;
    return (
      <span className="break-all" onClick={() => this.focus()}>
        <input
          onChange={() => null}
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
        <span className="bg-gray-400" style={{ backgroundColor: markedColor }}>
          {markedStart}
        </span>
        {focused && <BlinkCursor />}
        <span className="bg-gray-400" style={{ backgroundColor: markedColor }}>
          {markedEnd}
        </span>
        <span>{end}</span>
      </span>
    );
  }
}

export default HiddenInput;
