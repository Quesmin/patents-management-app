// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Royalty.sol';

contract PatentManagement {

    address payable public admin;
    uint256 public constant EXPIRATION_DURATION = 20 * 365 days; // 20 years in seconds
    uint256 public constant EXNTENSION_DURATION = 5 * 365 days; // 5 years in seconds
    uint256 public constant DRAFT_FEE = 3 ether;

    enum Status {
        NotStarted,
        Pending,
        Granted,
        Rejected
    }

    struct Patent {
        bytes32 id;
        string title;
        string ipfsHash;
        address owner;
        address[] licensees;
        uint256 expirationDate;
        Status expirationExtension;
        Status status;
    }

    struct RoyaltyContractData {
        bytes32 patentId;
        address contractAddress;
        address patentOwner;
        address licensee;
        uint256 royaltyFee;
        uint256 paymentInterval;
        uint256 expirationDate;
        uint256 paidUntil;
        bool approvedForDestroy;
        bool paused;
    }

    struct LicenseDataForPatent {
        bytes32 patentId;
        RoyaltyContractData[] royaltyContractsData;
    }



    mapping(bytes32 => mapping(address => address)) lincesedOrgRoyaltyContract;
    Patent[] public patents;

    event PatentDraftSubmitted(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event PatentGranted(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event PatentRevoked(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event PatentExtended(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event PatentExtensionRejected(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event PatentExtensionApproved(bytes32 indexed patentId, address indexed owner, uint256 expirationDate);
    event RoyaltyContractCreated(bytes32 indexed patentId, address indexed licensor, uint256 royaltyFee, uint256 paymentInterval, address indexed licensee, address royaltyContractAddress);
    event RoyaltyContractApproved(bytes32 indexed patentId, address indexed lincesedOrgRoyaltyContract, address indexed licensee);
    event RoyaltyContractDestroyed(bytes32 indexed patentId, address indexed licensee, address indexed lincesedOrgRoyaltyContract);
    event RoyaltyContractVerified(bytes32 indexed patentId, address indexed licensee, address indexed lincesedOrgRoyaltyContract);

    constructor() {
        admin = payable(msg.sender);
    }

    function _contains(address _addr, address[] memory arr) internal pure returns (bool) {
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == _addr) {
                return true;
            }
        }
        return false;
    }

    function _getPatentIndexById(bytes32 _id) internal view returns (uint256) {
        for(uint256 i = 0; i < patents.length; i++) {
            if(patents[i].id == _id){
                return i;
            }
        }

        revert("Patent index not found");
    }

    function _setPatentAtIndex(uint256 _index, Patent memory _patent) internal {
        require(_index < patents.length, "Invalid index");
        patents[_index] = _patent;
    }

    function _getPatentById(bytes32 _id) internal view returns (Patent memory) {

        for(uint256 i = 0; i < patents.length; i++) {
            if(patents[i].id == _id){
                return patents[i];
            }
        }

        revert("Patent not found");

    }

   
    function _removeAddressValueFromArray(address[] memory arr, address value) internal pure returns(address[] memory) {
        uint256 indexToRemove = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                indexToRemove = i;
                break;
            }
        }

        if (indexToRemove < arr.length) {
            for (uint256 i = indexToRemove; i < arr.length - 1; i++) {
                arr[i] = arr[i + 1];
            }

            assembly {
                mstore(arr, sub(mload(arr), 1))
            }
        }

        return arr;
    }


    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier onlyPatentOwner(bytes32 _patentId) {
        require(_getPatentById(_patentId).owner == msg.sender, "Only patent owner can perform this action.");
        _;
    }

     modifier onlyLicensedOrg(bytes32 _patentId) {
        address[] memory licenseesArr = _getPatentById(_patentId).licensees;
        require(_contains(msg.sender, licenseesArr) , "Only patent licensee can perform this action.");
        _;
    }

    function viewPatents() public view returns(Patent[] memory) {
        return patents;
    }

    function getContractForLicensee(bytes32 _patentId, address _licensee) public view returns (RoyaltyContractData memory) {
        require(_contains(_licensee, _getPatentById(_patentId).licensees), "Licensee not found for this patent.");
        require(lincesedOrgRoyaltyContract[_patentId][_licensee] != address(0), "Royalty contract does not exist.");
        Royalty royaltyContract = Royalty(payable(lincesedOrgRoyaltyContract[_patentId][_licensee]));


        (
            bytes32 patentId,
            address patentOwner,
            address licensee,
            uint256 royaltyFee,
            uint256 paymentInterval,
            uint256 expirationDate,
            uint256 paidUntil,
            bool approvedForDestroy,
            bool paused
        ) = royaltyContract.getContractInfo();
        
        RoyaltyContractData memory royaltyContractData;

        royaltyContractData.patentId = patentId;
        royaltyContractData.contractAddress = lincesedOrgRoyaltyContract[_patentId][_licensee];
        royaltyContractData.patentOwner = patentOwner;
        royaltyContractData.licensee = licensee;
        royaltyContractData.royaltyFee = royaltyFee;
        royaltyContractData.paymentInterval = paymentInterval;
        royaltyContractData.expirationDate = expirationDate;
        royaltyContractData.paidUntil = paidUntil;
        royaltyContractData.approvedForDestroy = approvedForDestroy;
        royaltyContractData.paused = paused;

        return royaltyContractData;
    }

    function getAllContractsForPatent(bytes32 _patentId) public view returns (RoyaltyContractData[] memory) {

        Patent memory currentPatent = _getPatentById(_patentId);
        if(currentPatent.status != Status.Granted){
            return new RoyaltyContractData[](0);
        }

        address[] memory licenseesArr = currentPatent.licensees;
        if(licenseesArr.length == 0){
            return new RoyaltyContractData[](0);
        }

        RoyaltyContractData[] memory royaltyContractsData = new RoyaltyContractData[](licenseesArr.length);

        for (uint256 i = 0; i < licenseesArr.length; i++) {
            royaltyContractsData[i] = getContractForLicensee(_patentId, licenseesArr[i]);
        }

        return royaltyContractsData;
    }

    function getContractsForAllPatents() public view returns (LicenseDataForPatent[] memory) {
        LicenseDataForPatent[] memory licenseDataForPatents = new LicenseDataForPatent[](patents.length);

        for (uint256 i = 0; i < patents.length; i++) {
            licenseDataForPatents[i].patentId = patents[i].id;
            licenseDataForPatents[i].royaltyContractsData = getAllContractsForPatent(patents[i].id);
        }

        return licenseDataForPatents;
    }
    

    function submitDraftPatent(string memory _title, string memory _ipfsHash) external payable {
        require(msg.sender != admin, "Admin cannot submit draft patent.");
        require(msg.value == DRAFT_FEE, "Incorrect draft fee");

        bytes32 patentId = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        Patent memory newPatent;

        newPatent.id = patentId;
        newPatent.ipfsHash = _ipfsHash;
        newPatent.title = _title;
        newPatent.owner = msg.sender;
        newPatent.expirationDate = block.timestamp + EXPIRATION_DURATION;
        newPatent.status = Status.Pending;
        newPatent.expirationExtension = Status.NotStarted;

        patents.push(newPatent);
        
        emit PatentDraftSubmitted(patentId, msg.sender, newPatent.expirationDate);
        admin.transfer(msg.value);

    }


    //Licensed Org actions
    function approveRoyaltyContract(bytes32 _patentId) external onlyLicensedOrg(_patentId) {
        Patent memory currentPatent = _getPatentById(_patentId);
        
        require(currentPatent.status == Status.Granted, "Patent not granted.");
        require(currentPatent.expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");
        
        Royalty royaltyContract = Royalty(payable(lincesedOrgRoyaltyContract[_patentId][msg.sender]));
        require(royaltyContract.getIsContractValid() && royaltyContract.getIsPaused(), "Royalty contract is not in pending for approval state.");

        royaltyContract.approveForRoyalty();
        
        emit RoyaltyContractApproved(_patentId, lincesedOrgRoyaltyContract[_patentId][msg.sender], msg.sender);
    }


    //Patent Owner actions
    function createRoyaltyContract(
        bytes32 _patentId, 
        address _licensee, 
        uint256 _royaltyFee, 
        uint256 _paymentInterval, 
        uint256 _contractExpirationDate
        ) external onlyPatentOwner(_patentId) {
        Patent memory currentPatent = _getPatentById(_patentId);
        uint256 currentPatentIndex = _getPatentIndexById(_patentId);

        require(currentPatent.status == Status.Granted, "Patent not granted.");
        require(currentPatent.expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");
        require(!_contains(_licensee, currentPatent.licensees), "Licensee already exists for this patent.");

        address newRoyaltyContract = address(new Royalty(
            _patentId,
            _licensee, 
            _royaltyFee, 
            _paymentInterval, 
            _contractExpirationDate, 
            payable(msg.sender)
            ));
        lincesedOrgRoyaltyContract[_patentId][_licensee] = newRoyaltyContract;
        

        address[] memory updatedLicensees = new address[](currentPatent.licensees.length + 1);
        for (uint256 i = 0; i < currentPatent.licensees.length; i++) {
            updatedLicensees[i] = currentPatent.licensees[i];
        }
        updatedLicensees[currentPatent.licensees.length] = _licensee;
        currentPatent.licensees = updatedLicensees;

        _setPatentAtIndex(currentPatentIndex, currentPatent);

        emit RoyaltyContractCreated(_patentId, msg.sender, _royaltyFee, _paymentInterval, _licensee, newRoyaltyContract);
    }

  
    function checkValidityOfRoyaltyContract(
        bytes32 _patentId, 
        address _licensee) 
        external onlyPatentOwner(_patentId) {
        Patent memory currentPatent = _getPatentById(_patentId);
        uint256 currentPatentIndex = _getPatentIndexById(_patentId);


        require(currentPatent.status == Status.Granted, "Patent not granted.");

        address royaltyContractAddress = lincesedOrgRoyaltyContract[_patentId][_licensee];
        require(royaltyContractAddress != address(0), "Royalty contract does not exist");

        Royalty royaltyContract = Royalty(payable(royaltyContractAddress));

        if (!royaltyContract.getIsContractValid()) {
            royaltyContract.destroySmartContract();
            delete lincesedOrgRoyaltyContract[_patentId][_licensee];

            currentPatent.licensees = _removeAddressValueFromArray(currentPatent.licensees, _licensee);
            _setPatentAtIndex(currentPatentIndex, currentPatent);
            emit RoyaltyContractDestroyed(_patentId, _licensee, royaltyContractAddress);

        } else {
            emit RoyaltyContractVerified(_patentId, _licensee, royaltyContractAddress);
        }

    }

    function requestExtension(bytes32 _patentId) external onlyPatentOwner(_patentId) {
        Patent memory currentPatent = _getPatentById(_patentId);
        uint256 currentPatentIndex = _getPatentIndexById(_patentId);


        require(currentPatent.expirationExtension == Status.NotStarted, "Patent extension already requested.");
        currentPatent.expirationExtension = Status.Pending;
        _setPatentAtIndex(currentPatentIndex, currentPatent);

    }




    //Admin operations
    function handlePatentExtensionRequest(bytes32 _patentId, Status _newExtensionState) external onlyAdmin {
        Patent memory currentPatent = _getPatentById(_patentId);
        uint256 currentPatentIndex = _getPatentIndexById(_patentId);

        require(currentPatent.expirationExtension == Status.Pending, "Patent is not in requested state.");

        if(_newExtensionState == Status.Granted){

            require(currentPatent.expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");

            currentPatent.expirationDate += EXNTENSION_DURATION;

            emit PatentExtensionApproved(_patentId, currentPatent.owner, currentPatent.expirationDate);
        } else {
            emit PatentExtensionRejected(_patentId, currentPatent.owner, currentPatent.expirationDate);
        }

        currentPatent.expirationExtension = _newExtensionState;
        _setPatentAtIndex(currentPatentIndex, currentPatent);

    }


    function handlePatentState(bytes32 _patentId, Status _newPatentStatus) external onlyAdmin {
        Patent memory currentPatent = _getPatentById(_patentId);
        uint256 currentPatentIndex = _getPatentIndexById(_patentId);


        currentPatent.status = _newPatentStatus;
        _setPatentAtIndex(currentPatentIndex, currentPatent);

        if(_newPatentStatus == Status.Granted){
            emit PatentGranted(_patentId, currentPatent.owner, currentPatent.expirationDate);
        } else {
            emit PatentRevoked(_patentId, currentPatent.owner, currentPatent.expirationDate);
        }

    }
}