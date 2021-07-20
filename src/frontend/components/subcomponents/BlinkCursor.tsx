import React, { Component } from 'react';

class BlinkCursor extends Component<any, { blink: boolean }> {
  private interval?: NodeJS.Timeout;
  constructor(props: any) {
    super(props);

    this.state = {
      blink: false,
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const { blink } = this.state;
      return this.setState({ blink: !blink });
    }, 500);
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  render() {
    const { blink } = this.state;
    return <span className={blink ? 'opacity-0' : ''}>|</span>;
  }
}

export default BlinkCursor;
