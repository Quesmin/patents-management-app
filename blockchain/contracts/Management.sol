// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Royalty.sol';

contract PatentManagement {

    address payable public admin;
    uint256 public constant EXPIRATION_DURATION = 20 * 365 days; // 20 years in seconds
    uint256 public constant DRAFT_FEE = 3 ether;

    struct Patent {
        address owner;
        address[] licensees;
        uint256 expirationDate;
        bool isGranted;
    }

    mapping(bytes32 => mapping(address => address)) lincesedOrgRoyaltyContract;
    mapping(bytes32 => Patent) public patents;
    mapping(address => bytes32[]) public ownerPatents;
    mapping(address => bytes32[]) public licenseePatents;

    event PatentDraftSubmitted(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event PatentGranted(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event PatentRevoked(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event PatentExtended(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event RoyaltyContractCreated(bytes32 indexed patentId, address indexed licensor, uint256 royaltyFee, uint256 paymentInterval, address indexed licensee, address royaltyContractAddress);
    event RoyaltyContractApproved(bytes32 indexed patentId, address indexed lincesedOrgRoyaltyContract, address indexed licensee);
    event RoyaltyContractDestroyed(bytes32 indexed patentId, address indexed licensee, address indexed lincesedOrgRoyaltyContract);
    event RoyaltyContractVerified(bytes32 indexed patentId, address indexed licensee, address indexed lincesedOrgRoyaltyContract);

    constructor() {
        admin = payable(msg.sender);
    }

    function _contains(address _addr, mapping(address => bytes32[]) storage _mapping, bytes32 _value) internal view returns (bool) {
        bytes32[] memory values = _mapping[_addr];
        for (uint i = 0; i < values.length; i++) {
            if (values[i] == _value) {
                return true;
            }
        }
        return false;
    }

    function _removeBytes32ValueFromArray(bytes32[] storage arr, bytes32 value) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                if (i != arr.length - 1) {
                    arr[i] = arr[arr.length - 1];
                }
                arr.pop();
                return;
            }
        }
    }

    function _removeAddressValueFromArray(address[] storage arr, address value) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                if (i != arr.length - 1) {
                    arr[i] = arr[arr.length - 1];
                }
                arr.pop();
                return;
            }
        }
    }


    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier onlyPatentOwner(bytes32 _patentId) {
        require(_contains(msg.sender, ownerPatents, _patentId), "Only patent owner can perform this action.");
        _;
    }

     modifier onlyLicensedOrg(bytes32 _patentId) {
        require(_contains(msg.sender, licenseePatents, _patentId) , "Only patent licensee can perform this action.");
        _;
    }


    function submitDraftPatent() external payable {
        require(msg.value == DRAFT_FEE, "Incorrect draft fee");

        bytes32 patentId = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        Patent storage newPatent = patents[patentId];

        ownerPatents[msg.sender].push(patentId);
        newPatent.owner = msg.sender;
        newPatent.expirationDate = block.timestamp + EXPIRATION_DURATION;
        newPatent.isGranted = false;
        
        emit PatentDraftSubmitted(patentId, msg.sender, newPatent.expirationDate);
        admin.transfer(msg.value); // pay fee to the admin

    }

    function checkPatentStatus(bytes32 _patentId) public view returns (bool) {
        return patents[_patentId].isGranted;
    }

    function getPatentData(bytes32 _patentId) public view returns (address, address[] memory, uint256, bool) {
        Patent memory patent = patents[_patentId];
        return (patent.owner, patent.licensees, patent.expirationDate, patent.isGranted);
    }

    function createRoyaltyContract(bytes32 _patentId, address _licensee, uint256 _royaltyFee, uint256 _paymentInterval, uint256 _contractExpirationDate) external onlyPatentOwner(_patentId) {
        require(patents[_patentId].isGranted, "Patent not granted.");
        require(patents[_patentId].expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");

        address newRoyaltyContract = address(new Royalty(_patentId, _licensee, _royaltyFee, _paymentInterval, _contractExpirationDate, payable(msg.sender)));
        lincesedOrgRoyaltyContract[_patentId][_licensee] = newRoyaltyContract;

        Patent storage patent = patents[_patentId];
        patent.licensees.push(_licensee);

        licenseePatents[_licensee].push(_patentId);
        

        emit RoyaltyContractCreated(_patentId, msg.sender, _royaltyFee, _paymentInterval, _licensee, newRoyaltyContract);
    }

    function approveRoyaltyContract(bytes32 _patentId) external onlyLicensedOrg(_patentId) {
        require(patents[_patentId].isGranted, "Patent not granted.");
        require(patents[_patentId].expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");
        
        Royalty royaltyContract = Royalty(lincesedOrgRoyaltyContract[_patentId][msg.sender]);
        royaltyContract.approveForRoyalty();
        
        emit RoyaltyContractApproved(_patentId, lincesedOrgRoyaltyContract[_patentId][msg.sender], msg.sender);
    }

    function destroyRoyaltyContract(bytes32 _patentId, address _licensee) external onlyPatentOwner(_patentId) {
        require(patents[_patentId].isGranted, "Patent not granted.");

        address royaltyContractAddress = lincesedOrgRoyaltyContract[_patentId][_licensee];
        require(royaltyContractAddress != address(0), "Royalty contract does not exist");

        Royalty royaltyContract = Royalty(royaltyContractAddress);
        require(royaltyContract.getLicenseeApprovalForDestroy(), "Licensee has not approved the destruction of the royalty contract");


        royaltyContract.destroySmartContract();
        delete lincesedOrgRoyaltyContract[_patentId][_licensee];

        Patent storage patent = patents[_patentId];
        _removeAddressValueFromArray(patent.licensees, _licensee);
        _removeBytes32ValueFromArray(licenseePatents[_licensee], _patentId);

        emit RoyaltyContractDestroyed(_patentId, _licensee, royaltyContractAddress);
    }

    function checkValidityOfRoyaltyContract(bytes32 _patentId, address _licensee) external onlyPatentOwner(_patentId) {
        require(patents[_patentId].isGranted, "Patent not granted.");

        address royaltyContractAddress = lincesedOrgRoyaltyContract[_patentId][_licensee];
        require(royaltyContractAddress != address(0), "Royalty contract does not exist");

        Royalty royaltyContract = Royalty(royaltyContractAddress);

        if (patents[_patentId].expirationDate < block.timestamp + 1 days || !royaltyContract.getIsContractValid()) {
            royaltyContract.destroySmartContract();
            delete lincesedOrgRoyaltyContract[_patentId][_licensee];

            Patent storage patent = patents[_patentId];
            _removeAddressValueFromArray(patent.licensees, _licensee);
            _removeBytes32ValueFromArray(licenseePatents[_licensee], _patentId);
            emit RoyaltyContractDestroyed(_patentId, _licensee, royaltyContractAddress);

        } else {
            emit RoyaltyContractVerified(_patentId, _licensee, royaltyContractAddress);
        }

    }


    function grantPatent(bytes32 _patentId) external onlyAdmin {
        require(!patents[_patentId].isGranted, "Patent already granted.");
        patents[_patentId].isGranted = true;

        emit PatentGranted(_patentId, patents[_patentId].owner, patents[_patentId].expirationDate);
    }

    function revokePatent(bytes32 _patentId) external onlyAdmin {
        require(patents[_patentId].isGranted, "Patent already revoked.");
        patents[_patentId].isGranted = false;

        emit PatentRevoked(_patentId, patents[_patentId].owner, patents[_patentId].expirationDate);
    }

    function extendExpirationDateOfPatent(bytes32 _patentId) external onlyAdmin {
        require(patents[_patentId].isGranted, "Patent not granted.");
        require(patents[_patentId].expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");
        patents[_patentId].expirationDate += 5 * 365 days;

        emit PatentExtended(_patentId, patents[_patentId].owner, patents[_patentId].expirationDate);
    }
  
}