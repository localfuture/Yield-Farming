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

    describe("addPool", function () {
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

        it("should be able to add pool by the owner", async function () {
            expect(await this.yieldFarming.connect(this.owner).addPool(1000,10,10,10)).not.to.be.reverted;
        });

        it("should not be able to add pool by the users", async function () {
            await expect(this.yieldFarming.connect(this.address1).addPool(1000,10,10,10)).to.be.reverted;
        });

        it("should be able to add pool by the owner with proper paramenters", async function () {
            await expect(this.yieldFarming.connect(this.owner).addPool(10,10,1000,10)).to.be.reverted;
        });


    })
});