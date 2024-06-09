import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

import type { YieldFarming } from "../../types/contracts/YieldFarming";
import type { YieldFarming__factory } from "../../types/factories/contracts/YieldFarming__factory";


export async function deployYieldFarmingFixture() {
  // Contracts are deployed using the first signer/account by default
  const [owner, address1, address2] = await ethers.getSigners();

  const YieldFarming = (await ethers.getContractFactory("YieldFarming")) as YieldFarming__factory;
  const yieldFarming = (await YieldFarming.deploy("YieldToken", "YTK", 2)) as YieldFarming;
  const yieldFarming_address = await yieldFarming.getAddress();

  return {
    yieldFarming,
    yieldFarming_address,
    owner,
    address1,
    address2
  }
}
