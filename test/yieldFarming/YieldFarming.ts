import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { deployYieldFarmingFixture } from "./YieldFarming.fixture";

describe("YieldFarming", () => {
    before(async function () {
        this.signers = {} as Signers;

        const signers = await ethers.getSigners();
        this.signers.admin = signers[0];
        
        this.loadFixture = loadFixture;
    });

    describe("Deployment", function () {
        beforeEach(async function() {
            const {yieldFarming,
                yieldFarming_address,
                owner,
                address1,
                address2} = await this.loadFixture(deployYieldFarmingFixture);
            
                this.yieldFarming = yieldFarming;
                this.yieldFarming_address = yieldFarming_address;
                this.owner = owner;
                this.address1 = address1;
                this.address2 = address2;
        });

        it("Should set the right owner", async function () {
            expect(await this.yieldFarming.owner()).to.equal(this.owner.address);
        });
    });
});