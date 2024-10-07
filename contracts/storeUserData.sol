// 指定了智能合约的许可证为GNU General Public License v2.0或更高版本
// SPDX-License-Identifier: GPL-2.0-or-later

// 指定编译器版本，该合约适用于Solidity版本0.7.0以上，0.9.0以下
pragma solidity >=0.7.0 < 0.9.0;

// 启用ABI编码器v2版本，提供更丰富的数据类型
pragma abicoder v2;

// 定义一个名为UserStorageData的智能合约
contract UserStorageData{
     // 定义一个结构体TransactionStruck，用于存储交易信息
     struct TransactionStruck{
        address caller;         // 调用者的地址
        address poolAddress;    // 池地址
        address tokenAddress0;  // 交易中涉及的第一个代币地址
        address tokenAddress1;  // 交易中涉及的第二个代币地址
     }

     // 定义一个动态数组transactions，用来存储所有交易的TransactionStruck结构体
     TransactionStruck[] transactions;

     // 定义一个公共函数addToBlockchain，用于添加交易信息到区块链
     function addToBlockchain(address poolAddress, address tokenAddress0, address tokenAddress1) public{
        // 将新的交易信息添加到transactions数组中
        transactions.push(TransactionStruck(msg.sender, poolAddress, tokenAddress0, tokenAddress1));
     }

     // 定义一个公共函数getAllTransactions，用于返回所有存储的交易信息
     function getAllTransactions() public view returns(TransactionStruck[] memory) {
        // 返回transactions数组，包含所有交易信息
        return transactions;
     }

}
