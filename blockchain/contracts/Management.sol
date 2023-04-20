// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatentManagement {

    address payable public admin;
    uint256 public constant EXPIRATION_DURATION = 20 * 365 days; // 20 years in seconds
    uint256 public constant DRAFT_FEE = 3 ether;

    struct Patent {
        address owner;
        uint256 expirationDate;
        bool isGranted;
    }

    mapping(bytes32 => mapping(address => address)) lincesedOrgRoyaltyContract;
    mapping(bytes32 => Patent) public patents;
    mapping(address => bytes32[]) public ownerPatents;
    mapping(address => bytes32[]) public licenseePatents;

    event PatentDraftSubmitted(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event RoyaltyContractCreated(bytes32 indexed patentId, address indexed licensor, uint256 royaltyFee, uint256 paymentInterval);
    event RoyaltyContractApproved(bytes32 indexed patentId, address indexed lincesedOrgRoyaltyContract, address indexed licensee);
    event RoyaltyContractDestroyed(bytes32 indexed patentId, address indexed licensee, address indexed lincesedOrgRoyaltyContract);

    constructor() {
        admin = payable(msg.sender);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyPatentOwner(bytes32 _patentId) {
        require(msg.sender == patents[_patentId].owner, "Only patent owner can perform this action");
        _;
    }

     modifier onlyLicensedOrg(bytes32 _patentId) {
        require(lincesedOrgRoyaltyContract[_patentId][msg.sender] != address(0) , "Not authorized");
        _;
    }


    function submitDraftPatent() external payable {
        require(msg.value == DRAFT_FEE, "Incorrect draft fee");

        bytes32 patentId = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        Patent storage newPatent = patents[patentId];
        newPatent.owner = msg.sender;
        newPatent.expirationDate = block.timestamp + EXPIRATION_DURATION;
        newPatent.isGranted = false;

        //TODO: might not need this data structure
        // ownerPatents[msg.sender].push(patentId);
        
        emit PatentDraftSubmitted(patentId, msg.sender, newPatent.expirationDate);
        admin.transfer(msg.value); // pay fee to the admin

    }

    function checkPatentStatus(bytes32 _patentId) public view returns (bool) {
        return patents[_patentId].isGranted;
    }

    function getPatentData(bytes32 _patentId) public view returns (address, uint256, bool) {
        Patent memory patent = patents[_patentId];
        return (patent.owner, patent.expirationDate, patent.isGranted);
    }

    function createRoyaltyContract(bytes32 _patentId, address _licensee, uint256 _royaltyFee, uint256 _paymentInterval) external onlyPatentOwner(_patentId) {
        // require(patents[_patentId].owner == msg.sender, "Only the patent owner can create a royalty contract");
        require(patents[_patentId].isGranted, "Patent must be granted before creating royalty contract");

        //TODO: replace RoyaltyContract
        // address newRoyaltyContract = address(new RoyaltyContract(_licensee, _royaltyFee, _paymentInterval));
        // lincesedOrgRoyaltyContract[_patentId][_licensee] = newRoyaltyContract;

        emit RoyaltyContractCreated(_patentId, msg.sender, _royaltyFee, _paymentInterval);
    }

    function approveRoyaltyContract(bytes32 _patentId) external onlyLicensedOrg(_patentId) {
        require(patents[_patentId].isGranted == true, "Patent has not been granted yet");
        
        //TODO: solve when we have RoyaltyContract
        // RoyaltyContract royaltyContract = RoyaltyContract(lincesedOrgRoyaltyContract[_patentId][msg.sender]);
        // royaltyContract.approveContract();
        
        emit RoyaltyContractApproved(_patentId, lincesedOrgRoyaltyContract[_patentId][msg.sender], msg.sender);
    }

    function destroyRoyaltyContract(bytes32 _patentId, address _licensee) external onlyPatentOwner(_patentId) {
        // require(msg.sender == patents[_patentId].owner, "Only the patent owner can destroy royalty contracts");

        address royaltyContractAddress = lincesedOrgRoyaltyContract[_patentId][_licensee];
        require(royaltyContractAddress != address(0), "Royalty contract does not exist");

        //TODO: handle when the RoyaltyContract is created
        // RoyaltyContract royaltyContract = RoyaltyContract(royaltyContractAddress);
        // require(royaltyContract.getLicenseeApprovalForDestroy(), "Licensee has not approved the destruction of the royalty contract");

        delete lincesedOrgRoyaltyContract[_patentId][_licensee];
        emit RoyaltyContractDestroyed(_patentId, _licensee, royaltyContractAddress);
    }

    //TODO: admin functionality

    // function viewPatentData(bytes32 patentHash) external view returns (address, uint256, bool, address[] memory) {
    //     Patent memory patent = patents[patentHash];
    //     return (patent.owner, patent.expirationDate, patent.isGranted, patent.licensedContracts);
    // }

    // function checkPatentDraftStatus(bytes32 patentHash) external view returns (bool) {
    //     return patents[patentHash].isGranted;
    // }

    // function grantPatent(bytes32 patentHash) external onlyAdmin {
    //     patents[patentHash].isGranted = true;
    // }

    // function revokePatent(bytes32 patentHash) external onlyAdmin {
    //     patents[patentHash].isGranted = false;
    // }

    // function licensePatent(bytes32 patentHash, address licensedOrg, uint256 expirationDate) external onlyPatentOwner(patentHash) {
    //     patents[patentHash].licensedOrgs.push(licensedOrg);
    //     // add expiration date if specified
    //     if (expirationDate > 0) {
    //         patents[patentHash].expirationDate = expirationDate;
    //     }
    // }

    // function removeLicensedOrg(bytes32 patentHash, address licensedOrg) external onlyPatentOwner(patentHash) {
    //     address[] storage licensedOrgs = patents[patentHash].licensedOrgs;
    //     for (uint256 i = 0; i < licensedOrgs.length; i++) {
    //         if (licensedOrgs[i] == licensedOrg) {
    //             // remove the licensed org and shift the remaining array elements
    //             for (uint256 j = i; j < licensedOrgs.length - 1; j++) {
    //                 licensedOrgs[j] = licensedOrgs[j + 1];
    //             }
    //             licensedOrgs.pop();
    //             break;
    //         }
    //     }
    // }

    // function requestPatentExtension(bytes32 patentHash, uint256 newExpirationDate) external onlyPatentOwner(patentHash) {
    //     require(newExpirationDate > patents[patentHash].expirationDate, "New expiration date should be greater than current expiration date");
    //     patents[patentHash].isExtended = false;
    //     // TODO: add a mechanism to request for extension
    // }

   

  
}