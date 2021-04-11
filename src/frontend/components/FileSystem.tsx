import { Collapse, Divider, Typography } from '@material-ui/core';
import { Dictionary, isEmpty as emp, orderBy } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaCaretDown, FaCaretRight, FaSpinner } from 'react-icons/fa';
import { getDir as getFiles } from '../ipc/getters';
import {
  ExecFileSystemData,
  FileSystemData,
  FileSystemEntry,
  TableSort,
} from '../types';
import Li from './subcomponents/Li';
import RefreshSearch from './subcomponents/RefreshSearch';

type Props = { serial: string };

type State = {
  search: string;
  files: FileSystemEntry;
  sort: TableSort;
  opened: Dictionary<boolean>;
};
// TODO fix closing subfiles
const entryToFSEntry = (entry: [string, FileSystemData]) => {
  return { [entry[0]]: entry[1] };
};

const HeaderItem = (props: {
  size: number;
  tag: string;
  index: number;
  sort: TableSort;
  onClick?: (index: number) => void;
}) => {
  const { size, tag, onClick, sort, index } = props;
  return (
    <Col onClick={() => onClick?.(index)} xs={size} className="cursor-pointer">
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
    this.getRootFiles = this.getRootFiles.bind(this);
    this.entriesToStringArray = this.entriesToStringArray.bind(this);

    this.getRootFiles();
  }

  private getRootFiles() {
    const { serial } = this.props;
    this.setState({ files: {} });
    getFiles(serial, '/', (error, output) => {
      if (!error && !emp(output)) {
        this.setState({ files: output, opened: {} });
      }
    });
  }

  private entriesToStringArray() {
    const { files } = this.state;
    const internal = (entries: FileSystemEntry) => {
      return Object.entries(entries).reduce<string[]>((acc, curr) => {
        const children = curr[1].children;
        acc.push(curr[0]);
        if (children) {
          Object.entries(children).forEach((entry) => {
            acc.push(...internal(entryToFSEntry(entry)));
          });
        }
        return acc;
      }, []);
    };
    return Object.entries(files).reduce<string[]>((acc, curr) => {
      acc.push(...internal(entryToFSEntry(curr)));
      return acc;
    }, []);
  }

  private getFileItem(
    index: number,
    level: number,
    path: string,
    entry: FileSystemEntry
  ) {
    const { serial } = this.props;
    const { sort, files, opened } = this.state;
    const name = Object.keys(entry)[0];
    const data = Object.values(entry)[0];
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
            <span>{name}</span>
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
        <Collapse in={open} timeout={0}>
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
                      { [subEntry[0]]: subEntry[1] }
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

  private containsEntry(entry: FileSystemEntry, s: string): boolean {
    const key = Object.keys(entry)[0];
    const value = Object.values(entry)[0];
    if (key.includes(s)) {
      return true;
    } else if (value.children) {
      return !!Object.entries(value.children).find((e) => {
        return this.containsEntry(entryToFSEntry(e), s);
      });
    } else {
      return false;
    }
  }

  private sortEntries(files: FileSystemEntry, sort: TableSort) {
    const { search } = this.state;
    let entries = orderBy(
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
    if (search) {
      entries = entries.filter((entry) =>
        this.containsEntry({ [entry[0]]: entry[1] }, search)
      );
    }
    return entries;
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
              collection={this.entriesToStringArray()}
              search={search}
              onRefrestClick={() => this.getRootFiles()}
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
            onClick={this.handleSortClick}
          />
          <HeaderItem
            index={1}
            sort={sort}
            size={2}
            tag="Size"
            onClick={this.handleSortClick}
          />
          <HeaderItem
            index={2}
            sort={sort}
            size={3}
            tag="Date"
            onClick={this.handleSortClick}
          />
          <HeaderItem
            index={3}
            sort={sort}
            size={3}
            tag="Type"
            onClick={this.handleSortClick}
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
            return this.getFileItem(
              index,
              0,
              `/${entry[0]}`,
              entryToFSEntry(entry)
            );
          })}
        </ul>
      </div>
    );
  }
}

export default FileSystem;
