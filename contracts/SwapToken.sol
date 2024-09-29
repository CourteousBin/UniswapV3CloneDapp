// SPDX-License-Identifier: GPL v2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract SingleSwapToken {
    // Uniswap V3 SwapRouter 主网路由地址
    ISwapRouter public constant swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    // 常量代币地址
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    // 单路径交换函数，输入固定数量的 WETH9，输出 DAI
    function swapExactInputSingle(
        uint amountIn
    ) external returns (uint amountOut) {
        // 将 WETH9 从调用者转移到此合约
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountIn
        );

        // 批准 SwapRouter 使用 WETH9
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);

        // 构建交换参数
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: 3000,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // 执行交换
        amountOut = swapRouter.exactInputSingle(params);
    }

    // 单路径交换函数，输出固定数量的 DAI，输入 WETH9 的最大数量
    function swapExactOutputSingle(
        uint amountOut,
        uint amountInMaximum
    ) external returns (uint amountIn) {
        // 将 WETH9 从调用者转移到此合约
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountInMaximum
        );

        // 批准 SwapRouter 使用 WETH9
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountInMaximum);

        // 构建交换参数
        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: 3000,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        // 执行交换
        amountIn = swapRouter.exactOutputSingle(params);

        // 如果实际输入的 WETH9 少于最大数量，退还多余的 WETH9
        if (amountIn < amountInMaximum) {
            TransferHelper.safeApprove(WETH9, address(swapRouter), 0);
            TransferHelper.safeTransfer(
                WETH9,
                msg.sender,
                amountInMaximum - amountIn
            );
        }
    }
}
