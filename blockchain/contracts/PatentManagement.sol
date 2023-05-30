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
        address owner;
        address[] licensees;
        uint256 expirationDate;
        Status expirationExtension;
        Status status;
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

    function _getPatentByOwner(address _owner) internal view returns (Patent memory) {

        for(uint256 i = 0; i < patents.length; i++) {
            if(patents[i].owner == _owner){
                return patents[i];
            }
        }

        revert("Patent index not found");
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

    function _removeAddressValueFromArray(address[] memory arr, address value) internal pure returns(address[] memory) {
        uint256 indexToRemove = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                indexToRemove = i;
                break;
            }
        }

        if (indexToRemove < arr.length) {
            // Shift the elements to the left starting from the index to remove
            for (uint256 i = indexToRemove; i < arr.length - 1; i++) {
                arr[i] = arr[i + 1];
            }

            // Resize the array by one element
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

    // function getAllPatentsByOwners() public view returns (Patent[] memory) {

    //     uint256

    //     for (uint256 i = 0; i < owners.length; i++) {

    //         bytes32[] memory _patentIds = new bytes32[](ownerPatents[owners[i]].length);

    //         for (uint256 j = 0; j < _patentIds.length; j++) {

    //             _patents.push(patents[_patentIds[j]]);
    //         }
    //     }


    //     Patent[] memory _patents = new Patent[](5);

    //     for (uint256 i = 0; i < owners.length; i++) {

    //         bytes32[] memory _patentIds = new bytes32[](ownerPatents[owners[i]].length);

    //         for (uint256 j = 0; j < _patentIds.length; j++) {

    //             _patents.push(patents[_patentIds[j]]);
    //         }
    //     }

    //     return _patents;
    // }

    // function getPatentsByOwner(address owner) public view returns (bytes32[] memory) {
    //     return ownerPatents[owner];
    // }

    // function checkPatentStatus(bytes32 _patentId) public view returns (Status) {
    //     return patents[_patentId].status;
    // }

    // function checkPatentExpExtensionStatus(bytes32 _patentId) public view returns (Status) {
    //     return patents[_patentId].expirationExtension;
    // }

    function viewPatents() public view returns(Patent[] memory) {
        return patents;
    }


    function getPatentData(bytes32 _patentId) public view returns (bytes32, string memory, address, address[] memory, uint256, Status, Status) {
        Patent memory patent = _getPatentById(_patentId);
        return (patent.id, patent.title, patent.owner, patent.licensees, patent.expirationDate, patent.expirationExtension, patent.status);
    }

    function getContractAddressForLicensee(bytes32 _patentId, address _licensee) public view returns (address) {
        return lincesedOrgRoyaltyContract[_patentId][_licensee];
    }

    function submitDraftPatent(string memory _title) external payable {
        require(msg.sender != admin, "Admin cannot submit draft patent.");
        require(msg.value == DRAFT_FEE, "Incorrect draft fee");

        //TODO: we might want to get the id from the FE
        bytes32 patentId = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        Patent memory newPatent;

        newPatent.id = patentId;
        newPatent.title = _title;
        newPatent.owner = msg.sender;
        newPatent.expirationDate = block.timestamp + EXPIRATION_DURATION;
        newPatent.status = Status.Pending;
        newPatent.expirationExtension = Status.NotStarted;

        patents.push(newPatent);
        
        emit PatentDraftSubmitted(patentId, msg.sender, newPatent.expirationDate);
        admin.transfer(msg.value); // pay fee to the admin

    }


    //Licensed Org actions
    function approveRoyaltyContract(bytes32 _patentId) external onlyLicensedOrg(_patentId) {
        Patent memory currentPatent = _getPatentById(_patentId);
        
        require(currentPatent.status == Status.Granted, "Patent not granted.");
        require(currentPatent.expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");
        
        Royalty royaltyContract = Royalty(lincesedOrgRoyaltyContract[_patentId][msg.sender]);
        royaltyContract.approveForRoyalty();
        
        emit RoyaltyContractApproved(_patentId, lincesedOrgRoyaltyContract[_patentId][msg.sender], msg.sender);
    }


    //Patent Owner actions
    function createRoyaltyContract(bytes32 _patentId, address _licensee, uint256 _royaltyFee, uint256 _paymentInterval, uint256 _contractExpirationPeriod) external onlyPatentOwner(_patentId) {
        Patent memory currentPatent = _getPatentById(_patentId);
        uint256 currentPatentIndex = _getPatentIndexById(_patentId);

        require(currentPatent.status == Status.Granted, "Patent not granted.");
        require(currentPatent.expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");

        address newRoyaltyContract = address(new Royalty(_patentId, _licensee, _royaltyFee, _paymentInterval, _contractExpirationPeriod, payable(msg.sender)));
        lincesedOrgRoyaltyContract[_patentId][_licensee] = newRoyaltyContract;
        

        currentPatent.licensees[currentPatent.licensees.length + 1] = _licensee;
        _setPatentAtIndex(currentPatentIndex, currentPatent);

        emit RoyaltyContractCreated(_patentId, msg.sender, _royaltyFee, _paymentInterval, _licensee, newRoyaltyContract);
    }

  

    function destroyRoyaltyContract(bytes32 _patentId, address _licensee) external onlyPatentOwner(_patentId) {
        Patent memory currentPatent = _getPatentById(_patentId);
        uint256 currentPatentIndex = _getPatentIndexById(_patentId);


        require(currentPatent.status == Status.Granted, "Patent not granted.");

        address royaltyContractAddress = lincesedOrgRoyaltyContract[_patentId][_licensee];
        require(royaltyContractAddress != address(0), "Royalty contract does not exist");

        Royalty royaltyContract = Royalty(royaltyContractAddress);
        require(royaltyContract.getLicenseeApprovalForDestroy(), "Licensee has not approved the destruction of the royalty contract");


        royaltyContract.destroySmartContract();
        delete lincesedOrgRoyaltyContract[_patentId][_licensee];
        currentPatent.licensees = _removeAddressValueFromArray(currentPatent.licensees, _licensee);
        _setPatentAtIndex(currentPatentIndex, currentPatent);


        emit RoyaltyContractDestroyed(_patentId, _licensee, royaltyContractAddress);
    }

    function checkValidityOfRoyaltyContract(bytes32 _patentId, address _licensee) external onlyPatentOwner(_patentId) {
        Patent memory currentPatent = _getPatentById(_patentId);
        uint256 currentPatentIndex = _getPatentIndexById(_patentId);


        require(currentPatent.status == Status.Granted, "Patent not granted.");

        address royaltyContractAddress = lincesedOrgRoyaltyContract[_patentId][_licensee];
        require(royaltyContractAddress != address(0), "Royalty contract does not exist");

        Royalty royaltyContract = Royalty(royaltyContractAddress);

        if (currentPatent.expirationDate < block.timestamp + 1 days || !royaltyContract.getIsContractValid()) {
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


        // emit PatentEx(_patentId, patents[_patentId].owner, patents[_patentId].expirationDate);
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

    // function extendExpirationDateOfPatent(bytes32 _patentId) external onlyAdmin {
    //     Patent memory currentPatent = _getPatentById(_patentId);
    //     uint256 currentPatentIndex = _getPatentIndexById(_patentId);

    //     require(currentPatent.status == Status.Granted, "Patent not granted.");
    //     require(currentPatent.expirationExtension == Status.Pending, "Patent extension not in Pending state.");
    //     require(currentPatent.expirationDate > block.timestamp + 1 days, "Patent will expire in less than 1 day.");
    //     currentPatent.expirationDate += EXNTENSION_DURATION;
    //     _setPatentAtIndex(currentPatentIndex, currentPatent);

    //     emit PatentExtended(_patentId, currentPatent.owner, currentPatent.expirationDate);
    // }


  
}