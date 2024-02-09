"use client";
import Link from "next/link";
import Table from '@mui/joy/Table';
import Avatar from '@mui/joy/Avatar';
import Sheet from '@mui/joy/Sheet';
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

const DATA_FOR_TEST: User[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  avatar: "/solidity.svg",
  asset: "ETH",
  type: index % 2 === 0 ? "Buy" : "Sell",
  feeBalance: "0.270000 ETH / 0.00 USDC",
  orderBalance: "0.000000 ETH / 1.00 USDC",
  usdBalance: "5 690 USDC",
  link: "#",
}));

const TEXT_ORDERS = {
  title: 'My orders'
}

export default function Orders() {
  return (
    <div className="mt-[180px] h-screen flex flex-col items-center z-10 mb-20">
      <div className="xl:w-[1200px] w-11/12">
        <h1 className="self-start text-3xl font-bold">{TEXT_ORDERS.title}</h1>
        <Sheet color="primary" className="p-5 mt-5 rounded-3xl">
          <Table variant="plain">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column.uid}>{column.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATA_FOR_TEST.map((row) => (
                <tr key={row.id} >
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
              ))}
            </tbody>
          </Table>
        </Sheet>
      </div>
    </div>
  );
}
