import { Collapse, Divider, Typography } from '@material-ui/core';
import { Dictionary, isEmpty as emp, orderBy } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaCaretDown, FaCaretRight, FaSpinner } from 'react-icons/fa';
import { getDir as getFiles } from '../ipc/getters';
import { ExecFileSystemData, FileSystemEntry, TableSort } from '../types';
import Li from './subcomponents/Li';
import RefreshSearch from './subcomponents/RefreshSearch';

type Props = { serial: string };

type State = {
  search: string;
  files: FileSystemEntry;
  sort: TableSort;
  opened: Dictionary<boolean>;
};

const HeaderItem = (props: {
  size: number;
  tag: string;
  index: number;
  sort: TableSort;
  onClick?: () => void;
}) => {
  const { size, tag, onClick, sort, index } = props;
  return (
    <Col onClick={onClick} xs={size} className="cursor-pointer">
      <div className="float-right">
        {sort.index === index && (
          <span className="inline-block mr-1 text-right">
            <FaCaretDown
              size={15}
              style={
                sort.type === 'desc' ? { transform: 'rotate(180deg)' } : {}
              }
            />
          </span>
        )}
        <span>{tag}</span>
      </div>
    </Col>
  );
};

class FileSystem extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      search: '',
      files: {},
      sort: { type: 'asc', index: 0 },
      opened: {},
    };

    this.handleSortClick = this.handleSortClick.bind(this);

    getFiles(props.serial, '/', (error, output) => {
      if (!error) {
        this.setState({ files: output });
      }
    });
  }

  private getFileItem(
    index: number,
    level: number,
    path: string,
    entry: FileSystemEntry
  ) {
    const { serial } = this.props;
    const { sort, files, opened } = this.state;
    const data = entry[1];
    const open = opened[path];
    return (
      <Li index={index} level={level}>
        <Row style={{ margin: 0 }}>
          <Col xs={4}>
            {data.type === 'dir' && (
              <span
                onClick={() => {
                  if (!open) {
                    getFiles(serial, path, (error, output) => {
                      if (!error && !emp(output)) {
                        data.children = output;
                        this.setState({ files });
                      }
                    });
                  } else {
                    delete data.children;
                    this.setState({ files });
                  }
                  opened[path] = !open;
                  this.setState({ opened });
                }}
                className="cursor-pointer inline-block mr-1"
              >
                <FaCaretRight
                  size={20}
                  style={open ? { transform: 'rotate(90deg)' } : {}}
                />
              </span>
            )}
            <span>{entry[0]}</span>
          </Col>
          <Col className="text-right" xs={2}>
            {data.size ? `${data.size} B` : '-'}
          </Col>
          <Col className="text-right" xs={3}>
            {data.date?.toDateString() || '-'}
          </Col>
          <Col className="text-right" xs={3}>
            {this.fileTypeToString(data)}
          </Col>
        </Row>
        <Collapse in={open}>
          {emp(data.children) && open ? (
            <Row style={{ margin: 0 }} center="xs">
              <FaSpinner
                color="black"
                size="25"
                className="animate-spin m-auto"
              />
            </Row>
          ) : (
            <>
              <Divider />
              <ul>
                {this.sortEntries(data.children || {}, sort).map(
                  (subEntry, subIndex) => {
                    return this.getFileItem(
                      subIndex,
                      level + 1,
                      `${path}/${subEntry[0]}`,
                      subEntry as any
                    );
                  }
                )}
              </ul>
            </>
          )}
        </Collapse>
      </Li>
    );
  }

  private handleSortClick(index: number) {
    const { sort } = this.state;
    if (index === sort.index) {
      const sortType = sort.type == 'asc' ? 'desc' : 'asc';
      this.setState({ sort: { index, type: sortType } });
    } else {
      this.setState({ sort: { index, type: 'asc' } });
    }
  }

  private fileTypeToString(item: ExecFileSystemData) {
    if (item.type === 'no-access') {
      return 'No access';
    } else if (item.type === 'dir') {
      return 'Directory';
    } else return 'File';
  }

  private sortEntries(files: FileSystemEntry, sort: TableSort) {
    return orderBy(
      Object.entries(files),
      ([key, value]) => {
        switch (sort.index) {
          case 0:
            return key;
          case 1:
            return value.size || 0;
          case 2:
            return value.date ? moment(value.date) : moment(0);
          case 3:
            return value.type;
          default:
            return 0;
        }
      },
      sort.type
    );
  }

  render() {
    const { sort, files, search } = this.state;
    const { serial } = this.props;
    const entries = this.sortEntries(files, sort);
    return (
      <div className="h-full">
        <Row className="pr-4 mb-2">
          <Col xs={12} sm={5}>
            <Typography className="p-2">File system of {serial}</Typography>
          </Col>
          <Col xs={12} sm={7}>
            <RefreshSearch
              collection={[]}
              search={search}
              onRefrestClick={() => null}
              onSearchChange={(value) => this.setState({ search: value })}
            />
          </Col>
        </Row>
        <Row style={{ width: 'calc(100% - 17px)' }} center="xs">
          <HeaderItem
            index={0}
            sort={sort}
            size={4}
            tag="Name"
            onClick={() => this.handleSortClick(0)}
          />
          <HeaderItem
            index={1}
            sort={sort}
            size={2}
            tag="Size"
            onClick={() => this.handleSortClick(1)}
          />
          <HeaderItem
            index={2}
            sort={sort}
            size={3}
            tag="Date"
            onClick={() => this.handleSortClick(2)}
          />
          <HeaderItem
            index={3}
            sort={sort}
            size={3}
            tag="Type"
            onClick={() => this.handleSortClick(3)}
          />
        </Row>
        <ul
          className="overflow-y-scroll border-black border-2 break-all h-full"
          style={{ height: 'calc(100% - 90px)' }}
        >
          {emp(files) && (
            <Row style={{ margin: 0 }} center="xs">
              <FaSpinner
                color="black"
                size="25"
                className="animate-spin m-auto"
              />
            </Row>
          )}
          {entries.map((entry, index) => {
            return this.getFileItem(index, 0, `/${entry[0]}`, entry as any);
          })}
        </ul>
      </div>
    );
  }
}

export default FileSystem;
