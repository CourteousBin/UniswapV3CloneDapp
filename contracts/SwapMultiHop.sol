// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

// 导入 Uniswap V3 的 TransferHelper 库，用于安全的代币转移
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
// 导入 Uniswap V3 的 ISwapRouter 接口，用于执行交换操作
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract SwapMultiHop {
    // 定义 Uniswap V3 交换路由器的地址
    ISwapRouter public constant swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    // 定义 DAI 代币的地址
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    // 定义 WETH9 代币的地址
    address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    // 定义 USDC 代币的地址
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    // 执行多跳交换，输入固定数量的 WETH9，输出尽可能多的 DAI
    function swapExactInputMultihop(
        uint amountIn
    ) external returns (uint amountOut) {
        // 从调用者账户中转移 amountIn 数量的 WETH9 到合约
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountIn
        );

        // 授权交换路由器使用 amountIn 数量的 WETH9
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);

        // 设置多跳交换的参数
        ISwapRouter.ExactInputParams memory params = ISwapRouter
            .ExactInputParams({
                path: abi.encodePacked(
                    WETH9,        // 第一个代币
                    uint24(3000), // 第一个池子的手续费
                    USDC,         // 第二个代币
                    uint24(100),  // 第二个池子的手续费
                    DAI           // 目标代币
                ),
                recipient: msg.sender, // 接收交换结果的地址
                deadline: block.timestamp, // 交换操作的截止时间
                amountIn: amountIn, // 输入的 WETH9 数量
                amountOutMinimum: 0 // 最小输出数量，设置为 0 表示不限制
            });

        // 执行多跳交换，并返回输出的 DAI 数量
        amountOut = swapRouter.exactInput(params);
    }

    // 执行多跳交换，输入尽可能少的 WETH9，输出固定数量的 DAI
    function swapExactOutputMultihop(
        uint amountOut,
        uint amountInMaximum
    ) external returns (uint amountIn) {
        // 从调用者账户中转移最多 amountInMaximum 数量的 WETH9 到合约
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountInMaximum
        );

        // 授权交换路由器使用最多 amountInMaximum 数量的 WETH9
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountInMaximum);

        // 设置多跳交换的参数
        ISwapRouter.ExactOutputParams memory params = ISwapRouter
            .ExactOutputParams({
                path: abi.encodePacked(
                    DAI,          // 目标代币
                    uint24(100),  // 第二个池子的手续费
                    USDC,         // 第二个代币
                    uint24(3000), // 第一个池子的手续费
                    WETH9         // 第一个代币
                ),
                recipient: msg.sender, // 接收交换结果的地址
                deadline: block.timestamp, // 交换操作的截止时间
                amountOut: amountOut, // 输出的 DAI 数量
                amountInMaximum: amountInMaximum // 输入的最大 WETH9 数量
            });

        // 执行多跳交换，并返回实际输入的 WETH9 数量
        amountIn = swapRouter.exactOutput(params);

        // 如果实际输入的 WETH9 数量少于最大值，则退还多余的 WETH9
        if (amountIn < amountInMaximum) {
            // 取消多余授权
            TransferHelper.safeApprove(WETH9, address(swapRouter), 0);
            // 将多余的 WETH9 退还给调用者
            TransferHelper.safeTransferFrom(
                WETH9,
                address(this),
                msg.sender,
                amountInMaximum - amountIn
            );
        }
    }
}
