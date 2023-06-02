const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
    Royalty,
    PatentManagement,
    PatentManagement__factory,
    Royalty__factory,
} from "../typechain-types";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

describe("PatentManagement", function () {
    let PatentManagementFactory: PatentManagement__factory;
    let RoyaltyFactory: Royalty__factory;
    let patentManagement: PatentManagement;
    let admin: SignerWithAddress;
    let owner: SignerWithAddress;
    let licensee: SignerWithAddress;

    beforeEach(async function () {
        [admin, owner, licensee] = await ethers.getSigners();

        PatentManagementFactory = await ethers.getContractFactory(
            "PatentManagement"
        );
        RoyaltyFactory = await ethers.getContractFactory("Royalty");

        patentManagement = await PatentManagementFactory.connect(
            admin
        ).deploy();
        await patentManagement.deployed();
    });

    describe("checkPatentStatus", function () {
        let patentId: string;

        beforeEach(async function () {
            const tx = await patentManagement.submitDraftPatent({
                value: ethers.utils.parseEther("3"),
            });

            let receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === "PatentDraftSubmitted"
            );

            patentId = event?.args?.patentId;
        });

        it("should return Pending for a new patent", async function () {
            expect(await patentManagement.checkPatentStatus(patentId)).to.equal(
                0
            );
        });

        it("should return Granted after a patent is granted", async function () {
            await patentManagement.grantPatent(patentId);
            expect(await patentManagement.checkPatentStatus(patentId)).to.equal(
                1
            );
        });
    });

    describe.skip("getPatentData", function () {
        let patentId: string;

        beforeEach(async function () {
            const tx = await patentManagement.connect(owner).submitDraftPatent({
                value: ethers.utils.parseEther("3"),
            });

            let receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === "PatentDraftSubmitted"
            );

            patentId = event?.args?.patentId;
        });

        it("should correctly return patent data", async function () {
            const [ownerAddress, licensees, expirationDate, isGranted] =
                await patentManagement.getPatentData(patentId);

            expect(ownerAddress).to.equal(owner.address);
            expect(licensees).to.be.an("array"); // Add more specific checks if you know what to expect here
            expect(expirationDate.toNumber()).to.be.a("number"); // Add more specific checks if you know what to expect here
            expect(isGranted).to.be.a("number");
        });

        it("should return correct data after patent is granted", async function () {
            await patentManagement.grantPatent(patentId);

            const [ownerAddress, licensees, expirationDate, isGranted] =
                await patentManagement.getPatentData(patentId);

            expect(ownerAddress).to.equal(owner.address);
            expect(licensees).to.be.an("array"); // Add more specific checks if you know what to expect here
            expect(expirationDate.toNumber()).to.be.a("number"); // Add more specific checks if you know what to expect here
            expect(isGranted).to.equal(1);
        });
    });

    describe("submitDraftPatent", function () {
        it("should submit a new draft patent", async function () {
            const tx = await patentManagement.connect(owner).submitDraftPatent({
                value: ethers.utils.parseEther("3"),
            });

            const eventEmitString = "PatentDraftSubmitted";

            let receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === eventEmitString
            );

            const patentId = event?.args?.patentId;

            expect(
                await patentManagement.getPatentsByOwner(owner.address)
            ).to.have.lengthOf(1);
            expect(await patentManagement.checkPatentStatus(patentId)).to.equal(
                0
            );
        });

        it("should revert if draft fee is incorrect", async function () {
            await expect(
                patentManagement.submitDraftPatent({
                    value: ethers.utils.parseEther("2"),
                })
            ).to.be.revertedWith("Incorrect draft fee");
        });
    });

    describe("createRoyaltyContract", function () {
        let patentId: string;
        let licensee: SignerWithAddress;
        let royaltyFee: BigNumber;
        let paymentInterval: BigNumber;
        let contractExpirationDate: BigNumber;

        beforeEach(async function () {
            [owner, licensee] = await ethers.getSigners();
            const tx = await patentManagement.connect(owner).submitDraftPatent({
                value: ethers.utils.parseEther("3"),
            });

            let receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === "PatentDraftSubmitted"
            );

            patentId = event?.args?.patentId;
            await patentManagement.grantPatent(patentId);

            royaltyFee = ethers.utils.parseEther("0.1");
            paymentInterval = ethers.BigNumber.from(30);
            contractExpirationDate = ethers.BigNumber.from(
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
            );
        });

        it("should create a new royalty contract for a granted patent", async function () {
            const tx = await patentManagement.createRoyaltyContract(
                patentId,
                licensee.address,
                royaltyFee,
                paymentInterval,
                contractExpirationDate
            );

            let receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === "RoyaltyContractCreated"
            );

            const newRoyaltyContract = event?.args?.royaltyContractAddress;

            expect(newRoyaltyContract).to.not.be.null;

            const royaltyContract = Royalty__factory.connect(
                newRoyaltyContract,
                owner
            );

            expect(await royaltyContract.patentId()).to.equal(patentId);
            expect(await royaltyContract.licensee()).to.equal(licensee.address);
            expect(await royaltyContract.royaltyFee()).to.equal(royaltyFee);
            expect(await royaltyContract.paymentInterval()).to.equal(
                paymentInterval
            );
            const currentBlockTimestamp = (
                await ethers.provider.getBlock("latest")
            ).timestamp;

            expect(await royaltyContract.expirationPeriod()).to.equal(
                contractExpirationDate.add(currentBlockTimestamp)
            );
        });

        it("should revert if the patent is not granted", async function () {
            await patentManagement.revokePatent(patentId);
            await expect(
                patentManagement.createRoyaltyContract(
                    patentId,
                    licensee.address,
                    royaltyFee,
                    paymentInterval,
                    contractExpirationDate
                )
            ).to.be.revertedWith("Patent not granted.");
        });

        it("should revert if the patent expiration date is less than 1 day", async function () {
            await ethers.provider.send("evm_increaseTime", [
                86400 * (20 * 365 - 1),
            ]); // forward time 20 years minus 1 day

            await expect(
                patentManagement.createRoyaltyContract(
                    patentId,
                    licensee.address,
                    royaltyFee,
                    paymentInterval,
                    contractExpirationDate
                )
            ).to.be.revertedWith("Patent will expire in less than 1 day.");
        });

        it("should revert if called by a non-patent owner", async function () {
            await expect(
                patentManagement
                    .connect(licensee)
                    .createRoyaltyContract(
                        patentId,
                        licensee.address,
                        royaltyFee,
                        paymentInterval,
                        contractExpirationDate
                    )
            ).to.be.revertedWith("Only patent owner can perform this action.");
        });
    });

    describe("approveRoyaltyContract", function () {
        let patentId: string;
        let licensee: SignerWithAddress;

        beforeEach(async function () {
            // Arrange

            [owner, licensee] = await ethers.getSigners();
            const tx = await patentManagement.connect(owner).submitDraftPatent({
                value: ethers.utils.parseEther("3"),
            });

            let receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === "PatentDraftSubmitted"
            );

            patentId = event?.args?.patentId;
            await patentManagement.connect(admin).grantPatent(patentId);
            await patentManagement.createRoyaltyContract(
                patentId,
                licensee.address,
                ethers.utils.parseEther("0.1"),
                30,
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
            );
        });

        it("should approve a royalty contract", async function () {
            // Act
            await patentManagement
                .connect(licensee)
                .approveRoyaltyContract(patentId);

            // Assert
            const royaltyContractAddress =
                await patentManagement.getContractAddressForLicensee(
                    patentId,
                    licensee.address
                );
            const royaltyContract = Royalty__factory.connect(
                royaltyContractAddress,
                licensee
            );
            expect(await royaltyContract.approvedForRoyalty()).to.equal(true);
        });

        it("should revert if the patent is not granted", async function () {
            await patentManagement.revokePatent(patentId);
            await expect(
                patentManagement
                    .connect(licensee)
                    .approveRoyaltyContract(patentId)
            ).to.be.revertedWith("Patent not granted.");
        });

        it("should revert if the patent expiration date is less than 1 day", async function () {
            await ethers.provider.send("evm_increaseTime", [
                86400 * (20 * 365 - 1),
            ]); // forward time 20 years minus 1 day

            await expect(
                patentManagement
                    .connect(licensee)
                    .approveRoyaltyContract(patentId)
            ).to.be.revertedWith("Patent will expire in less than 1 day.");
        });

        it("should revert if called by a non-licensee", async function () {
            await expect(
                patentManagement.connect(admin).approveRoyaltyContract(patentId)
            ).to.be.revertedWith(
                "Only patent licensee can perform this action."
            );
        });
    });

    describe("destroyRoyaltyContract", function () {
        let patentId: string;
        let royaltyFee: BigNumber;
        let paymentInterval: number;
        let contractExpirationDate: number;
        let royaltyContractAddress: string;

        beforeEach(async function () {
            const tx = await patentManagement.connect(owner).submitDraftPatent({
                value: ethers.utils.parseEther("3"),
            });

            const receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === "PatentDraftSubmitted"
            );
            patentId = event?.args?.patentId;

            await patentManagement.connect(admin).grantPatent(patentId);

            royaltyFee = ethers.utils.parseEther("0.1");
            paymentInterval = 30;
            contractExpirationDate =
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

            const createRoyaltyContractTx = await patentManagement
                .connect(owner)
                .createRoyaltyContract(
                    patentId,
                    licensee.address,
                    royaltyFee,
                    paymentInterval,
                    contractExpirationDate
                );

            const createRoyaltyContractReceipt =
                await createRoyaltyContractTx.wait();
            const createRoyaltyContractEvent =
                createRoyaltyContractReceipt.events?.find(
                    (event) => event.event === "RoyaltyContractCreated"
                );
            royaltyContractAddress =
                createRoyaltyContractEvent?.args?.royaltyContractAddress;

            await patentManagement
                .connect(licensee)
                .approveRoyaltyContract(patentId);
        });

        it("should destroy the royalty contract", async function () {
            const royaltyContract = Royalty__factory.connect(
                royaltyContractAddress,
                licensee
            );
            const receipt = await royaltyContract.approveForDestroy();

            await receipt.wait();

            expect(
                await patentManagement
                    .connect(owner)
                    .destroyRoyaltyContract(patentId, licensee.address)
            )
                .to.emit(patentManagement, "RoyaltyContractDestroyed")
                .withArgs(patentId, licensee.address, royaltyContractAddress);
        });

        it("should revert if the patent is not granted", async function () {
            await patentManagement.revokePatent(patentId);
            await expect(
                patentManagement
                    .connect(owner)
                    .destroyRoyaltyContract(patentId, licensee.address)
            ).to.be.revertedWith("Patent not granted.");
        });

        it("should revert if the royalty contract does not exist", async function () {
            await expect(
                patentManagement
                    .connect(owner)
                    .destroyRoyaltyContract(
                        patentId,
                        ethers.constants.AddressZero
                    )
            ).to.be.revertedWith("Royalty contract does not exist");
        });

        it("should revert if the licensee has not approved the destruction of the royalty contract", async function () {
            await expect(
                patentManagement
                    .connect(owner)
                    .destroyRoyaltyContract(patentId, licensee.address)
            ).to.be.revertedWith(
                "Licensee has not approved the destruction of the royalty contract"
            );
        });
    });

    describe("checkValidityOfRoyaltyContract", function () {
        let patentId: string;
        let royaltyFee: BigNumber;
        let paymentInterval: number;
        let contractExpirationDate: number;
        let royaltyContractAddress: string;

        beforeEach(async function () {
            const tx = await patentManagement.submitDraftPatent({
                value: ethers.utils.parseEther("3"),
            });

            const receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === "PatentDraftSubmitted"
            );
            patentId = event?.args?.patentId;

            await patentManagement.grantPatent(patentId);

            royaltyFee = ethers.utils.parseEther("0.1");
            paymentInterval = 30;
            contractExpirationDate =
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

            const createRoyaltyContractTx =
                await patentManagement.createRoyaltyContract(
                    patentId,
                    licensee.address,
                    royaltyFee,
                    paymentInterval,
                    contractExpirationDate
                );

            const createRoyaltyContractReceipt =
                await createRoyaltyContractTx.wait();
            const createRoyaltyContractEvent =
                createRoyaltyContractReceipt.events?.find(
                    (event) => event.event === "RoyaltyContractCreated"
                );
            royaltyContractAddress =
                createRoyaltyContractEvent?.args?.royaltyContractAddress;

            await patentManagement
                .connect(licensee)
                .approveRoyaltyContract(patentId);
        });

        it("should destroy the contract if patent expiration period is less than 1 day", async function () {
            await ethers.provider.send("evm_increaseTime", [60]); // forward time 30 days

            expect(
                await patentManagement.checkValidityOfRoyaltyContract(
                    patentId,
                    licensee.address
                )
            )
                .to.emit(patentManagement, "RoyaltyContractDestroyed")
                .withArgs(patentId, licensee.address, royaltyContractAddress);
        });

        it("should destroy the contract if contract is invalid (royalty was not paid)", async function () {
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // forward time 30 days

            expect(
                await patentManagement.checkValidityOfRoyaltyContract(
                    patentId,
                    licensee.address
                )
            )
                .to.emit(patentManagement, "RoyaltyContractDestroyed")
                .withArgs(patentId, licensee.address, royaltyContractAddress);
        });

        it("should not destroy the contract if it is valid and the patent expiration period is more than 1 day", async function () {
            expect(
                await patentManagement.checkValidityOfRoyaltyContract(
                    patentId,
                    licensee.address
                )
            )
                .to.emit(patentManagement, "RoyaltyContractVerified")
                .withArgs(patentId, licensee.address, royaltyContractAddress);
        });

        it("should revert if the patent is not granted", async function () {
            await patentManagement.revokePatent(patentId);
            await expect(
                patentManagement.checkValidityOfRoyaltyContract(
                    patentId,
                    licensee.address
                )
            ).to.be.revertedWith("Patent not granted.");
        });

        it("should revert if the royalty contract does not exist", async function () {
            await expect(
                patentManagement.checkValidityOfRoyaltyContract(
                    patentId,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Royalty contract does not exist");
        });
    });

    describe("extendExpirationDateOfPatent", function () {
        let patentId: string;

        beforeEach(async function () {
            const tx = await patentManagement.connect(owner).submitDraftPatent({
                value: ethers.utils.parseEther("3"),
            });

            const receipt = await tx.wait();
            const event = receipt.events?.find(
                (event) => event.event === "PatentDraftSubmitted"
            );
            patentId = event?.args?.patentId;

            await patentManagement.grantPatent(patentId);
        });

        it("should extend the expiration date of the patent", async function () {
            const [, , beforeExpirationDate] =
                await patentManagement.getPatentData(patentId);
            await patentManagement
                .connect(admin)
                .extendExpirationDateOfPatent(patentId);
            const [, , afterExpirationDate] =
                await patentManagement.getPatentData(patentId);
            expect(afterExpirationDate.sub(beforeExpirationDate)).to.equal(
                5 * 365 * 24 * 60 * 60
            );
        });

        it("should emit a PatentExtended event", async function () {
            const [, , expirationDate] = await patentManagement.getPatentData(
                patentId
            );
            await expect(
                patentManagement
                    .connect(admin)
                    .extendExpirationDateOfPatent(patentId)
            )
                .to.emit(patentManagement, "PatentExtended")
                .withArgs(
                    patentId,
                    owner.address,
                    await ethers.provider
                        .getBlock("latest")
                        .then((block) =>
                            expirationDate.add(5 * 365 * 24 * 60 * 60)
                        )
                );
        });

        it("should revert if the patent is not granted", async function () {
            await patentManagement.revokePatent(patentId);
            await expect(
                patentManagement
                    .connect(admin)
                    .extendExpirationDateOfPatent(patentId)
            ).to.be.revertedWith("Patent not granted.");
        });

        it("should revert if the patent will expire in less than 1 day", async function () {
            await ethers.provider.send("evm_increaseTime", [
                20 * 365 * 24 * 60 * 60,
            ]); // forward time 20 years
            await expect(
                patentManagement
                    .connect(admin)
                    .extendExpirationDateOfPatent(patentId)
            ).to.be.revertedWith("Patent will expire in less than 1 day.");
        });

        it("should revert if the caller is not the admin", async function () {
            await expect(
                patentManagement
                    .connect(owner)
                    .extendExpirationDateOfPatent(patentId)
            ).to.be.revertedWith("Only admin can perform this action.");
        });
    });
});
