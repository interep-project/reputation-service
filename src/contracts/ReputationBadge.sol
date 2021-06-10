// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ReputationBadge is
    Initializable,
    ERC721Upgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    ERC721BurnableUpgradeable
{
    address private _backendAddress;
    string private _baseTokenURI;

    struct MintParameters {
        address to;
        uint256 tokenId;
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address backendAddress_
    ) public initializer {
        __Context_init_unchained();
        __Pausable_init_unchained();
        __Ownable_init_unchained();
        __ERC165_init_unchained();
        __ERC721_init_unchained(name_, symbol_);
        __ERC721Burnable_init_unchained();

        _backendAddress = backendAddress_;
    }

    modifier onlyBackend {
        require(msg.sender == _backendAddress, "Unauthorized");
        _;
    }

    function backendAddress() public view returns (address) {
        return _backendAddress;
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 tokenId) public onlyBackend {
        _safeMint(to, tokenId);
    }

    function batchMint(MintParameters[] memory tokensToMint)
        external
        onlyBackend
    {
        for (uint256 i = 0; i < tokensToMint.length; i++) {
            _safeMint(tokensToMint[i].to, tokensToMint[i].tokenId);
        }
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function changeBackendAddress(address newBackendAddress) public onlyOwner {
        _backendAddress = newBackendAddress;
    }

    function changeBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
