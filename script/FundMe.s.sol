// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {FundMe} from "../src/FundMe.sol";

contract DeployFundMe is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("OWNER_ADDRESS");

        vm.startBroadcast(pk);
        FundMe fund = new FundMe(owner);
        vm.stopBroadcast();

        console2.log("FundMe deployed at:", address(fund));
    }
}
