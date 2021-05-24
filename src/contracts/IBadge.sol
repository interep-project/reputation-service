// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBadge {
    /**
     * @dev Emitted when `tokenId` token is minted to `to`.
     * @param to The address that received the token
     * @param tokenId The id of the token that was minted
     * @param timestamp Block timestamp from when the token was minted
     */
    event Minted(
        address indexed to,
        bytes32 indexed tokenId,
        uint256 timestamp
    );

    /**
     * @dev Emitted when `tokenId` token is burned.
     * @param owner The address that used to own the token
     * @param tokenId The id of the token that was burned
     * @param timestamp Block timestamp from when the token was burned
     */
    event Burned(
        address indexed owner,
        bytes32 indexed tokenId,
        uint256 timestamp
    );

    /**
     * @dev Returns the badge's name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the badge's symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for the badge.
     */
    function URI() external view returns (string memory);

    /**
     * @dev Returns the ID of the token owned by `owner`, if it owns one, and 0 otherwise
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     */
    function tokenOf(address owner) external view returns (bytes32);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(bytes32 tokenId) external view returns (address);
}
