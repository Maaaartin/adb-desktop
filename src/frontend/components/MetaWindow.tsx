import { Col, Row } from 'react-flexbox-grid';
import { CollectionFunctions, ItemMaker } from '../../shared';
import { ConnectedProps, connect } from 'react-redux';
import { Dictionary, isEmpty as emp, isNil } from 'lodash';
import React, { Component } from 'react';

import { GlobalState } from '../redux/reducers';
import RefreshSearch from './subcomponents/RefreshSearch';
import Scrollable from './subcomponents/Scrollable';
import SettableLi from './subcomponents/SettableLi';
import { Typography } from '@material-ui/core';
import { error as notifError } from 'react-notification-system-redux';

type Props<T> = {
  tag: string;
  serial: string;
  itemMaker: ItemMaker<T>;
} & CollectionFunctions<T>;

type State<T> = {
  search: string;
  collection: Dictionary<T>;
};

class MetaWindow<T> extends Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);

    this.state = {
      search: '',
      collection: {},
    };

    const { getter } = props;
    getter((output) => {
      if (!emp(output)) {
        this.setState({ collection: output });
      }
    });
  }

  render() {
    const { search, collection } = this.state;
    const {
      notifError,
      getter,
      onSearch,
      valueToString,
      tag,
      serial,
      itemMaker,
      itemMaker: { itemGetter, itemSetter },
    } = this.props as PropsRedux<T>;
    const arr = Object.entries(collection).filter((item) => {
      if (!onSearch || !search) return true;
      else return onSearch(item, search);
    });
    return (
      <div className="h-full">
        <Row className="pr-4 mb-2">
          <Col xs={12} sm={5}>
            <Typography className="p-2">
              {tag} of {serial}
            </Typography>
          </Col>
          <Col xs={12} sm={7}>
            <RefreshSearch
              collection={arr.map((i) => valueToString(i))}
              search={search}
              onRefrestClick={() =>
                getter((output) => this.setState({ collection: output }))
              }
              onSearchChange={(value) => this.setState({ search: value })}
            />
          </Col>
        </Row>
        <Scrollable style={{ height: '90%' }}>
          <ul className="border-black border-2 break-all h-full">
            {arr.map((item, index) => {
              return (
                <SettableLi
                  key={index}
                  index={index}
                  item={item}
                  itemMaker={itemMaker}
                  onSetValue={
                    itemSetter && itemGetter
                      ? (value) => {
                          itemSetter(item[0], value, (err) => {
                            if (err) {
                              notifError({
                                title: 'Operation failed',
                                message: err.message,
                                position: 'tr',
                              });
                            } else {
                              itemGetter(item[0], (output) => {
                                if (!isNil(output)) {
                                  const key = item[0];
                                  this.setState({
                                    collection: {
                                      ...collection,
                                      [key]: output,
                                    },
                                  });
                                }
                              });
                            }
                          });
                        }
                      : undefined
                  }
                />
              );
            })}
          </ul>
        </Scrollable>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return state;
};

const mapDispatchToProps = {
  notifError,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux<T> = Props<T> & ConnectedProps<typeof connector>;

export default connector(MetaWindow);
