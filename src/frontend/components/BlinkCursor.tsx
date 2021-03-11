import React, { Component } from 'react';

type State = { blink: boolean };

class BlinkCursor extends Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      blink: false,
    };
  }

  componentDidMount() {
    setInterval(() => {
      const { blink } = this.state;
      return this.setState({ blink: !blink });
    }, 500);
  }

  render() {
    const { blink } = this.state;
    return <span className={blink ? 'opacity-0' : ''}>|</span>;
  }
}

export default BlinkCursor;
