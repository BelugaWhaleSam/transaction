// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

contract Transactions {
    uint256 transactionCount; // holds number of transactions

    event Transfer(
        address from,
        address receiver,
        uint amount,
        string message,
        uint256 timestamp,
        string keyword
    ); // event to be emitted when a transaction is made

    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    } // struct to hold transaction details

    TransferStruct[] transactions; // array to hold all transactions objects

    // payable implies the function can receive ether
    function addToBlockchain(
        address payable receiver,
        uint amount,
        string memory message,
        string memory keyword
    ) public {
        transactionCount += 1;
        // Push specific transaction into the transaction array,note: this doesnt do the transsaction only stores it in the array
        transactions.push(
            TransferStruct(
                msg.sender,
                receiver,
                amount,
                message,
                block.timestamp,
                keyword
            )
        );
        // Emit event to be listened to by the frontend to make the transaction
        emit Transfer(
            msg.sender,
            receiver,
            amount,
            message,
            block.timestamp,
            keyword
        );
    }

    function getAllTransaction() public view returns (TransferStruct[] memory) {
        return transactions; // return transaction details as objects from the array
    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCount; // number of transactions using transactionCount
    }
}
