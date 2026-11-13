import { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, type TableSortDirection } from '@yuki-ui/react';

const revisions = [{ name: '界面规范', size: 24 }, { name: '项目说明', size: 8 }];
export default function FileTable() {
  const [direction, setDirection] = useState<TableSortDirection>(null);
  const files = direction ? [...revisions].sort((a, b) => direction === 'asc' ? a.size - b.size : b.size - a.size) : revisions;
  return (
    <Table bordered>
      <TableCaption>文档大小</TableCaption>
      <TableHeader><TableRow><TableHead>名称</TableHead><TableHead sortable sortDirection={direction} onSortChange={setDirection}>大小</TableHead></TableRow></TableHeader>
      <TableBody>{files.map(file => <TableRow key={file.name}><TableCell>{file.name}</TableCell><TableCell>{file.size} KB</TableCell></TableRow>)}</TableBody>
    </Table>
  );
}
