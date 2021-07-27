import { AdbFilePath, FileSystemData, TableSort } from '../../shared';
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
import { Col, Row } from 'react-flexbox-grid';
import { ConnectedProps, connect } from 'react-redux';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import {
  Dictionary,
  isEmpty as emp,
  get as getProp,
  noop,
  orderBy,
  tap,
} from 'lodash';
import { FaCaretDown, FaCaretRight, FaSpinner } from 'react-icons/fa';
import React, { Component } from 'react';
import { error as notifError, success } from 'react-notification-system-redux';

import CreateDialog from './subcomponents/CreateDialog';
import { GlobalState } from '../redux/reducers';
import Li from './subcomponents/Li';
import RefreshSearch from './subcomponents/RefreshSearch';
import Scroll from './subcomponents/Scrollable';
import bytes from 'bytes';
import { typedIpcRenderer as ipc } from '../../ipcIndex';
import moment from 'moment';

type Props = { serial: string };

type State = {
  search: string;
  sort: TableSort;
  opened: Dictionary<boolean>;
  delFilePath?: AdbFilePath;
  mkdirPath?: AdbFilePath;
  menuType: string;
  cpPath?: AdbFilePath;
  touchPath?: AdbFilePath;
};
// TODO update after mkdir and cp

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
      menuType: '',
    };

    this.handleSortClick = this.handleSortClick.bind(this);
    this.getRootFiles = this.getRootFiles.bind(this);
    this.entriesToStringArray = this.entriesToStringArray.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleDelModalClick = this.handleDelModalClick.bind(this);
    this.setFiles = this.setFiles.bind(this);
    this.toggleDir = this.toggleDir.bind(this);
    this.handleMkdirModal = this.handleMkdirModal.bind(this);
    this.handleTouchModal = this.handleTouchModal.bind(this);
  }

  componentDidMount() {
    this.getRootFiles();
  }

  private setFiles(files: FileSystemData[]) {
    this.files = files;
    this.forceUpdate();
  }

  private getRootFiles() {
    const { serial } = this.props;
    this.setFiles([]);
    ipc.invoke('getFiles', serial, '/').then(({ output }) => {
      if (output) {
        this.setFiles(output.children || []);
      }
    }, noop);
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
    return internal(files);
  }

  private toggleDir(id: string, item: FileSystemData) {
    const opened = { ...this.state.opened };
    const { serial } = this.props;
    if (!opened[id]) {
      opened[id] = true;
      ipc.invoke('getFiles', serial, id).then(({ output }) => {
        if (output) {
          item.children = output.children;
          this.setFiles(this.files);
        }
      }, noop);
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
    const pathStr = path.toString();
    const open = opened[pathStr];
    const stats = file.stats;
    const children = file.children;
    return (
      <Li index={index} level={level} id={`${pathStr}`}>
        <ContextMenuTrigger
          collect={() => this.setState({ menuType: stats?.type || '' })}
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
              {stats?.size
                ? bytes(stats.size, {
                    unitSeparator: ' ',
                    thousandsSeparator: ' ',
                  })
                : '-'}
            </Col>
            <Col className="text-right" xs={3}>
              {stats?.mtime?.toDateString() || '-'}
            </Col>
            <Col className="text-right" xs={3}>
              {stats?.type || 'no access'}
            </Col>
          </Row>
          <Collapse in={open} timeout={0}>
            {!children && open ? (
              <Row style={{ margin: 0 }} center="xs">
                <FaSpinner
                  color="black"
                  size="25"
                  className="animate-spin m-auto"
                />
              </Row>
            ) : children?.length ? (
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
            ) : (
              'No files'
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
    _e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
    data: Dictionary<any>,
    target: HTMLElement
  ) {
    const { cpPath } = this.state;
    const { serial, success } = this.props as PropsRedux;
    switch (data.type) {
      case 'pull':
        ipc.invoke('pull', serial, triggerPath(target)).then(({ error }) => {
          if (!error) {
            success({
              title: 'File pulled',
              position: 'tr',
            });
          }
        }, noop);

        break;
      case 'delete':
        this.setState({ delFilePath: new AdbFilePath(triggerPath(target)) });
        break;
      case 'mkdir':
        this.setState({ mkdirPath: new AdbFilePath(triggerPath(target)) });
        break;
      case 'cp':
        this.setState({ cpPath: new AdbFilePath(triggerPath(target)) });
        break;
      case 'paste':
        {
          if (cpPath) {
            const destPath = triggerPath(target);
            ipc
              .invoke('cp', serial, cpPath?.toString(), destPath)
              .then(({ error }) => {
                if (!error) {
                  this.updateFiles(cpPath.getParent());
                  this.updateFiles(AdbFilePath.parse(destPath));
                  success({
                    title: 'File copied',
                    position: 'tr',
                  });
                }
              });
          }
        }
        break;
      case 'touch':
        this.setState({ touchPath: new AdbFilePath(triggerPath(target)) });
        break;
      default:
        break;
    }
  }

  private getDirFromPath(path?: AdbFilePath) {
    const { files } = this;
    const pathArr = path?.getPathArray();
    const internal = (
      collection?: FileSystemData[],
      dir?: string
    ): FileSystemData | undefined => {
      const match = collection?.find((item) => item.name === dir);
      const shift = pathArr?.shift();
      if (shift) {
        return internal(match?.children, shift);
      } else if (match) {
        return match;
      }
      return undefined;
    };
    return internal(files, pathArr?.shift());
  }

  private updateFiles(path?: AdbFilePath) {
    const { serial } = this.props;
    ipc
      .invoke('getFiles', serial, path?.toString() || '')
      .then(({ output }) => {
        if (output) {
          const dir = this.getDirFromPath(path);
          if (dir) {
            dir.children = output.children;
            this.setFiles(this.files);
          }
        }
      }, noop);
  }

  private handleTouchModal(fileName: string) {
    const { serial, success } = this.props as PropsRedux;
    const { touchPath } = this.state;
    tap(touchPath?.clone().append(fileName).toString(), (filePath) => {
      filePath &&
        ipc.invoke('touch', serial, filePath).then(({ error }) => {
          if (!error) {
            this.updateFiles(touchPath);
            success({
              title: 'File created',
              position: 'tr',
            });
          }
        }, noop);
    });

    this.setState({ touchPath: undefined });
  }

  private handleMkdirModal(dirName: string) {
    const { serial, success } = this.props as PropsRedux;
    const { mkdirPath } = this.state;
    const newDir = mkdirPath?.clone().append(dirName);
    ipc.invoke('mkdir', serial, newDir?.toString() || '').then(({ error }) => {
      if (!error) {
        this.updateFiles(mkdirPath);
        success({
          title: 'Directory created',
          position: 'tr',
        });
      }
    }, noop);

    this.setState({ mkdirPath: undefined });
  }

  handleDelModalClick() {
    const { serial, success } = this.props as PropsRedux;
    const { delFilePath } = this.state;
    const filePath = delFilePath?.toString() || '';
    ipc.invoke('rm', serial, filePath).then(({ error }) => {
      if (!error) {
        this.updateFiles(delFilePath?.getParent());
        success({
          title: 'File deleted',
          position: 'tr',
        });
      }
    }, noop);
    this.setState({ delFilePath: undefined });
  }

  private getContextMenu() {
    const { menuType, cpPath } = this.state;
    return (
      <ContextMenu id="context_menu">
        {!/dir/.test(menuType) ? (
          <MenuItem data={{ type: 'pull' }} onClick={this.handleClick}>
            Pull
          </MenuItem>
        ) : (
          menuType &&
          /dir/.test(menuType) && [
            <MenuItem data={{ type: 'mkdir' }} onClick={this.handleClick}>
              New Directory
            </MenuItem>,
            <MenuItem data={{ type: 'touch' }} onClick={this.handleClick}>
              New File
            </MenuItem>,
          ]
        )}
        <MenuItem data={{ type: 'delete' }} onClick={this.handleClick}>
          Delete
        </MenuItem>
        <MenuItem data={{ type: 'cp' }} onClick={this.handleClick}>
          Copy
        </MenuItem>
        {cpPath && (
          <MenuItem data={{ type: 'paste' }} onClick={this.handleClick}>
            Paste
          </MenuItem>
        )}
      </ContextMenu>
    );
  }

  render() {
    const { files } = this;
    const { sort, search, delFilePath, mkdirPath, touchPath } = this.state;
    const { serial } = this.props;
    const entries = this.sortEntries(files);
    return (
      <div className="h-full">
        {this.getContextMenu()}
        <CreateDialog
          open={!!touchPath}
          title="Create File"
          label="File Name"
          onClose={() => this.setState({ touchPath: undefined })}
          onConfirm={this.handleTouchModal}
        />
        <CreateDialog
          open={!!mkdirPath}
          title="Create Directory"
          label="Directory Name"
          onClose={() => this.setState({ mkdirPath: undefined })}
          onConfirm={this.handleMkdirModal}
        />
        <Dialog open={!!delFilePath}>
          <DialogTitle>Delete file</DialogTitle>
          <DialogContent>
            Do you want to delete {delFilePath?.toString()}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ delFilePath: undefined })}>
              Cancel
            </Button>
            <Button onClick={this.handleDelModalClick}>OK</Button>
          </DialogActions>
        </Dialog>
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
        <Scroll
          style={{ height: 'calc(100% - 85px)' }}
          className="border-black border-2 break-all h-full"
        >
          <ul>
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
        </Scroll>
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
