// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Badge.sol";

contract BadgeMock is Badge {
    constructor(string memory name_, string memory symbol_)
        Badge(name_, symbol_)
    {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}
