// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBadgeFactory {
    function getBackendAddress() external view returns (address);

    function deployBadge(string memory badgeName, string memory badgeSymbol)
        external
        returns (bool);
}
