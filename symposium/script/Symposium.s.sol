// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/symposium.sol";

contract SymposiumScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        Symposium symposium = new Symposium();
        console.log("Symposium deployed to:", address(symposium));

        vm.stopBroadcast();
    }
}