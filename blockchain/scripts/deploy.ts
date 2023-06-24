import { ethers } from "hardhat";
import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";

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

    console.log("Started the process of updating FE artifacts...");
    const feEnvFile = path.join(__dirname, "./../../", "frontend", ".env");
    const feAbiFolder = path.join(
        __dirname,
        "./../../",
        "frontend",
        "src/abis"
    );
    const patentManagementAbiPath = path.join(
        __dirname,
        "../artifacts/contracts/PatentManagement.sol"
    );
    const royaltyAbiPath = path.join(
        __dirname,
        "../artifacts/contracts/Royalty.sol"
    );

    //env update
    const envContent = fs.readFileSync(feEnvFile, "utf8");
    const updatedEnvContent = envContent.replace(
        /^VITE_PATENT_MANAGEMENT_CONTRACT_ADDRESS=.*/m,
        `VITE_PATENT_MANAGEMENT_CONTRACT_ADDRESS=${managementContract.address}`
    );
    fs.writeFileSync(feEnvFile, updatedEnvContent);

    //update abis
    fsExtra.emptyDirSync(feAbiFolder);
    fsExtra.copy(patentManagementAbiPath, feAbiFolder);
    fsExtra.copy(royaltyAbiPath, feAbiFolder);

    console.log("Done with the process of updating FE artifacts");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
