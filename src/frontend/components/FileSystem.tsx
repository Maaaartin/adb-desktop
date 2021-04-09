import { Collapse, Divider, Typography } from '@material-ui/core';
import { isEmpty as emp } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaCaretRight, FaSpinner } from 'react-icons/fa';
import { getDir as getFiles } from '../ipc/getters';
import { FileSystemData, FileSystemEntry } from '../types';
import Li from './subcomponents/Li';
import RefreshSearch from './subcomponents/RefreshSearch';
import Scrollable from './subcomponents/Scrollable';

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
    <Li index={index} style={{ paddingLeft: `${level * 15}px` }}>
      <Row style={{ margin: 0 }}>
        {data.type === 'dir' && (
          <Col
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
            className="cursor-pointer"
          >
            <FaCaretRight
              size={20}
              style={open ? { transform: 'rotate(90deg)' } : {}}
            />
          </Col>
        )}
        <Col xs={5}>{name}</Col>
        <Col xs={4}>{data.date?.toDateString()}</Col>
        <Col>{data.type === 'no-access' && 'No Access'}</Col>
      </Row>
      <Collapse in={open}>
        <ul>
          {emp(children) && open && (
            <FaSpinner
              color="black"
              size="25"
              className="animate-spin m-auto"
            />
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

const FileSystem = (props: { serial: string }) => {
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState<FileSystemEntry>({});
  const { serial } = props;
  useEffect(() => {
    getFiles(serial, '/', (error, output) => {
      if (!error) {
        setFiles(output);
      }
    });
  }, []);
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
      <Scrollable style={{ height: '90%' }}>
        <ul className="overflow-y-scroll border-black border-2 break-all h-full">
          {emp(files) && (
            <FaSpinner
              color="black"
              size="25"
              className="animate-spin m-auto"
            />
          )}
          {Object.entries(files).map((entry, index) => {
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
      </Scrollable>
    </div>
  );
};

export default FileSystem;
