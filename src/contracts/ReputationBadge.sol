// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Badge.sol";
import "./IBadgeFactory.sol";

contract ReputationBadge is Badge {
    IBadgeFactory internal badgeFactory;

    struct TokenParameters {
        address owner;
        bytes32 tokenId;
    }

    constructor(string memory badgeName_, string memory badgeSymbol_)
        Badge(badgeName_, badgeSymbol_)
    {
        badgeFactory = IBadgeFactory(msg.sender);
    }

    function mint(address to, bytes32 tokenId) external {
        require(msg.sender == badgeFactory.getBackendAddress(), "Unauthorized");
        _mint(to, tokenId);
    }

    function batchMint(TokenParameters[] memory tokensToMint) external {
        require(msg.sender == badgeFactory.getBackendAddress(), "Unauthorized");

        for (uint256 i = 0; i < tokensToMint.length; i++) {
            _mint(tokensToMint[i].owner, tokensToMint[i].tokenId);
        }
    }

    function burn(bytes32 tokenId) external {
        require(
            msg.sender == badgeFactory.getBackendAddress() ||
                msg.sender == ownerOf(tokenId),
            "Unauthorized"
        );
        _burn(tokenId);
    }
}
