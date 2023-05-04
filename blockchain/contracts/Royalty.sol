// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Royalty is Pausable, Ownable {
    address public licensee;
    address payable public patentOwner;
    uint256 public royaltyFee;
    uint256 public paymentInterval;
    uint256 public expirationPeriod;
    uint256 public paidUntil;
    bool public approvedForDestroy;
    bool public approvedForRoyalty;
    bytes32 public patentId;

    event RoyaltyContractApprovedForDestroy(bytes32 indexed patentId, address indexed owner, address licensee, address indexed contractAddress);
    event RoyaltyPaid(bytes32 indexed patentId, address indexed contractAddress, address indexed licensee, uint256 royaltyFee, uint256 paidUntil );

    
    constructor(bytes32 _patentId, address _licensee, uint256 _royaltyFee, uint256 _paymentInterval, uint256 _expirationPeriod, address payable _patentOwner) Pausable() Ownable() {
        patentId = _patentId;
        licensee = _licensee;
        royaltyFee = _royaltyFee;
        paymentInterval = _paymentInterval;
        expirationPeriod = block.timestamp + _expirationPeriod;
        paidUntil = block.timestamp + _paymentInterval;

        approvedForDestroy = false;
        approvedForRoyalty = false;
        patentOwner = _patentOwner;
    }

    function approveForRoyalty() external onlyOwner whenNotPaused{
        approvedForRoyalty = true;
    }

    function approveForDestroy() external whenNotPaused {
        require(msg.sender == licensee, "Only licensee can approve for destroy.");
        approvedForDestroy = true;

        emit RoyaltyContractApprovedForDestroy(patentId, patentOwner, licensee, address(this));
    }

    function getLicenseeApprovalForDestroy() external onlyOwner whenNotPaused view returns (bool) {
        return approvedForDestroy;
    }

    function payRoyalty() external whenNotPaused payable{
        require(msg.sender == licensee, "Only licensee can pay the royalty.");
        require(msg.value == royaltyFee, "Incorrect fee value.");
        require(paidUntil + paymentInterval <= expirationPeriod, "The payment extension interval exceeds expiration date.");

        patentOwner.transfer(msg.value);
        paidUntil = paidUntil + paymentInterval;

        emit RoyaltyPaid(patentId, address(this), licensee, royaltyFee, paidUntil);
    }

    function getIsContractValid() external onlyOwner whenNotPaused view returns (bool) {
        if(block.timestamp > expirationPeriod){
            return false;
        }

        if(block.timestamp > paidUntil){
            return false;
        }

        return true;
    }

    function destroySmartContract() external onlyOwner whenNotPaused {
        _pause();
    }
}