"use client"
import React from "react"
import Image from "next/image"
import { Tabs, Tab } from "@nextui-org/tabs"
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/table";



export default function Orders() {

    return (
        <div className="flex flex-col h-screen flex flex-col items-center">
            <div className="w-[1262px] border-1-solid-#3D59AD rounded-[15px] bg-[#7980A580] mt-[110px]" >
                <Tabs variant="underlined" aria-label="Orders">
                    <Tab key="active-orders" title="Active Orders">
                        <Table aria-label="Active Orders Table">
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
    );
}
