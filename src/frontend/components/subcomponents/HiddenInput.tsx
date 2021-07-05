import React, { Component, KeyboardEvent } from 'react';

import BlinkCursor from './BlinkCursor';
import { Button } from '@material-ui/core';
import { List } from 'immutable';

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
  history?: List<string>;
  onEnter?: (value: string) => void;
  onEscape?: (value?: string) => void;
  markedColor?: string;
  textColor?: string;
  disabled?: boolean;
  buttonText?: string;
  onBtnClick?: (value: string) => void;
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
    this.handleShiftKey = this.handleShiftKey.bind(this);
    this.handleCtrlShiftKey = this.handleCtrlShiftKey.bind(this);
    this.handleDefaultKey = this.handleDefaultKey.bind(this);
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
      focused: true,
      ...this.getEmptyMarked(),
    });
    this.input.current?.focus();
  }

  getMarked() {
    const { markedEnd, markedStart } = this.state;
    return markedStart.concat(markedEnd);
  }

  handleDefaultKey(key: string) {
    const { start } = this.state;
    if (key.length === 1) {
      this.setState({ start: start.concat(key) });
    }
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
            const start = history.get(index + 1, '');

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
              this.setState({ start: history.last('') });
            } else {
              this.setState({ start: history.get(index - 1, '') });
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
        this.handleDefaultKey(key);
        break;
    }
  }

  handleShiftKey(key: string) {
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
              this.setState({
                start: newStart,
                markedStart: newMarkedStart,
              });
            }
          }
        }
        break;
      case 'Home':
        this.setState({
          markedStart: start,
          start: '',
          end: markedEnd.concat(end),
          markedEnd: '',
        });
        break;
      case 'End':
        this.setState({
          markedEnd: end,
          end: '',
          start: start.concat(markedStart),
          markedStart: '',
        });
        break;
      default:
        this.handleDefaultKey(key);
        break;
    }
  }

  handleCtrlShiftKey(key: string) {
    const { start, end } = this.state;
    switch (key) {
      case 'ArrowLeft':
        {
          const char = start.slice(start.length - 1);
          if (char) {
            this.setState({
              start: start.slice(0, start.length - 1),
              end: char.concat(end),
            });
          }
        }
        break;
      case 'ArrowRight':
        {
          const char = end.slice(0, 1);
          if (char) {
            this.setState({
              start: start.concat(char),
              end: end.slice(1),
            });
          }
        }
        break;
      default:
        this.handleDefaultKey(key);
        break;
    }
  }

  onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const { key } = e;
    if (e.shiftKey) {
      if (e.ctrlKey || e.metaKey) {
        this.handleCtrlShiftKey(key);
      } else {
        this.handleShiftKey(key);
      }
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
    const {
      markedColor,
      textColor,
      disabled,
      buttonText,
      onBtnClick,
    } = this.props;
    const { start, end, markedEnd, markedStart, focused } = this.state;
    return (
      <span
        className="break-all"
        onClick={() => this.focus()}
        style={{ color: textColor }}
      >
        <input
          onChange={() => null}
          onCut={this.handleCut}
          onCopy={this.handleCopy}
          onPaste={this.onPaste}
          value={this.getValue()}
          ref={this.input}
          onKeyDown={this.onKeyDown}
          type="text"
          className="w-0"
          onBlur={this.handleBlur}
          disabled={disabled}
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
        {buttonText && (
          <Button
            style={{ maxHeight: '25px' }}
            onClick={() => onBtnClick?.(this.getValue())}
          >
            Set
          </Button>
        )}
      </span>
    );
  }
}

export default HiddenInput;
