"use client";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import { COLUMNS } from "@/app/orders/COLUMNS";

type User = {
  id: number;
  avatar: string;
  asset: string;
  type: string;
  feeBalance: string;
  orderBalance: string;
  usdBalance: string;
  link: string;
};

const DATA_FOR_TEST: User[] = [
  {
    id: 1,
    avatar: "/sovaOrder.jpeg",
    asset: "ETH",
    type: "Buy",
    feeBalance: "0.270000 ETH / 0.00 USDC",
    orderBalance: "0.000000 ETH / 1.00 USDC",
    usdBalance: "1.00",
    link: "#",
  },
  {
    id: 2,
    avatar: "/sovaOrder.jpeg",
    asset: "ETH",
    type: "Sell",
    feeBalance: "0.270000 ETH / 0.00 USDC",
    orderBalance: "0.000000 ETH / 1.00 USDC",
    usdBalance: "1.00",
    link: "#",
  },
  {
    id: 3,
    avatar: "/sovaOrder.jpeg",
    asset: "ETH",
    type: "Sell",
    feeBalance: "0.270000 ETH / 0.00 USDC",
    orderBalance: "0.000000 ETH / 1.00 USDC",
    usdBalance: "1.00",
    link: "#",
  },
]

export default function Orders() {
  return (
    <div className="flex flex-col h-screen flex flex-col items-center">
      <div className="p-[20px] xl:w-[1262px] w-11/12 border-1-solid-#3D59AD rounded-[15px] bg-[#7980A580] mt-[110px]">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableCell key={column.uid}>{column.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {DATA_FOR_TEST.map((row) => (
                <TableRow key={row.id} >
                  <TableCell>
                    <Link href={row.link} className="flex items-center">
                      <Avatar alt="Avatar" src={row.avatar} className="mr-3" />
                      <span>{row.asset}</span>
                    </Link>
                  </TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.feeBalance}</TableCell>
                  <TableCell>{row.orderBalance}</TableCell>
                  <TableCell>{row.usdBalance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
