import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@material-ui/core';
import { Dictionary, isEmpty as emp, orderBy } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { Col, Row } from 'react-flexbox-grid';
import { error as notifError, success } from 'react-notification-system-redux';
import { FaCaretDown, FaCaretRight, FaSpinner } from 'react-icons/fa';
import { deleteFile, pullFile } from '../ipc/fileSystem';
import { getFiles } from '../ipc/getters';
import {
  AdbFilePath,
  ExecFileSystemData,
  FileSystemAccess,
  FileSystemData,
  FileSystemEntry,
  TableSort,
} from '../../shared';
import Li from './subcomponents/Li';
import RefreshSearch from './subcomponents/RefreshSearch';
import { GlobalState } from '../redux/reducers';
import { connect, ConnectedProps } from 'react-redux';

type Props = { serial: string };

type State = {
  search: string;
  sort: TableSort;
  opened: Dictionary<boolean>;
  delFilePath?: AdbFilePath;
  menuType?: FileSystemAccess;
};

const entryToFSEntry = (entry: [string, FileSystemData]) => {
  return { [entry[0]]: entry[1] };
};

const triggerPath = (el: HTMLElement): string => {
  // id starting with slash is a path
  if (el.id[0] === '/') {
    return el.id.slice(1);
  } else if (el.parentElement) {
    return triggerPath(el.parentElement);
  } else {
    return '';
  }
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
  private files: FileSystemEntry = {};
  constructor(props: Props) {
    super(props);

    this.state = {
      search: '',
      sort: { type: 'asc', index: 0 },
      opened: {},
    };

    this.handleSortClick = this.handleSortClick.bind(this);
    this.getRootFiles = this.getRootFiles.bind(this);
    this.entriesToStringArray = this.entriesToStringArray.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleDelModalClick = this.handleDelModalClick.bind(this);
    this.setFiles = this.setFiles.bind(this);
    this.toggleDir = this.toggleDir.bind(this);

    this.getRootFiles();
  }

  private setFiles(files: FileSystemEntry) {
    this.files = files;
    this.forceUpdate();
  }

  private getRootFiles() {
    const { serial } = this.props;
    this.setFiles({});
    getFiles(serial, '/', (error, output) => {
      if (!error && !emp(output)) {
        this.setFiles(output);
      }
    });
  }

  private entriesToStringArray() {
    const { files } = this;
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

  private toggleDir(id: string, item: FileSystemData) {
    const opened = { ...this.state.opened };
    const { serial } = this.props;
    if (!opened[id]) {
      opened[id] = true;
      getFiles(serial, id, (error, output) => {
        if (!error && !emp(output)) {
          item.children = output;
          this.setFiles(this.files);
        }
      });
    } else {
      // closing subfolders
      Object.entries(opened).forEach(([key, value]) => {
        if (value && AdbFilePath.isChildOf(id, key)) {
          delete opened[key];
        }
      });
      delete item.children;
      delete opened[id];
    }
    this.setState({ opened });
  }

  private getFileItem(
    index: number,
    level: number,
    path: AdbFilePath,
    entry: FileSystemEntry
  ) {
    const { sort } = this.state;
    const opened = { ...this.state.opened };
    const name = Object.keys(entry)[0];
    const data = Object.values(entry)[0];
    const pathStr = path.getPath();
    const open = opened[pathStr];
    return (
      <Li index={index} level={level} id={`${pathStr}`}>
        <ContextMenuTrigger
          collect={() => this.setState({ menuType: data.type })}
          id="context_menu"
        >
          <Row style={{ margin: 0 }}>
            <Col xs={4}>
              {data.type === 'dir' && (
                <span
                  onClick={() => this.toggleDir(pathStr, data)}
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
                        path.clone().append(subEntry[0]),
                        entryToFSEntry(subEntry)
                      );
                    }
                  )}
                </ul>
              </>
            )}
          </Collapse>
        </ContextMenuTrigger>
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
        this.containsEntry(entryToFSEntry(entry), search)
      );
    }
    return entries;
  }

  handleClick(
    e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
    data: Dictionary<any>,
    target: HTMLElement
  ) {
    const { serial, notifError, success } = this.props as PropsRedux;
    switch (data.type) {
      case 'pull':
        pullFile(serial, triggerPath(target), (error) => {
          if (error) {
            notifError({
              title: 'Could not pull file',
              message: error.message,
              position: 'tr',
            });
            // TODO send file as param
          } else {
            success({
              title: 'Deleted',
              position: 'tr',
            });
          }
        });
        break;
      case 'delete':
        this.setState({ delFilePath: new AdbFilePath(triggerPath(target)) });
        break;
      default:
        break;
    }
  }

  private getParentDir(path: AdbFilePath) {
    const { files } = this;
    const pathArr = path.getPathArray();
    pathArr.pop();
    let dir = files[pathArr.shift() || ''];
    while (pathArr.length) {
      const el = pathArr.shift();
      if (el && dir?.children?.[el]) {
        dir = dir?.children?.[el];
      }
    }
    return dir;
  }

  handleDelModalClick() {
    const { serial, notifError, success } = this.props as PropsRedux;
    const { delFilePath } = this.state;
    const parentPath = delFilePath?.getParent() || '';
    const filePath = delFilePath?.getPath() || '';
    deleteFile(serial, filePath, (error) => {
      if (error) {
        notifError({
          title: 'Could not delete file',
          message: error.message,
          position: 'tr',
        });
      } else {
        if (delFilePath) {
          const dir = this.getParentDir(delFilePath);
          getFiles(serial, parentPath, (error, output) => {
            if (!error) {
              dir.children = output;
              this.setFiles(this.files);
            }
          });
        }
        success({
          title: 'File deleted',
          position: 'tr',
        });
      }
    });
    this.setState({ delFilePath: undefined });
  }

  render() {
    const { files } = this;
    const { sort, search, delFilePath, menuType } = this.state;
    const { serial } = this.props;
    const entries = this.sortEntries(files, sort);
    return (
      <div className="h-full">
        <Dialog open={!!delFilePath}>
          <DialogTitle>Delete file</DialogTitle>
          <DialogContent>
            Do you want to delete {delFilePath?.getPath()}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ delFilePath: undefined })}>
              Cancel
            </Button>
            <Button onClick={this.handleDelModalClick}>OK</Button>
          </DialogActions>
        </Dialog>
        <ContextMenu id="context_menu">
          {menuType === 'file' && (
            <MenuItem data={{ type: 'pull' }} onClick={this.handleClick}>
              Pull
            </MenuItem>
          )}
          {menuType !== 'no-access' && (
            <MenuItem data={{ type: 'delete' }} onClick={this.handleClick}>
              Delete
            </MenuItem>
          )}
        </ContextMenu>
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
              new AdbFilePath().append(entry[0]),
              entryToFSEntry(entry)
            );
          })}
        </ul>
      </div>
    );
  }
}
const mapStateToProps = (state: GlobalState) => {
  return state;
};

const mapDispatchToProps = {
  notifError,
  success,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = Props & ConnectedProps<typeof connector>;

export default connector(FileSystem);
