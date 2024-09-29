// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;

// IWETH 接口，定义了 WETH 合约的基本函数和事件
interface IWETH {
    // 存款函数，将以太 (ETH) 存入合约，转换为 WETH
    function deposit() external payable;

    // 提款函数，将指定数量的 WETH 兑换回以太 (ETH)
    function withdraw(uint amount) external;

    // 返回 WETH 的总供应量
    function totalSupply() external view returns (uint);

    // 返回指定账户的 WETH 余额
    function balanceOf(address account) external view returns (uint);

    // 将指定数量的 WETH 转移到指定接收者
    function transfer(address recipient, uint amount) external returns (bool);

    // 返回指定所有者授权给指定花费者的 WETH 额度
    function allowance(address owner, address spender) external view returns (uint);

    // 批准指定花费者可以花费指定数量的 WETH
    function approve(address spender, uint amount) external returns (bool);

    // 从指定发送者账户转移指定数量的 WETH 到指定接收者
    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    // 转账事件，在 WETH 转移时触发
    event Transfer(address indexed from, address indexed to, uint value);

    // 授权事件，在 WETH 授权时触发
    event Approval(address indexed owner, address indexed spender, uint value);
}
