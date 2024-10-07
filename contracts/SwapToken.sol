// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

// 引入 Uniswap V3 库和接口
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

// 定义 SingleSwapToken 合约
contract SingleSwapToken {
    // 定义一个常量地址，指向 Uniswap V3 的 SwapRouter
    ISwapRouter public constant swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    // 定义两个代币交换的函数，用于通过 Uniswap V3 交换指定数量的输入代币为输出代币
    function swapExactInputSingle(
        address token1,
        address token2,
        uint amountIn
    ) external returns (uint amountOut) {
        // 从调用者账户中安全转移指定数量的 token1 到合约地址
        TransferHelper.safeTransferFrom(
            token1,
            msg.sender,
            address(this),
            amountIn
        );

        // 授权 Uniswap 路由器从本合约中花费 token1
        TransferHelper.safeApprove(token1, address(swapRouter), amountIn);

        // 设置 Uniswap 交易参数
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: token1,
                tokenOut: token2,
                fee: 3000, // 指定 Uniswap 池的费率层级，这里是 0.3%
                recipient: msg.sender, // 最终接收输出代币的地址
                deadline: block.timestamp, // 交易截止时间
                amountIn: amountIn, // 输入代币数量
                amountOutMinimum: 0, // 最小输出代币数量
                sqrtPriceLimitX96: 0 // 价格限制参数
            });
        // 执行交换并返回输出代币数量
        amountOut = swapRouter.exactInputSingle(params);
    }

    // 定义一个函数，用于通过 Uniswap V3 交换指定数量的输出代币为输入代币
    function swapExactOutputSingle(
        address token1,
        address token2,
        uint amountOut,
        uint amountInMaximum
    ) external returns (uint amountIn) {
        // 从调用者账户中安全转移最大输入数量的 token1 到合约地址
        TransferHelper.safeTransferFrom(
            token1,
            msg.sender,
            address(this),
            amountInMaximum
        );

        // 授权 Uniswap 路由器从本合约中花费最大输入数量的 token1
        TransferHelper.safeApprove(
            token1,
            address(swapRouter),
            amountInMaximum
        );

        // 设置 Uniswap 交易参数
        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: token1,
                tokenOut: token2,
                fee: 3000, // 指定 Uniswap 池的费率层级
                recipient: msg.sender, // 最终接收输出代币的地址
                deadline: block.timestamp, // 交易截止时间
                amountOut: amountOut, // 输出代币数量
                amountInMaximum: amountInMaximum, // 最大输入代币数量
                sqrtPriceLimitX96: 0 // 价格限制参数
            });

        // 执行交换并返回实际使用的输入代币数量
        amountIn = swapRouter.exactOutputSingle(params);

        // 如果实际使用的输入代币少于最大输入，退回多余的代币给调用者
        if (amountIn < amountInMaximum) {
            TransferHelper.safeApprove(token1, address(swapRouter), 0);
            TransferHelper.safeTransfer(
                token1,
                msg.sender,
                amountInMaximum - amountIn
            );
        }
    }
}
