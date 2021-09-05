import { Col, Row } from 'react-flexbox-grid';
import { CollectionFunctions, ItemMaker } from '../../shared';
import { ConnectedProps, connect } from 'react-redux';
import { Dictionary, isEmpty as emp, isNil } from 'lodash';
import React, { Component } from 'react';
import { error as notifError, warning } from 'react-notification-system-redux';

import { GlobalState } from '../redux/reducers';
import RefreshSearch from './subcomponents/RefreshSearch';
import Scrollable from './subcomponents/Scrollable';
import SettableLi from './subcomponents/SettableLi';
import { Typography } from '@material-ui/core';

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
      warning,
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
        <Scrollable
          style={{ height: 'calc(90% - 100px)' }}
          className="border-black border-2"
        >
          <ul className="break-all h-full">
            {arr.map((item, index) => {
              return (
                <SettableLi
                  key={index}
                  index={index}
                  item={item}
                  itemMaker={itemMaker}
                  onSetValue={
                    itemSetter &&
                    itemGetter &&
                    ((value) => {
                      const key = item[0];
                      itemSetter(key, value, (err) => {
                        if (err) {
                          notifError({
                            title: 'Operation failed',
                            message: err.message,
                            position: 'tr',
                          });
                        } else {
                          itemGetter(key, (output) => {
                            const prevValue = collection[key];
                            if (output === prevValue) {
                              warning({
                                title: 'Value could not be set.',
                                position: 'tr',
                              });
                            } else if (!isNil(output)) {
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
                    })
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
  warning,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux<T> = Props<T> & ConnectedProps<typeof connector>;

export default connector(MetaWindow);
