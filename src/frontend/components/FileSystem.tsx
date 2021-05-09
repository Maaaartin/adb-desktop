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
import { Dictionary, get as getProp, isEmpty as emp, orderBy } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { Col, Row } from 'react-flexbox-grid';
import { FaCaretDown, FaCaretRight, FaSpinner } from 'react-icons/fa';
import { error as notifError, success } from 'react-notification-system-redux';
import { connect, ConnectedProps } from 'react-redux';
import { AdbFilePath, FileSystemData, TableSort } from '../../shared';
import { deleteFile, pullFile } from '../ipc/fileSystem';
import { getFiles } from '../ipc/getters';
import { GlobalState } from '../redux/reducers';
import Li from './subcomponents/Li';
import RefreshSearch from './subcomponents/RefreshSearch';

type Props = { serial: string };

type State = {
  search: string;
  sort: TableSort;
  opened: Dictionary<boolean>;
  delFilePath?: AdbFilePath;
  menuType?: string;
};
// TODO copy path
// TODO try delete option
// TODO select multiple
// TODO when files empty -> show text
// TODO convert bytes to mb

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
  private files: FileSystemData[] = [];
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

  private setFiles(files: FileSystemData[]) {
    console.log(files);
    this.files = files;
    this.forceUpdate();
  }

  private getRootFiles() {
    const { serial } = this.props;
    this.setFiles([]);
    getFiles(serial, '/', (error, output) => {
      if (!error && !emp(output)) {
        this.setFiles(output.children || []);
      }
    });
  }

  private entriesToStringArray() {
    const { files } = this;
    const internal = (children: FileSystemData[]) => {
      return children.reduce<string[]>((acc, curr) => {
        acc.push(curr.name);
        if (curr.children) {
          acc.push(...internal(curr.children || []));
        }
        return acc;
      }, []);
    };
    return files?.reduce<string[]>((acc, curr) => {
      acc.push(...internal(curr.children || []));
      return acc;
    }, []);
  }

  private toggleDir(id: string, item: FileSystemData) {
    const opened = { ...this.state.opened };
    const { serial } = this.props;
    if (!opened[id]) {
      opened[id] = true;
      getFiles(serial, id, (error, output) => {
        console.log(output);
        if (!error && !emp(output)) {
          item.children = output.children;
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
    file: FileSystemData
  ) {
    const opened = { ...this.state.opened };
    const pathStr = path.getPath();
    const open = opened[pathStr];
    const stats = file.stats;
    const children = file.children;
    return (
      <Li index={index} level={level} id={`${pathStr}`}>
        <ContextMenuTrigger
          collect={() => this.setState({ menuType: stats?.type })}
          id="context_menu"
        >
          <Row style={{ margin: 0 }}>
            <Col xs={4}>
              {/dir/.test(getProp(stats, 'type', '')) && (
                <span
                  onClick={() => this.toggleDir(pathStr, file)}
                  className="cursor-pointer inline-block mr-1"
                >
                  <FaCaretRight
                    size={20}
                    style={open ? { transform: 'rotate(90deg)' } : {}}
                  />
                </span>
              )}
              <span>{file.name}</span>
            </Col>
            <Col className="text-right" xs={2}>
              {stats?.size ? `${stats?.size} B` : '-'}
            </Col>
            <Col className="text-right" xs={3}>
              {stats?.mtime?.toDateString() || '-'}
            </Col>
            <Col className="text-right" xs={3}>
              {stats?.type}
            </Col>
          </Row>
          <Collapse in={open} timeout={0}>
            {emp(children) && open ? (
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
                  {this.sortEntries(children || []).map((child, subIndex) => {
                    return this.getFileItem(
                      subIndex,
                      level + 1,
                      path.clone().append(child.name),
                      child
                    );
                  })}
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

  private containsEntry(entry: FileSystemData, s: string): boolean {
    if (entry.name.includes(s)) {
      return true;
    } else if (entry.children) {
      return !!entry.children.find((e) => {
        return this.containsEntry(e, s);
      });
    } else {
      return false;
    }
  }

  private sortEntries(files: FileSystemData[]) {
    const { search, sort } = this.state;
    let entries = orderBy(
      files,
      (file) => {
        switch (sort.index) {
          case 0:
            return file.name;
          case 1:
            return file.stats?.size || 0;
          case 2:
            return moment(file.stats?.mtime);
          case 3:
            return file.stats?.type;
          default:
            return 0;
        }
      },
      sort.type
    );
    if (search) {
      entries = entries.filter((entry) => this.containsEntry(entry, search));
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
    const find = (items: FileSystemData[], s: string) => {
      return items?.find((item) => {
        return item.name === s;
      });
    };
    let dir = find(files, pathArr.shift() || '');
    while (pathArr.length) {
      const item = find(dir?.children || [], pathArr.shift() || '');
      if (item) {
        dir = item;
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
          getFiles(serial, parentPath, (error, output) => {
            if (!error) {
              const dir = this.getParentDir(delFilePath);
              if (dir) {
                dir.children = output.children;
                this.setFiles(this.files);
              }
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
    const entries = this.sortEntries(files);
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
              new AdbFilePath().append(entry.name),
              entry
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
