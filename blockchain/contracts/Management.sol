// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatentManagement {

    address admin;
    uint256 defaultExpirationDuration; // in seconds

    struct Patent {
        address owner;
        uint256 expirationDate;
        bool isGranted;
        address[] licensedContracts;
    }

    // mapping(bytes32 => Patent) patents;
    mapping(address => mapping(bytes32 => Patent)) public ownerPatents;


    constructor(uint256 _defaultExpirationDuration) {
        admin = msg.sender;
        defaultExpirationDuration = _defaultExpirationDuration;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyPatentOwner(bytes32 patentHash) {
        require(msg.sender == patents[patentHash].owner, "Only patent owner can perform this action");
        _;
    }

    function submitDraftPatent() external {
        //TODO: replace this with IPFS hash (or add this hash to the IPFS file)
        bytes32 patentHash = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        patents[patentHash] = Patent(msg.sender, block.timestamp + defaultExpirationDuration, false, new address[](0));
    }

    function viewPatentData(bytes32 patentHash) external view returns (address, uint256, bool, address[] memory) {
        Patent memory patent = patents[patentHash];
        return (patent.owner, patent.expirationDate, patent.isGranted, patent.licensedContracts);
    }

    function checkPatentDraftStatus(bytes32 patentHash) external view returns (bool) {
        return patents[patentHash].isGranted;
    }

    function grantPatent(bytes32 patentHash) external onlyAdmin {
        patents[patentHash].isGranted = true;
    }

    function revokePatent(bytes32 patentHash) external onlyAdmin {
        patents[patentHash].isGranted = false;
    }

    function licensePatent(bytes32 patentHash, address licensedOrg, uint256 expirationDate) external onlyPatentOwner(patentHash) {
        patents[patentHash].licensedOrgs.push(licensedOrg);
        // add expiration date if specified
        if (expirationDate > 0) {
            patents[patentHash].expirationDate = expirationDate;
        }
    }

    function removeLicensedOrg(bytes32 patentHash, address licensedOrg) external onlyPatentOwner(patentHash) {
        address[] storage licensedOrgs = patents[patentHash].licensedOrgs;
        for (uint256 i = 0; i < licensedOrgs.length; i++) {
            if (licensedOrgs[i] == licensedOrg) {
                // remove the licensed org and shift the remaining array elements
                for (uint256 j = i; j < licensedOrgs.length - 1; j++) {
                    licensedOrgs[j] = licensedOrgs[j + 1];
                }
                licensedOrgs.pop();
                break;
            }
        }
    }

    function requestPatentExtension(bytes32 patentHash, uint256 newExpirationDate) external onlyPatentOwner(patentHash) {
        require(newExpirationDate > patents[patentHash].expirationDate, "New expiration date should be greater than current expiration date");
        patents[patentHash].isExtended = false;
        // TODO: add a mechanism to request for extension
    }

   

  
}