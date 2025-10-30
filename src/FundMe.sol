// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract FundMe is Ownable, ReentrancyGuard {
    uint256 public totalReceived;
    mapping(address => uint256) public contributions;

    event Donated(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    receive() external payable { _donate(); }
    function donate() external payable { _donate(); }

    function _donate() internal {
        require(msg.value > 0, "No ETH sent");
        totalReceived += msg.value;
        contributions[msg.sender] += msg.value;
        emit Donated(msg.sender, msg.value);
    }

    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(address payable to, uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        require(amount <= address(this).balance, "Insufficient balance");
        to.transfer(amount);
        emit Withdrawn(to, amount);
    }
}
