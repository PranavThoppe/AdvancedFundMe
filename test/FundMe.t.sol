// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/FundMe.sol";

contract FundMeTest is Test {
    FundMe fund;
    address user = address(0x1234);

    function setUp() public {
        fund = new FundMe(address(this));
    }

    function testDonateIncreasesTotalReceived() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        fund.donate{value: 0.1 ether}();

        assertEq(fund.totalReceived(), 0.1 ether);
        assertEq(fund.contributions(user), 0.1 ether);
    }
}
