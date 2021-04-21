import React, { FC } from "react";
import { shortenAddress } from "src/utils/frontend/evm";

type NavBarProps = {
  isConnected: boolean;
  address?: string;
  networkName: string;
  onAddressClick: () => void;
};
const NavBar: FC<NavBarProps> = ({
  isConnected,
  address,
  networkName,
  onAddressClick,
}) => {
  return (
    <nav>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 text-white">
        <h2 className="text-2xl leading-tight font-medium ">InterRep</h2>
        <div className="flex items-stretch justify-center">
          <div className=" flex items-center rounded-2xl bg-gray-600">
            <div className="flex items-center pl-3">
              {isConnected ? networkName : "Not connected"}
              <span
                className={`inline-block h-2 w-2 mx-1 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>

            <button
              onClick={onAddressClick}
              className="font-bold text-lg px-2 border rounded-2xl border-gray-500 bg-gray-900 focus:outline-none"
            >
              {isConnected && address
                ? shortenAddress(address)
                : "Connect wallet"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
