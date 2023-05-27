import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Admin who deployed the contract address: ", deployer.address);

    const PatentManagementFactory = await ethers.getContractFactory(
        "PatentManagement"
    );
    const managementContract = await PatentManagementFactory.connect(
        deployer
    ).deploy();

    await managementContract.deployed();

    console.log("Contract deployed to:", managementContract.address);
    console.log("Transaction hash:", managementContract.deployTransaction.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
