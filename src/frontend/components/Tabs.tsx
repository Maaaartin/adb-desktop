import { ConnectedProps, connect } from 'react-redux';
import React, { Component } from 'react';
import { Tab, tabAdd, tabDel } from '../redux/actions';
import {
  isEmpty as emp,
  floor,
  get as getProp,
  set as setProp,
  slice,
  sortBy,
  tap,
} from 'lodash';

import { Chip } from '@material-ui/core';
import Draggable from 'react-draggable';
import { GlobalState } from '../redux/reducers';
import { Row } from 'react-flexbox-grid';
import Scrollable from './subcomponents/Scrollable';

type Props = { tabs: Tab[] };
type State = { tabs: Tab[]; selected: string; dragged: string };

class Tabs extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      tabs: [],
      selected: '',
      dragged: '',
    };

    this.onStop = this.onStop.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onDrag = this.onDrag.bind(this);
  }

  componentDidUpdate(prevProps: PropsRedux) {
    const { tabs: prevTabs } = prevProps;
    const { tabs } = this.props;

    if (prevTabs.length < tabs.length) {
      this.setState({ tabs: tabs, selected: tabs[tabs.length - 1].id });
    } else if (prevTabs.length > tabs.length)
      this.setState({
        tabs: tabs,
        selected: !emp(tabs) ? tabs[tabs.length - 1].id : '',
      });
  }

  onClose(id: string) {
    const { tabs, tabDel } = this.props as PropsRedux;
    tabDel(id);
    this.setState({ selected: getProp(tabs, [tabs.length - 2, 'id'], '') });
  }

  onSelect(id: string) {
    this.setState({ selected: id });
  }

  onStop() {
    const { tabs } = this.state;
    const newTabs = sortBy(
      document.getElementsByClassName(
        'handle'
      ) as HTMLCollectionOf<HTMLElement>,
      (tab: HTMLElement) => [
        floor(tab.getBoundingClientRect().y * 10, -2),
        floor(tab.getBoundingClientRect().x * 10, -2),
      ]
    )
      .map((tab1) => tabs.find((tab2) => tab1.id === tab2.id))
      .filter((tab) => tab) as Tab[];

    this.setState({ tabs: newTabs, dragged: '' }, () => {
      tap(
        document.getElementById('tab-scrollbar'),
        (el) =>
          el &&
          setProp(
            el,
            'classList',
            slice(el.className, 0, el.className.indexOf('ps')).join('')
          )
      );
    });
  }

  onDrag(id: string) {
    const { dragged } = this.state;
    if (!dragged) this.setState({ dragged: id });
  }

  render() {
    const { tabs, selected, dragged } = this.state;
    return (
      <div style={{ height: '100%' }}>
        <Row>
          <Scrollable id="tab-scrollbar" className="hello">
            <ul className=" flex">
              {tabs.map((tab, index) => {
                return (
                  <Draggable
                    key={index}
                    axis="both"
                    handle=".handle"
                    defaultPosition={{ x: 0, y: 0 }}
                    position={{ x: 0, y: 0 }}
                    grid={[25, 25]}
                    scale={1}
                    onStop={this.onStop}
                    onDrag={() => this.onDrag(tab.id)}
                  >
                    <li
                      key={index}
                      className="float-left handle cursor-pointer p-2"
                      id={tab.id}
                      onClick={() => this.onSelect(tab.id)}
                    >
                      {dragged === tab.id ? (
                        '|'
                      ) : (
                        <Chip
                          style={
                            dragged && dragged != tab.id
                              ? {
                                  backgroundColor: 'transparent',
                                  border: 'solid 1px',
                                }
                              : selected === tab.id
                              ? { backgroundColor: '#b1b3b5' }
                              : {}
                          }
                          label={tab.name}
                          onDelete={() => this.onClose(tab.id)}
                        />
                      )}
                    </li>
                  </Draggable>
                );
              })}
            </ul>
          </Scrollable>
        </Row>
        <Row style={{ height: 'calc(100% - 115px)' }}>
          {tabs.map((tab, index) => (
            <div
              key={index}
              style={{ width: '95%', height: '95%' }}
              className={`ml-4 rounded-lg bg-gray-400${
                selected === tab.id ? '' : ' hidden'
              }`}
            >
              {tab.content}
            </div>
          ))}
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    tabs: state.ui.tabs.toArray(),
  };
};

const mapDispatchToProps = {
  tabAdd,
  tabDel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = Props & ConnectedProps<typeof connector>;

export default connector(Tabs as any);
