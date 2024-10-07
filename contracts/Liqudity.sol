// // SPDX-License-Identifier: GPL-2.0-or-later
// pragma solidity >=0.7.6 <0.9.0;
// pragma abicoder v2;

// // 引入 Uniswap V3 和 OpenZeppelin 合约库
// import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
// import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
// import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
// import "@uniswap/v3-periphery/contracts/base/LiquidityManagement.sol";
// import "hardhat/console.sol";

// // 定义合约，继承 IERC721Receiver 接口以接收 ERC721 代币
// contract LiquidityExamples is IERC721Receiver {
//     // 定义常量 DAI 和 USDC 的地址
//     address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
//     address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

//     // 定义池子的手续费率为 0.01%
//     uint24 public constant poolFee = 100;

//     // 定义 Nonfungible Position Manager 的实例
//     INonfungiblePositionManager public nonfungiblePositionManager =
//         INonfungiblePositionManager(0xC36442b4a4522E871399CD717aBDD847Ab11FE88);

//     // 定义存储 NFT 存款信息的结构体
//     struct Deposit {
//         address owner;
//         uint128 liquidity;
//         address token0;
//         address token1;
//     }

//     // 定义一个映射，用于根据 tokenId 存储 Deposit 结构体
//     mapping(uint => Deposit) public deposits;

//     // 存储当前使用的 tokenId
//     uint public tokenId;

//     // 实现 onERC721Received 接口方法，使合约能够接收 ERC721 代币
//     function onERC721Received(
//         address operator,
//         address,
//         uint _tokenId,
//         bytes calldata
//     ) external override returns (bytes4) {
//         _createDeposit(operator, _tokenId);
//         return this.onERC721Received.selector;
//     }

//     // 内部方法，创建一个新的存款记录
//     function _createDeposit(address owner, uint _tokenId) internal {
//         (
//             ,
//             ,
//             address token0,
//             address token1,
//             ,
//             ,
//             ,
//             uint128 liquidity,
//             ,
//             ,
//             ,

//         ) = nonfungiblePositionManager.positions(_tokenId);

//         // 设置存款信息
//         deposits[_tokenId] = Deposit({
//             owner: owner,
//             liquidity: liquidity,
//             token0: token0,
//             token1: token1
//         });

//         // 输出日志信息
//         console.log("Token id", _tokenId);
//         console.log("Liquidity", liquidity);

//         // 更新当前 tokenId
//         tokenId = _tokenId;
//     }

//     // 外部方法，创建一个新的流动性头寸
//     function mintNewPosition()
//         external
//         returns (uint _tokenId, uint128 liquidity, uint amount0, uint amount1)
//     {
//         // 为这个示例，我们将提供等量的两种资产的流动性
//         uint amount0ToMint = 100 * 1e18; // 100 DAI
//         uint amount1ToMint = 100 * 1e6; // 100 USDC

//         // 批准 Position Manager 使用这两个资产
//         TransferHelper.safeApprove(
//             DAI,
//             address(nonfungiblePositionManager),
//             amount0ToMint
//         );
//         TransferHelper.safeApprove(
//             USDC,
//             address(nonfungiblePositionManager),
//             amount1ToMint
//         );

//         // 定义 MintParams 结构体，指定铸造新头寸的参数
//         INonfungiblePositionManager.MintParams
//             memory params = INonfungiblePositionManager.MintParams({
//                 token0: DAI,
//                 token1: USDC,
//                 fee: poolFee,
//                 tickLower: TickMath.MIN_TICK,
//                 tickUpper: TickMath.MAX_TICK,
//                 amount0Desired: amount0ToMint,
//                 amount1Desired: amount1ToMint,
//                 amount0Min: 0,
//                 amount1Min: 0,
//                 recipient: address(this),
//                 deadline: block.timestamp
//             });

//         // 铸造新的头寸
//         (_tokenId, liquidity, amount0, amount1) = nonfungiblePositionManager
//             .mint(params);

//         // 创建存款记录
//         _createDeposit(msg.sender, _tokenId);

