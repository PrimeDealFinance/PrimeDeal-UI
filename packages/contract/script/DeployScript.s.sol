// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import {PositionManager} from "../src/PositionManager.sol";

contract DeployScript is Script {
    function run() external {
        address nonfungiblePositionManager = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88;
        address uniswapFactory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
        address wmatic = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889;
        vm.startBroadcast();

        // Deploy PositionManager
        PositionManager pm = new PositionManager(
            nonfungiblePositionManager,
            uniswapFactory,
            wmatic
        );
        console.log("PositionManager deployed to:", address(pm));

        vm.stopBroadcast();
    }
}
