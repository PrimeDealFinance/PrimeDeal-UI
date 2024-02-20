import { Avatar, Sheet, Table } from '@mui/joy'
import Link from 'next/link'
import { COLUMNS } from '@/app/orders/COLUMNS'
import './index.css'
import { UserPosition } from '@/app/types'
import MediaQuery from 'react-responsive'

interface Props {
  loading: boolean
  orders: UserPosition[]
}

export const TableOrders = ({loading, orders}: Props) => {
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
        {(orders.map((row) => (
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
    </Table>
  </Sheet>
  )
}
