import { Col, Row } from 'react-flexbox-grid';
import { Collapse, Divider, TextField } from '@material-ui/core';
import { ConnectedProps, connect } from 'react-redux';
import { Dictionary, isEmpty as emp } from 'lodash';
import React, { Component, DetailedHTMLProps } from 'react';

import CollapseButton from './subcomponents/CollapseButton';
import { FaLink } from 'react-icons/fa';
import { GlobalState } from '../redux/reducers';
import { HTMLAttributes } from 'enzyme';
import IconBtn from './subcomponents/IconBtn';
import { ItemMaker } from '../../shared';
import Li from './subcomponents/Li';
import MetaWindow from './MetaWindow';
import StyledValue from './subcomponents/StyledValue';
import { tabAdd } from '../redux/actions';

type Props<T> = {
  getter?: (cb: (output: Dictionary<T>) => void) => void;
  tag: string;
  onSearch?: (item: [string, T], text: string) => boolean;
  valueToString?: (item: [string, T]) => string;
  itemMaker?: ItemMaker<T>;

  serial: string;
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

  componentDidUpdate(_prevProps: Props<T>, prevState: State<T>) {
    const { open: prevOpen } = prevState;
    const { open } = this.state;
    const { getter } = this.props;

    if (!open && prevOpen) {
      this.setState({ collection: {} });
    }

    if (open && !prevOpen) {
      getter?.((output) => {
        if (!emp(output)) {
          this.setState({ collection: output });
        }
      });
    }
  }

  render() {
    const {
      style,
      className,
      itemMaker,
      children,
      tag,
      onSearch,
      getter,
      tabAdd,
      valueToString,
      serial,
    } = this.props as PropsRedux<T>;
    const { open, collection, search } = this.state;
    const hasProps = !!onSearch && !!getter && !!itemMaker;
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
                tag="Open in a new tab"
                onClick={() => {
                  getter &&
                    onSearch &&
                    itemMaker &&
                    valueToString &&
                    tabAdd(tag, () => (
                      <MetaWindow
                        getter={getter}
                        itemMaker={itemMaker as any}
                        onSearch={onSearch as any}
                        valueToString={valueToString as any}
                        tag={tag}
                        serial={serial}
                      />
                    ));
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
                  <Li index={index}>
                    {itemMaker && [
                      itemMaker.createKey && itemMaker.createKey(item),
                      itemMaker.delimiter && itemMaker.delimiter,
                      itemMaker.createValue &&
                        (itemMaker.styleValue
                          ? StyledValue(itemMaker.createValue(item))
                          : itemMaker.createValue(item)),
                    ]}
                  </Li>
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

const mapStateToProps = (state: GlobalState) => {
  return state;
};

const mapDispatchToProps = {
  tabAdd,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux<T> = Props<T> & ConnectedProps<typeof connector>;

export default connector(DeviceItem);