//         // 退还未使用的资产
//         if (amount0 < amount0ToMint) {
//             TransferHelper.safeApprove(
//                 DAI,
//                 address(nonfungiblePositionManager),
//                 0
//             );
//             uint refund0 = amount0ToMint - amount0;
//             TransferHelper.safeTransfer(DAI, msg.sender, refund0);
//         }
//         if (amount1 < amount1ToMint) {
//             TransferHelper.safeApprove(
//                 USDC,
//                 address(nonfungiblePositionManager),
//                 0
//             );
//             uint refund1 = amount1ToMint - amount1;
//             TransferHelper.safeTransfer(USDC, msg.sender, refund1);
//         }
//     }

//     // 外部方法，收集所有费用
//     function collectAllFees()
//         external
//         returns (uint256 amount0, uint256 amount1)
//     {
//         // 定义 CollectParams 结构体，指定收集费用的参数
//         INonfungiblePositionManager.CollectParams
//             memory params = INonfungiblePositionManager.CollectParams({
//                 tokenId: tokenId,
//                 recipient: address(this),
//                 amount0Max: type(uint128).max,
//                 amount1Max: type(uint128).max
//             });

//         // 收集费用
//         (amount0, amount1) = nonfungiblePositionManager.collect(params);

//         // 输出日志信息
//         console.log("fee 0", amount0);
//         console.log("fee 1", amount1);
//     }

//     // 外部方法，增加当前范围内的流动性
//     function increaseLiquidityCurrentRange(
//         uint256 amountAdd0,
//         uint256 amountAdd1
//     ) external returns (uint128 liquidity, uint256 amount0, uint256 amount1) {
//         // 转移资产到合约
//         TransferHelper.safeTransferFrom(
//             DAI,
//             msg.sender,
//             address(this),
//             amountAdd0
//         );
//         TransferHelper.safeTransferFrom(
//             USDC,
//             msg.sender,
//             address(this),
//             amountAdd1
//         );

//         // 批准 Position Manager 使用这些资产
//         TransferHelper.safeApprove(
//             DAI,
//             address(nonfungiblePositionManager),
//             amountAdd0
//         );
//         TransferHelper.safeApprove(
//             USDC,
//             address(nonfungiblePositionManager),
//             amountAdd1
//         );

//         // 定义 IncreaseLiquidityParams 结构体，指定增加流动性的参数
//         INonfungiblePositionManager.IncreaseLiquidityParams
//             memory params = INonfungiblePositionManager
//                 .IncreaseLiquidityParams({
//                     tokenId: tokenId,
//                     amount0Desired: amountAdd0,
//                     amount1Desired: amountAdd1,
//                     amount0Min: 0,
//                     amount1Min: 0,
//                     deadline: block.timestamp
//                 });

//         // 增加流动性
//         (liquidity, amount0, amount1) = nonfungiblePositionManager
//             .increaseLiquidity(params);

//         // 输出日志信息
//         console.log("liquidity", liquidity);
//         console.log("amount 0", amount0);
//         console.log("amount 1", amount1);
//     }

//     // 外部方法，获取指定 tokenId 的流动性
//     function getLiquidity(uint _tokenId) external view returns (uint128) {
//         (, , , , , , , uint128 liquidity, , , , ) = nonfungiblePositionManager
//             .positions(_tokenId);
//         return liquidity;
//     }

//     // 外部方法，减少流动性
//     function decreaseLiquidity(
//         uint128 liquidity
//     ) external returns (uint amount0, uint amount1) {
//         // 定义 DecreaseLiquidityParams 结构体，指定减少流动性的参数
//         INonfungiblePositionManager.DecreaseLiquidityParams
//             memory params = INonfungiblePositionManager
//                 .DecreaseLiquidityParams({
//                     tokenId: tokenId,
//                     liquidity: liquidity,
//                     amount0Min: 0,
//                     amount1Min: 0,
//                     deadline: block.timestamp
//                 });

//         // 减少流动性
//         (amount0, amount1) = nonfungiblePositionManager.decreaseLiquidity(
//             params
//         );

//         // 输出日志信息
//         console.log("amount 0", amount0);
//         console.log("amount 1", amount1);
//     }
// }
