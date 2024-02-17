import { Avatar, Sheet, Table } from '@mui/joy'
import Link from 'next/link'
import { COLUMNS } from '@/app/orders/COLUMNS'
import './index.css'
import { UserPosition } from '@/app/types'

interface Props {
  loading: boolean
  orders: UserPosition[]
}

export const TableOrders = ({loading, orders}: Props) => {
  return (
    <Sheet color="primary" className={`p-5 mt-5 rounded-3xl ${loading ? 'hidden' : 'visible'}`}>
    <Table variant="plain" sx={{ fontFamily: 'GothamPro' }}>
      <thead>
        <tr>
          {COLUMNS.map((column) => (
            <th key={column.uid}>{column.name}</th>
          ))}
        </tr>
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
            <td>{row.feeBalance}</td>
            <td>{row.orderBalance}</td>
            <td>{row.usdBalance}</td>
          </tr>
        )))}
      </tbody>
    </Table>
  </Sheet>
  )
}
