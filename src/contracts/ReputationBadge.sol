// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Badge.sol";
import "./Controlled.sol";

contract ReputationBadge is Badge, Controlled {
    constructor(
        string memory badgeName_,
        string memory badgeSymbol_,
        address backendAddress_
    ) Badge(badgeName_, badgeSymbol_) Controlled(backendAddress_) {}

    function mint(address to, uint256 tokenId) external {
        require(msg.sender == _backendAddress, "Unauthorized");
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) external {
        require(
            msg.sender == _backendAddress || msg.sender == ownerOf(tokenId),
            "Unauthorized"
        );
        _burn(tokenId);
    }
}
