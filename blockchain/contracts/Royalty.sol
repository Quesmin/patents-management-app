// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Royalty {
    address public licensee;
    uint256 public royaltyFee;
    uint256 public paymentInterval;
    uint256 public expirationDate;
    uint256 public payedUntil;
    bool public approvedForDestroy;
    bool public approvedForRoyalty;
    address payable public patentOwner;
    
    constructor(address _licensee, uint256 _royaltyFee, uint256 _paymentInterval, uint256 _expirationDate, address payable _patentOwner) {
        licensee = _licensee;
        royaltyFee = _royaltyFee;
        paymentInterval = _paymentInterval;
        expirationDate = _expirationDate;
        payedUntil = block.timestamp + _paymentInterval;

        approvedForDestroy = false;
        approvedForRoyalty = false;
        patentOwner = _patentOwner;
    }

    //TODOOOOOOO: MAYBE ADD CHECKS ONLY ALLOW MANAGEMENT CONTRACT TO MAKE THESE CALLS (WHERE IS THE CASE)

    function approveForRoyalty() public {
        require(msg.sender == licensee, "Only licensee can approve for royalty.");
        approvedForRoyalty = true;
    }

    function approveForDestroy() public {
        require(msg.sender == licensee, "Only licensee can approve for destroy.");
        approvedForDestroy = true;
    }

    function getLicenseeApprovalForDestroy() external view returns (bool) {
        return approvedForDestroy;
    }

    function payRoyalty() external payable{
        require(msg.sender == licensee, "Only licensee can pay the royalty.");
        require(msg.value == royaltyFee, "Incorrect fee value.");
        require(payedUntil + paymentInterval <= expirationDate, "The payement extension interval exceeds expiration date.");

        patentOwner.transfer(msg.value);
        payedUntil = payedUntil + paymentInterval;
    }

    function getIsContractValid() external view returns (bool) {
        if(block.timestamp > expirationDate){
            return false;
        }

        if(block.timestamp > payedUntil){
            return false;
        }

        return true;
    }

    function destroySmartContract() external {
        require(msg.sender == patentOwner, "Only the patent owner can destroy the contract");
        selfdestruct(patentOwner);
    }
}