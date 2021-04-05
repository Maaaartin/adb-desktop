import { Collapse, Typography } from '@material-ui/core';
import { clone } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaCaretRight } from 'react-icons/fa';
import { getDir } from '../ipc/getters';
import { FileSystemEntry } from '../types';
import Li from './subcomponents/Li';
import RefreshSearch from './subcomponents/RefreshSearch';
import Scrollable from './subcomponents/Scrollable';

const FileItem = (props: {
  serial: string;
  item: FileSystemEntry;
  index: number;
  path: string;
  level: number;
}) => {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<FileSystemEntry[]>([]);
  const { item, index, path, serial, level } = props;
  return (
    <Li index={index} style={{ paddingLeft: `${level * 15}px` }}>
      <Row style={{ margin: 0 }}>
        {item.type === 'dir' && (
          <Col
            onClick={() => {
              if (!open) {
                getDir(serial, path, (error, output) => {
                  setChildren(output);
                });
              }
              setOpen(!open);
            }}
            className="cursor-pointer"
          >
            <FaCaretRight style={open ? { transform: 'rotate(90deg)' } : {}} />
          </Col>
        )}
        <Col>{item.name}</Col>
      </Row>
      <Collapse in={open}>
        <ul>
          {children.map((item2, index2) => {
            return (
              <FileItem
                serial={serial}
                item={item2}
                index={index2}
                path={`${path}/${item2.name}`}
                level={level + 1}
              />
            );
          })}
        </ul>
      </Collapse>
    </Li>
  );
};

const FileSystem = (props: { serial: string }) => {
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState<FileSystemEntry[]>([]);
  const { serial } = props;
  useEffect(() => {
    getDir(serial, '/', (error, output) => {
      setFiles(output);
    });
  }, []);
  return (
    <div className="h-full">
      {' '}
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
          {files.map((item, index) => {
            return (
              <FileItem
                serial={serial}
                item={clone(item)}
                index={index}
                path={`/${item.name}`}
                level={0}
              />
            );
          })}
        </ul>
      </Scrollable>
    </div>
  );
};

// class FileSystem extends Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     const { serial } = props;
//     this.state = {
//       search: '',
//       files: [],
//     };

//     getDir(serial, '/', (error, output) => {
//       this.setState({ files: output });
//     });
//   }

//   render() {
//     const { serial } = this.props;
//     const { search, files } = this.state;
//     const filesClone = clone(files);
//     return (
//       <div className="h-full">
//         {' '}
//         <Row className="pr-4 mb-2">
//           <Col xs={12} sm={5}>
//             <Typography className="p-2">File system of {serial}</Typography>
//           </Col>
//           <Col xs={12} sm={7}>
//             <RefreshSearch
//               collection={[]}
//               search={search}
//               onRefrestClick={() => null}
//               onSearchChange={(value) => this.setState({ search: value })}
//             />
//           </Col>
//         </Row>
//         <Scrollable style={{ height: '90%' }}>
//           <ul className="overflow-y-scroll border-black border-2 break-all h-full">
//             {filesClone.map((item, index) => {
//               return (
//                 <FileItem
//                   serial={serial}
//                   item={item}
//                   index={index}
//                   path={`/${item.name}`}
//                 />
//               );
//             })}
//           </ul>
//         </Scrollable>
//       </div>
//     );
//   }
// }

export default FileSystem;
