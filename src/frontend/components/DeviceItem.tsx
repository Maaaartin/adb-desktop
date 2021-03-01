import { Collapse, Divider, TextField } from '@material-ui/core';
import { HTMLAttributes } from 'enzyme';
import { Dictionary, isEmpty as emp } from 'lodash';
import React, { Component, DetailedHTMLProps } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaLink } from 'react-icons/fa';
import CollapseButton from './CollapseButton';
import IconBtn from './IconBtn';
import { Tab, tabAdd } from '../redux/actions';
import { connect, ConnectedProps } from 'react-redux';
import MetaWindow from './MetaWindow';

type Props<T> = {
  getter?: (cb: (output: Dictionary<T>) => void) => void;
  tag: string;
  createItem?: (item: [string, T]) => any;
  onSearch?: (item: [string, T], text: string) => boolean;
  valueToString?: (item: [string, T]) => string;
} & DetailedHTMLProps<HTMLAttributes, any>;

type State<T> = {
  collection: Dictionary<T>;
  open: boolean;
  search: string;
};

class DeviceItem<T> extends Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);

    this.state = {
      open: false,
      collection: {},
      search: '',
    };
  }

  componentDidUpdate(prevProps: Props<T>, prevState: State<T>) {
    const { open: prevOpen } = prevState;
    const { open } = this.state;
    const { getter } = this.props;

    if (!open && prevOpen) {
      this.setState({ collection: {} });
    }

    if (open && !prevOpen) {
      getter?.((output) => {
        this.setState({ collection: output });
      });
    }
  }

  render() {
    const {
      style,
      className,
      createItem,
      children,
      tag,
      onSearch,
      getter,
      tabAdd,
      valueToString,
    } = this.props as PropsRedux<T>;
    const { open, collection, search } = this.state;
    const hasProps = !!onSearch && !!getter && !!createItem;
    const arr = Object.entries(collection).filter((item) => {
      if (!onSearch || !search) return true;
      else return onSearch(item, search);
    });
    return (
      <>
        <Row middle="xs" style={{ minHeight: '70px' }}>
          <Col xs={3}>
            <CollapseButton
              style={style}
              className={className}
              tag={tag}
              open={open}
              onClick={() => this.setState({ open: !open })}
            />
          </Col>
          {hasProps && [
            <Col xs={6}>
              <IconBtn
                className="float-right"
                IconEl={FaLink}
                tag="Open in a new window"
                onClick={() => {
                  getter &&
                    onSearch &&
                    createItem &&
                    valueToString &&
                    tabAdd(
                      new Tab(
                        tag,
                        (
                          <MetaWindow
                            getter={getter}
                            createItem={createItem}
                            onSearch={onSearch}
                            valueToString={valueToString}
                          />
                        )
                      )
                    );
                }}
              />
            </Col>,
            <Col xs={3}>
              <TextField
                onChange={(e) => this.setState({ search: e.target.value })}
                value={search}
                label="Search"
                variant="standard"
              />
            </Col>,
          ]}
        </Row>
        <Collapse
          in={open}
          className="max-h-64"
          style={{
            overflowY: 'scroll',
            overflowX: 'hidden',
            marginRight: '-17px',
          }}
        >
          {children}
          {collection && (
            <ul>
              {arr.map((item, index) => {
                return (
                  <li
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-400' : ''}
                  >
                    {createItem?.(item)}
                  </li>
                );
              })}
            </ul>
          )}
        </Collapse>
        <Divider />
      </>
    );
  }
}

const mapStateToProps = (state: Dictionary<any>) => {
  return state;
};

const mapDispatchToProps = {
  tabAdd,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux<T> = Props<T> & ConnectedProps<typeof connector>;

export default connector(DeviceItem);
