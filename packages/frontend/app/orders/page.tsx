"use client"
import React from "react"
import Image from "next/image"
import { Tabs, Tab } from "@nextui-org/tabs"
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/table";
import { User } from "@nextui-org/user";
import  Link  from "next/link";
import { columns, orders } from "@/app/orders/data"
import HeaderNotConnect from "./headerNotConnect";
//import anyBalance from "./anyBalance";
import fetchData from "./fetchData";

type Order = typeof orders[0];

export default function Orders() {
  //anyBalance();
  fetchData();

    const renderCell = React.useCallback((order: Order, columnKey: React.Key) => {
        const cellValue = order[columnKey as keyof Order];

        switch (columnKey) {
            case "asset":
              return (
                <User
                  avatarProps={{src: order.avatar}}
                  description={(
                    <Link href={{pathname: order.link}}>
                        <div className="text-[#006FEE] text-[14px] hover:text-[#002E62] font-medium">
                            Open
                        </div>
                    </Link>
                  )}
                  name={cellValue}
                />
            );
            
            case "type":
              return (
                  <p className="text-bold text-sm capitalize">{cellValue}</p>
            );

            case "feeBalance":
              return (
                <p className="text-bold text-sm capitalize">{cellValue}</p>
            );

            case "orderBalance":
              return (
                <p className="text-bold text-sm capitalize">{cellValue}</p>
              );

            case "usdBala":
                return (
                  <p className="text-bold text-sm capitalize">{cellValue}</p>
            );

            default:
              return cellValue;
          }
        }, []);
      

    return (
        <>
        <HeaderNotConnect />
        <div className="flex flex-col h-screen flex flex-col items-center">
            <div className="p-[20px] xl:w-[1262px] w-8/12 border-1-solid-#3D59AD rounded-[15px] bg-[#7980A580] mt-[110px]" >
                <Tabs variant="underlined" aria-label="Orders">
                    <Tab key="active-orders" title="Active Orders">
                        <Table isStriped aria-label="Active Orders Table">
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn key={column.uid}>
                                     {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={orders}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab key="orders-history" title="Orders History">
                        <Table aria-label="Orders History Table">
                            <TableHeader>
                                <TableColumn>Asset</TableColumn>
                                <TableColumn>Type</TableColumn>
                                <TableColumn>Fee Balance</TableColumn>
                                <TableColumn>Order Balance</TableColumn>
                                <TableColumn>Balance, USD</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
                        </Table>
                    </Tab>
                </Tabs>
            </div>
        </div>
        </>
    );
}
