// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import {PositionManager} from "../src/PositionManager.sol";

contract DeployScript is Script {
    function run() external {
        address nonfungiblePositionManager = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88;
        address uniswapFactory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
        vm.startBroadcast();

        // Deploy PositionManager
        PositionManager pm = new PositionManager(nonfungiblePositionManager,uniswapFactory);
        console.log("PositionManager deployed to:", address(pm));

        vm.stopBroadcast();
    }
}
/*
ДЕПЛОЙ С ВЕРИФИКАЦИЕЙ ЭТИМ СКРИПТОМ. ПРОПИСАТЬ ТУТ СВОЙ ПРИВАТНИК. ОБРАТИТЬ ВНИМАНИЕ НА RPC
forge create 
--rpc-url 'https://lb.drpc.org/ogrpc?network=polygon-mumbai&dkey=AmvHqebJ6k7ThQWeGwnLVmnsDTC3hx0R7qTGrkUU-y5L' 
--private-key '2b31898648bddb145bf821a1ЗАМЕНИТЬНАСВОЙ'  
--constructor-args 0xC36442b4a4522E871399CD717aBDD847Ab11FE88 0x1F98431c8aD98523631AE4a59f267346ea31F984 
--verify 
--legacy 
--etherscan-api-key 'R93KQB2UG493H148YUSDFQH9498RV9AJIJ'  
src/PositionManager.sol:PositionManager
                
*/