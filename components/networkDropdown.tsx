"use client"
import React from "react"
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button, Avatar, User } from "@nextui-org/react"
import { useWalletStore } from "@/service/store"



const SwitchNetworkDropdown = () => {
    const {networks, switchNetwork} = useWalletStore()
    return (
        <Dropdown>
            <DropdownTrigger>
                <Avatar
                    radius="full"
                    as="button"
                    className="transition-transform"
                    src="/matic.svg"
                />
            </DropdownTrigger>
        <DropdownMenu
          aria-label="Static Actions"
          onAction={(key: any) => switchNetwork(key)}
        >
          {networks.map((network) => (
            <DropdownItem key={network.chainId}>
              <User 
                name  = {network.name}
                avatarProps={{
                  src: "matic.svg"
                }}
                />
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    )

}

export default SwitchNetworkDropdown