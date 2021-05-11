// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Controlled is Ownable {
    address internal _backendAddress;

    constructor(address backendAddress_) {
        _backendAddress = backendAddress_;
    }

    function getBackendAddress() public view virtual returns (address) {
        return _backendAddress;
    }

    function setBackendAddress(address newBackendAddress) external onlyOwner {
        _backendAddress = newBackendAddress;
    }
}
