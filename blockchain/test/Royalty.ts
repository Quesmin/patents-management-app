const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { Royalty, Royalty__factory } from "../typechain-types";
import { BigNumber } from "ethers";

describe("Royalty", function () {
    let Royalty: Royalty__factory,
        royalty: Royalty,
        admin: SignerWithAddress,
        patentOwner: SignerWithAddress,
        licensee: SignerWithAddress,
        other: SignerWithAddress,
        ownerInitialBalance: BigNumber;

    const patentId = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    const royaltyFee = ethers.utils.parseEther("1");
    const paymentInterval = 86400; // 1 day
    const expirationPeriod = 86400 * 30; // 30 days

    beforeEach(async () => {
        [admin, patentOwner, licensee, other] = await ethers.getSigners();
        ownerInitialBalance = await patentOwner.getBalance();
        Royalty = await ethers.getContractFactory("Royalty");
        royalty = await Royalty.connect(admin).deploy(
            patentId,
            licensee.address,
            royaltyFee,
            paymentInterval,
            expirationPeriod,
            patentOwner.address
        );
        await royalty.deployed();
    });

    describe("Deployment", () => {
        it("Should set the right values", async () => {
            expect(await royalty.patentId()).to.equal(patentId);
            expect(await royalty.licensee()).to.equal(licensee.address);
            expect(await royalty.royaltyFee()).to.equal(royaltyFee);
            expect(await royalty.paymentInterval()).to.equal(paymentInterval);
            const currentBlockTimestamp = (
                await ethers.provider.getBlock("latest")
            ).timestamp;
            expect(await royalty.expirationPeriod()).to.equal(
                currentBlockTimestamp + expirationPeriod
            );
            const expectedPaidUntil = currentBlockTimestamp + paymentInterval;
            expect(await royalty.paidUntil()).to.equal(expectedPaidUntil);

            expect(await royalty.approvedForDestroy()).to.equal(false);
            expect(await royalty.approvedForRoyalty()).to.equal(false);
            expect(await royalty.patentOwner()).to.equal(patentOwner.address);
        });
    });

    describe("approveForRoyalty", () => {
        it("Should set approvedForRoyalty to true", async () => {
            await royalty.connect(admin).approveForRoyalty();
            expect(await royalty.approvedForRoyalty()).to.equal(true);
        });

        it("Should revert if not called by owner", async () => {
            await expect(
                royalty.connect(other).approveForRoyalty()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should revert if contract is paused", async () => {
            await royalty.destroySmartContract();
            await expect(
                royalty.connect(admin).approveForRoyalty()
            ).to.be.revertedWith("Pausable: paused");
        });
    });

    describe("approveForDestroy", () => {
        it("Should set approvedForDestroy to true", async () => {
            await royalty.connect(licensee).approveForDestroy();
            expect(await royalty.approvedForDestroy()).to.equal(true);
        });

        it("Should emit a RoyaltyContractApprovedForDestroy event", async () => {
            await expect(royalty.connect(licensee).approveForDestroy())
                .to.emit(royalty, "RoyaltyContractApprovedForDestroy")
                .withArgs(
                    patentId,
                    patentOwner.address,
                    licensee.address,
                    royalty.address
                );
        });

        it("Should revert if not called by licensee", async () => {
            await expect(
                royalty.connect(other).approveForDestroy()
            ).to.be.revertedWith("Only licensee can approve for destroy.");
        });

        it("Should revert if contract is paused", async () => {
            await royalty.connect(admin).destroySmartContract();
            await expect(
                royalty.connect(other).approveForDestroy()
            ).to.be.revertedWith("Pausable: paused");
        });
    });

    describe("getLicenseeApprovalForDestroy", () => {
        it("Should return the value of approvedForDestroy", async () => {
            await expect(
                await royalty.connect(admin).getLicenseeApprovalForDestroy()
            ).to.be.a("boolean");
        });

        it("Should revert if not called by admin", async () => {
            await expect(
                royalty.connect(other).getLicenseeApprovalForDestroy()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should revert if contract is paused", async () => {
            await royalty.connect(admin).destroySmartContract();
            await expect(
                royalty.connect(admin).getLicenseeApprovalForDestroy()
            ).to.be.revertedWith("Pausable: paused");
        });
    });

    describe("payRoyalty", () => {
        it("Should pay the royalty fee to the patent owner", async () => {
            await royalty.connect(licensee).payRoyalty({ value: royaltyFee });

            const patentOwnerBalance = await ethers.provider.getBalance(
                patentOwner.address
            );
            expect(patentOwnerBalance).to.equal(
                ownerInitialBalance.add(royaltyFee)
            );
        });

        it("Should emit a RoyaltyPaid event", async () => {
            const currentBlockTimestamp = (
                await ethers.provider.getBlock("latest")
            ).timestamp;

            const paidUntilUpdated =
                currentBlockTimestamp + 2 * paymentInterval; //since the new payment made updated the paidUntil variable
            await expect(
                royalty.connect(licensee).payRoyalty({ value: royaltyFee })
            )
                .to.emit(royalty, "RoyaltyPaid")
                .withArgs(
                    patentId,
                    royalty.address,
                    licensee.address,
                    royaltyFee,
                    paidUntilUpdated
                );
        });

        it("Should revert if contract is paused", async () => {
            await royalty.connect(admin).destroySmartContract();
            await expect(
                royalty.connect(licensee).payRoyalty({ value: royaltyFee })
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should revert if not called by licensee", async () => {
            await expect(
                royalty.connect(other).payRoyalty({ value: royaltyFee })
            ).to.be.revertedWith("Only licensee can pay the royalty.");
        });

        it("Should revert if not called with correct fee value", async () => {
            await expect(
                royalty
                    .connect(licensee)
                    .payRoyalty({ value: royaltyFee.add(1) })
            ).to.be.revertedWith("Incorrect fee value.");
        });

        it("Should revert if paymentInterval exceeds expiration date of the patent", async () => {
            [admin, patentOwner, licensee, other] = await ethers.getSigners();
            ownerInitialBalance = await patentOwner.getBalance();
            Royalty = await ethers.getContractFactory("Royalty");
            royalty = await Royalty.connect(admin).deploy(
                patentId,
                licensee.address,
                royaltyFee,
                expirationPeriod,
                expirationPeriod,
                patentOwner.address
            );
            await royalty.deployed();
            await expect(
                royalty.connect(licensee).payRoyalty({ value: royaltyFee })
            ).to.be.revertedWith(
                "The payment extension interval exceeds expiration date."
            );
        });
    });

    describe("getIsContractValid", () => {
        it("Should return true if the contract is valid", async () => {
            await expect(
                await royalty.connect(admin).getIsContractValid()
            ).to.equal(true);
        });

        it("Should return false if the contract is expired", async () => {
            const currentBlockTimestamp = (
                await ethers.provider.getBlock("latest")
            ).timestamp;

            await network.provider.send("evm_setNextBlockTimestamp", [
                currentBlockTimestamp + expirationPeriod + 1,
            ]);
            await network.provider.send("evm_mine");

            const result = await royalty.connect(admin).getIsContractValid();
            expect(result).to.equal(false);
        });

        it("Should return false if the contract is not paid in time", async () => {
            const paidUntilData = await royalty.paidUntil();

            await network.provider.send("evm_setNextBlockTimestamp", [
                paidUntilData.add(1).toNumber(),
            ]);
            await network.provider.send("evm_mine");

            const result = await royalty.connect(admin).getIsContractValid();
            expect(result).to.equal(false);
        });

        it("Should revert if contract is paused", async () => {
            await royalty.connect(admin).destroySmartContract();
            await expect(
                royalty.connect(admin).getIsContractValid()
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should revert if not called by admin", async () => {
            await expect(
                royalty.connect(other).getIsContractValid()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("destroySmartContract", () => {
        it("Should pause the contract when destroyed", async () => {
            await royalty.connect(admin).destroySmartContract();
            const isPaused = await royalty.paused();
            expect(isPaused).to.equal(true);
        });

        it("Should revert if contract is paused", async () => {
            await royalty.connect(admin).destroySmartContract();
            await expect(
                royalty.connect(admin).destroySmartContract()
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should revert if not called by admin", async () => {
            await expect(
                royalty.connect(other).destroySmartContract()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
