import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

import type { Signers } from "../types";
import { deployAddPoolCheckClaimableRewards, deployAndaddPoolToYieldFarmingFixture, deployYieldFarmingFixture } from "./YieldFarming.fixture";

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
    });

    describe("depositWei", async function () {
        beforeEach(async function() {
            const {yieldFarming,
                yieldFarming_address,
                owner,
                address1,
                address2, address3} = await this.loadFixture(deployAndaddPoolToYieldFarmingFixture);
            
                this.yieldFarming = yieldFarming;
                this.yieldFarming_address = yieldFarming_address;
                this.owner = owner;
                this.address1 = address1;
                this.address2 = address2;
                this.address3 = address3;
        });

        it("should be revert if deposit is insufficient", async function() {
            await expect(this.yieldFarming.connect(this.address1).depositWei(0, {value: 1})).to.be.reverted;
        });

        it("should be able to deposit wei", async function() {
            await expect(this.yieldFarming.connect(this.address1).depositWei(0, {value: 100})).not.to.be.reverted;
        });

        it("should be able to deposit wei with different user", async function () {
            await expect(this.yieldFarming.connect(this.address2).depositWei(0, {value: 900})).not.to.be.reverted;
        });

        it("should not be able to deposit more than max limit", async function () {
            await this.yieldFarming.connect(this.address1).depositWei(0, {value: 100});
            await this.yieldFarming.connect(this.address2).depositWei(0, {value: 900});
            await expect(this.yieldFarming.connect(this.address3).depositWei(0, {value: 100})).to.be.reverted;
        });
    });

    describe("checkClaimableRewards", async function () {
        beforeEach(async function() {
            const {yieldFarming,
                yieldFarming_address,
                owner,
                address1,
                address2, address3} = await this.loadFixture(deployAddPoolCheckClaimableRewards);
            
                this.yieldFarming = yieldFarming;
                this.yieldFarming_address = yieldFarming_address;
                this.owner = owner;
                this.address1 = address1;
                this.address2 = address2;
                this.address3 = address3;
        });

        it("should be able to check claimable rewards for address 1", async function () {
            // Increase EVM time by 20 sec (20 seconds)
            await network.provider.send("evm_increaseTime", [20]);
            await network.provider.send("evm_mine");

            const resp = await this.yieldFarming.connect(this.address1).checkClaimableRewards(0);

            expect(resp).equals(20);
        });

        it("should be able to check claimable rewards for address 2", async function () {
             // Increase EVM time by 20 sec (10 seconds)
             await network.provider.send("evm_increaseTime", [10]);
             await network.provider.send("evm_mine");

            const resp = await this.yieldFarming.connect(this.address2).checkClaimableRewards(0);

            expect(resp).equals(90);
        });
    });

    describe("claimRewards", async function() {
        beforeEach(async function() {
            const {yieldFarming,
                yieldFarming_address,
                owner,
                address1,
                address2, address3} = await this.loadFixture(deployAddPoolCheckClaimableRewards);

                await network.provider.send("evm_increaseTime", [20]);
                await network.provider.send("evm_mine");
            
                this.yieldFarming = yieldFarming;
                this.yieldFarming_address = yieldFarming_address;
                this.owner = owner;
                this.address1 = address1;
                this.address2 = address2;
                this.address3 = address3;
        });

        it("should be able to claim rewards", async function () {
            await this.yieldFarming.connect(this.address1).claimRewards(0);

            const address1BalanceAfter = await this.yieldFarming.balanceOf(this.address1);
            expect(address1BalanceAfter).equals(20);
        });

        it("should be able to check claimable rewards for address 1", async function () {
            await this.yieldFarming.connect(this.address1).claimRewards(0);

            const resp = await this.yieldFarming.connect(this.address1).checkClaimableRewards(0);
            expect(resp).equals(0);
        });
    });

    describe("checkWhaleWallets", async function () {
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

        it("should be able to get list of whales", async function () {
            await this.yieldFarming.connect(this.owner).addPool(10001,10,10,10);
            await this.yieldFarming.connect(this.address2).depositWei(0, {value: 10001});
            const whales = await this.yieldFarming.connect(this.owner).checkWhaleWallets();
            expect(whales.length).equals(1);
        });

        it("should be able to check the 20% interest for whales", async function () {
            await this.yieldFarming.connect(this.owner).addPool(10001,10,10,10);
            await this.yieldFarming.connect(this.address2).depositWei(0, {value: 10001});

            await network.provider.send("evm_increaseTime", [20]);
            await network.provider.send("evm_mine");

            const rewards = await this.yieldFarming.connect(this.address2).checkClaimableRewards(0);
            expect(rewards).equals(2000);
        });

        it("should be able to get the 20% interest for whales", async function () {
            await this.yieldFarming.connect(this.owner).addPool(10001,10,10,10);
            await this.yieldFarming.connect(this.address2).depositWei(0, {value: 10001});

            await network.provider.send("evm_increaseTime", [20]);
            await network.provider.send("evm_mine");

            await this.yieldFarming.connect(this.address2).claimRewards(0);
            
            const resp = await this.yieldFarming.connect(this.address2).checkClaimableRewards(0);
            
            const balance = await this.yieldFarming.connect(this.address1).balanceOf(this.address2);
            expect(balance).equals(2400);
        });

        it("should be able to check remaining capacity", async function() {
            await this.yieldFarming.connect(this.owner).addPool(10001,10,10,10);
            await this.yieldFarming.connect(this.address2).depositWei(0, {value: 10001});

            const capacity = await this.yieldFarming.connect(this.address1).checkRemainingCapacity(0);
            expect(capacity).equals(0);
        });

        it("should be able to withdraw wei", async function() {
            await this.yieldFarming.connect(this.owner).addPool(10001,10,10,10);
            await this.yieldFarming.connect(this.address2).depositWei(0, {value: 10001});

            await network.provider.send("evm_increaseTime", [20]);
            await network.provider.send("evm_mine");

            await this.yieldFarming.connect(this.address2).claimRewards(0);
            await this.yieldFarming.connect(this.address2).withdrawWei(0, 1000);

            const remain = await this.yieldFarming.connect(this.address1).checkRemainingCapacity(0);
            expect(remain).equals(1000);
        });

        it("should be able to addPool", async function () {
            await this.yieldFarming.connect(this.owner).addPool(10000,10,10,10);
            await this.yieldFarming.connect(this.owner).addPool(10000,10,10,10);

            await this.yieldFarming.connect(this.address1).depositWei(0, {value: 5000});
            await this.yieldFarming.connect(this.address1).depositWei(1, {value: 5001});

            const whale = await this.yieldFarming.connect(this.owner).checkWhaleWallets();
            expect(whale.length).equal(1);
        });

        it("should be able to checkUserDepositInPool", async function () {
            await this.yieldFarming.connect(this.owner).addPool(10000,10,10,10);

            await this.yieldFarming.connect(this.address1).depositWei(0, {value: 5000});
            await this.yieldFarming.connect(this.address2).depositWei(0, {value: 5000});

            await this.yieldFarming.connect(this.owner).checkUserDepositInPool(0).then((data: any) => {
                
                expect(data[0].length).equals(2);
            });
        });

        it("should be able to checkUserDeposits", async function () {
            await this.yieldFarming.connect(this.owner).addPool(10000,10,10,10);

            await this.yieldFarming.connect(this.address1).depositWei(0, {value: 5000});
            await this.yieldFarming.connect(this.address2).depositWei(0, {value: 5000});

            await network.provider.send("evm_increaseTime", [20]);
            await network.provider.send("evm_mine");

            const user = this.address1.address;
            await this.yieldFarming.connect(this.owner).checkUserDeposits(user).then((data:any) => {
                expect(data[0]).equals(5000);
            })
        });
    });
});