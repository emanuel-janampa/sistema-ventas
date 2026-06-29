import React, { useState, useMemo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import EmptyState from './EmptyState';

export default function DataTable({ columns, rows, onEdit, onDelete, defaultPageSize = 10, emptyTitle = 'Sin resultados', emptyDescription = 'No hay registros para mostrar.', emptyAction = null }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return rows || [];
    const q = query.toLowerCase();
    return (rows || []).filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
  }, [rows, query]);

  // Remove rows that are completely empty for the displayed columns
  const nonEmpty = useMemo(() => {
    const arr = filtered || [];
    return arr.filter((row) => {
      for (const col of columns) {
        try {
          const cell = col.render ? col.render(row) : row[col.field];
          if (cell === null || cell === undefined) continue;
          if (typeof cell === 'string') {
            if (cell.trim() === '') continue;
            return true;
          }
          // numbers (including 0) are valid
          if (typeof cell === 'number' && !Number.isNaN(cell)) return true;
          // JSX elements or objects -> consider non-empty
          return true;
        } catch (e) {
          // if render throws, treat as non-empty to avoid hiding rows incorrectly
          return true;
        }
      }
      return false;
    });
  }, [filtered, columns]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField size="small" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} />
      </Box>
      {nonEmpty.length === 0 ? (
        <Box sx={{ p: 4 }}>
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.field}>{col.headerName}</TableCell>
                ))}
                {(onEdit || onDelete) && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {nonEmpty.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id ?? `${page}-${idx}`}>
                  {columns.map(col => (
                    <TableCell key={col.field}>{col.render ? col.render(row) : row[col.field]}</TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      {onEdit && <Button size="small" variant="text" onClick={() => onEdit(row)}>Editar</Button>}
                      {onDelete && <Button size="small" variant="text" color="error" onClick={() => onDelete(row)}>Eliminar</Button>}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={nonEmpty.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
