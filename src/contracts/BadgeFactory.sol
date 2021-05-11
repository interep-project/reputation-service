// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Controlled.sol";
import "./ReputationBadge.sol";
import "./IBadgeFactory.sol";

contract BadgeFactory is IBadgeFactory, Controlled {
    event BadgeDeployed(string badgeName, address badgeAddress);

    constructor(address backendAddress_) Controlled(backendAddress_) {}

    function getBackendAddress()
        public
        view
        override(IBadgeFactory, Controlled)
        returns (address)
    {
        return Controlled.getBackendAddress();
    }

    function deployBadge(string memory badgeName, string memory badgeSymbol)
        public
        override
        onlyOwner
        returns (bool)
    {
        ReputationBadge newBadge = new ReputationBadge(badgeName, badgeSymbol);

        emit BadgeDeployed(badgeName, address(newBadge));
        return true;
    }
}
