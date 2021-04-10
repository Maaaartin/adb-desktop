import { Collapse, Divider, Typography } from '@material-ui/core';
import { isEmpty as emp, orderBy } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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

const fileTypeToString = (item: ExecFileSystemData) => {
  if (item.type === 'no-access') {
    return 'No access';
  } else if (item.type === 'dir') {
    return 'Directory';
  } else return 'File';
};

const FileItem = (props: {
  serial: string;
  entry: [string, FileSystemData];
  index: number;
  path: string;
  level: number;
}) => {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<FileSystemEntry>({});
  const {
    entry: [name, data],
    index,
    path,
    serial,
    level,
  } = props;
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
                      setChildren(output);
                    }
                  });
                } else {
                  setChildren({});
                }
                setOpen(!open);
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
          {fileTypeToString(data)}
        </Col>
      </Row>
      <Collapse in={open}>
        <Divider />
        <ul>
          {emp(children) && open && (
            <Row style={{ margin: 0 }} center="xs">
              <FaSpinner
                color="black"
                size="25"
                className="animate-spin m-auto"
              />
            </Row>
          )}
          {Object.entries(children).map((subEntry, subIndex) => {
            return (
              <FileItem
                serial={serial}
                entry={subEntry}
                index={subIndex}
                path={`${path}/${subEntry[0]}`}
                level={level + 1}
              />
            );
          })}
        </ul>
        <Divider />
      </Collapse>
    </Li>
  );
};

const HeaderItem = (props: {
  size: number;
  tag: string;
  onClick?: () => void;
}) => {
  const { size, tag, onClick } = props;
  return (
    <Col onClick={onClick} xs={size} className="cursor-pointer">
      <div className="float-right">
        <span className="inline-block mr-1 text-right">
          <FaCaretDown
            size={15}
            style={true ? { transform: 'rotate(180deg)' } : {}}
          />
        </span>
        <span>{tag}</span>
      </div>
    </Col>
  );
};

const FileSystem = (props: { serial: string }) => {
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState<FileSystemEntry>({});
  const [sort, setSort] = useState<TableSort>({ type: 'asc', index: 0 });
  const { serial } = props;
  useEffect(() => {
    getFiles(serial, '/', (error, output) => {
      if (!error) {
        setFiles(output);
      }
    });
  }, []);
  const handleSortClick = (index: number) => {
    if (index === sort.index) {
      const sortType = sort.type == 'asc' ? 'desc' : 'asc';
      setSort({ index, type: sortType });
    } else {
      setSort({ index, type: 'asc' });
    }
  };
  const entries = orderBy(
    Object.entries(files),
    ([key, value]) => {
      switch (sort.index) {
        case 0:
          return key;
        case 1:
          return value.size;
        case 2:
          return moment(value.date);
        case 3:
          return value.type;
      }
    },
    sort.type
  );
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
            onSearchChange={(value) => setSearch(value)}
          />
        </Col>
      </Row>
      <Row style={{ width: 'calc(100% - 17px)' }} center="xs">
        <HeaderItem size={4} tag="Name" onClick={() => handleSortClick(0)} />
        <HeaderItem size={2} tag="Size" onClick={() => handleSortClick(1)} />
        <HeaderItem size={3} tag="Date" onClick={() => handleSortClick(2)} />
        <HeaderItem size={3} tag="Type" onClick={() => handleSortClick(3)} />
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
          return (
            <FileItem
              serial={serial}
              entry={entry}
              index={index}
              path={`/${entry[0]}`}
              level={0}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default FileSystem;
