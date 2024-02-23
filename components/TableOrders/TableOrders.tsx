import React, {useState, useEffect} from 'react'
import { 
  Avatar, 
  Sheet, 
  Table, 
  Box, 
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  IconButton
} from '@mui/joy'
import Link from 'next/link'
import { COLUMNS } from '@/app/orders/COLUMNS'
import './index.css'
import { UserPosition } from '@/app/types'
import MediaQuery from 'react-responsive'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import "@/app/font.css"


interface Props {
  loading: boolean
  orders: UserPosition[]
}

function labelDisplayedRows({
  from,
  to,
  count,
}: {
  from: number;
  to: number;
  count: number;
}) {
  return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
}

export const TableOrders = ({loading, orders}: Props) => {

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [visibleColumnsCount, setVisibleColumnsCount] = useState(5);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any, newValue: number | null) => {
    setRowsPerPage(parseInt(newValue!.toString(), 10));
    setPage(0);
  };

  const getLabelDisplayedRowsTo = () => {
    if (orders.length === -1) {
      return (page + 1) * rowsPerPage;
    }
    return rowsPerPage === -1
      ? orders.length
      : Math.min(orders.length, (page + 1) * rowsPerPage);
  };

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const ordersToShow = orders.slice(startIndex, endIndex);

  const updateVisibleColumns = () => {
    const width = window.innerWidth;
    if (width >= 769) {
      setVisibleColumnsCount(5);
    } else if (width >= 621 && width < 769) {
      setVisibleColumnsCount(4); 
    } else if (width >= 490 && width < 621) {
      setVisibleColumnsCount(3); 
    } else {
      setVisibleColumnsCount(2);
    }
  };

    useEffect(() => {
    window.addEventListener('resize', updateVisibleColumns);
    updateVisibleColumns(); 
    return () => {
      window.removeEventListener('resize', updateVisibleColumns);
    };
  }, []);

  return (
    <Sheet color="primary" className={`p-5 mt-5 rounded-3xl ${loading ? 'hidden' : 'visible'}`}>
    <Table variant="plain" sx={{ fontFamily: 'GothamPro' }}>
      <thead>
        <MediaQuery minWidth={769}>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column.uid}>{column.name}</th>
            ))}
          </tr>
        </MediaQuery>
        <MediaQuery maxWidth={768} minWidth={621}>
          <tr>
            {COLUMNS.filter(column => column.minWidth < 768).map((column) => (
              <th key={column.uid}>{column.name}</th>
            ))}
          </tr>
        </MediaQuery>
        <MediaQuery maxWidth={620} minWidth={490}>
          <tr>
            {COLUMNS.filter(column => column.minWidth < 620).map((column) => (
              <th key={column.uid}>{column.name}</th>
            ))}
          </tr>
        </MediaQuery>
        <MediaQuery maxWidth={489}>
          <tr>
            {COLUMNS.filter(column => column.minWidth < 490).map((column) => (
              <th key={column.uid}>{column.name}</th>
            ))}
          </tr>
        </MediaQuery>
      </thead>
      <tbody>
        {(ordersToShow.map((row) => (
          <tr key={row.id}>
            <td>
              <Link href={row.link} className="flex items-center">
                <Avatar alt="Avatar" src={row.avatar} className="mr-3" />
                <span>{row.asset}</span>
              </Link>
            </td>
            <td className={row.type === 'Sell' ? 'text-[#EF3131]' : 'text-[#6FEE8E]'}>{row.type}</td>
            <MediaQuery minWidth={620}>
              <td>{row.feeBalance}</td>
            </MediaQuery>
            <MediaQuery minWidth={490}>
              <td>{row.orderBalance}</td>
            </MediaQuery>
            <MediaQuery minWidth={769}>
              <td>{row.usdBalance}</td>
            </MediaQuery>
          </tr>
        )))}
      </tbody>
      <tfoot>
          <tr>
            <td colSpan={visibleColumnsCount}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <FormControl orientation="horizontal" size="sm">
                  <FormLabel>Rows per page:</FormLabel>
                  <Select onChange={handleChangeRowsPerPage} value={rowsPerPage}>
                    <Option value={5}>5</Option>
                    <Option value={10}>10</Option>
                    <Option value={25}>25</Option>
                  </Select>
                </FormControl>
                <Typography textAlign="center" sx={{ minWidth: 80 }}>
                  {labelDisplayedRows({
                    from: orders.length === 0 ? 0 : page * rowsPerPage + 1,
                    to: getLabelDisplayedRowsTo(),
                    count: orders.length === -1 ? -1 : orders.length,
                  })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="sm"
                    color="neutral"
                    variant="outlined"
                    disabled={page === 0}
                    onClick={() => handleChangePage(page - 1)}
                    sx={{ bgcolor: 'background.surface' }}
                  >
                    <KeyboardArrowLeftIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    color="neutral"
                    variant="outlined"
                    disabled={
                      orders.length !== -1
                        ? page >= Math.ceil(orders.length / rowsPerPage) - 1
                        : false
                    }
                    onClick={() => handleChangePage(page + 1)}
                    sx={{ bgcolor: 'background.surface' }}
                  >
                    <KeyboardArrowRightIcon />
                  </IconButton>
                </Box>
              </Box>
            </td>
          </tr>
        </tfoot>
    </Table>
  </Sheet>
  )
}
