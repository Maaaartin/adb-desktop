import { TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Dictionary } from 'lodash';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaSync } from 'react-icons/fa';
import { error as notifError } from 'react-notification-system-redux';
import { connect, ConnectedProps } from 'react-redux';
import { GlobalState } from '../redux/reducers';
import { ItemMaker } from '../types';
import IconBtn from './IconBtn';
import Scrollable from './Scrollable';
import SettableLi from './SettableLi';

type Props<T> = {
  getter: (cb: (output: Dictionary<T>) => void) => void;
  onSearch: (item: [string, T], text: string) => boolean;
  valueToString: (item: [string, T]) => string;
  tag: string;
  serial: string;
  itemMaker: ItemMaker<T>;
};

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
    getter((output) => this.setState({ collection: output }));
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
            <Row end="xs">
              <Col>
                <IconBtn
                  tag="Refresh"
                  IconEl={FaSync}
                  onClick={() =>
                    getter((output) => this.setState({ collection: output }))
                  }
                />
              </Col>
              <Col>
                <Autocomplete
                  style={{ width: '300px' }}
                  options={arr}
                  getOptionLabel={(option) => valueToString(option)}
                  onSelect={(e) =>
                    this.setState({ search: (e.target as any).value })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      value={search}
                      onChange={(e) =>
                        this.setState({ search: e.target.value })
                      }
                      label="Search"
                      variant="standard"
                    />
                  )}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Scrollable style={{ height: '90%' }}>
          <ul className="overflow-y-scroll border-black border-2 break-all h-full">
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
                            } else
                              itemGetter(item[0], (err, output) => {
                                this.setState({
                                  collection: {
                                    ...collection,
                                    [item[0]]: output,
                                  },
                                });
                              });
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
