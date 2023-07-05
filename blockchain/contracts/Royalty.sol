// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Royalty is Pausable, Ownable {
    address public licensee;
    address payable public patentOwner;
    uint256 public royaltyFee;
    uint256 public paymentInterval;
    uint256 public expirationDate;
    uint256 public paidUntil;
    bool public approvedForDestroy;
    bytes32 public patentId;

    event RoyaltyContractApprovedForDestroy(bytes32 indexed patentId, address indexed owner, address licensee, address indexed contractAddress);
    event RoyaltyPaid(bytes32 indexed patentId, address indexed contractAddress, address indexed licensee, uint256 royaltyFee, uint256 paidUntil );

    
    constructor(bytes32 _patentId, address _licensee, uint256 _royaltyFee, uint256 _paymentInterval, uint256 _expirationDate, address payable _patentOwner) Pausable() Ownable() {
        patentId = _patentId;
        licensee = _licensee;
        royaltyFee = _royaltyFee;
        paymentInterval = _paymentInterval;
        expirationDate = _expirationDate;
        paidUntil = block.timestamp + _paymentInterval;

        _pause();
        approvedForDestroy = false;
        patentOwner = _patentOwner;
    }

   

    function approveForRoyalty() external onlyOwner whenPaused{
        _unpause();
    }

    function getIsPaused() external onlyOwner view returns (bool) {
        return paused();
    }

    function getContractInfo() external onlyOwner view returns (bytes32, address, address, uint256, uint256, uint256, uint256, bool, bool) {
        return (patentId, patentOwner, licensee, royaltyFee, paymentInterval, expirationDate, paidUntil, approvedForDestroy, paused());
    }

    function payRoyalty() public whenNotPaused payable{
        require(msg.sender == licensee, "Only licensee can pay the royalty.");
        require(msg.value == royaltyFee, "Incorrect fee value.");
        require(paidUntil + paymentInterval <= expirationDate, 
        "The payment extension interval exceeds expiration date.");

        patentOwner.transfer(msg.value);
        paidUntil = paidUntil + paymentInterval;

        emit RoyaltyPaid(patentId, address(this), licensee, royaltyFee, paidUntil);
    }

    function getIsContractValid() external onlyOwner view returns (bool) {
        if(block.timestamp > expirationDate){
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

    receive() external payable {
        payRoyalty();
    }
}