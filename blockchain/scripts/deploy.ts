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

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
