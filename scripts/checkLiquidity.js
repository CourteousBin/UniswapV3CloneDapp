SHO_RAY= '0x4509A7bB45f3A28dE47489Dc757fc17426493157';

// 引入Uniswap V3池合约的JSON定义，这是合约的接口描述信息。
const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
// 引入ethers库中的Contract对象，用于创建和操作智能合约。
const { Contract } = require("ethers");
// 引入Uniswap V3 SDK中的Pool类，用于处理池相关的数据和计算。
const { Pool } = require("@uniswap/v3-sdk");
// 引入Uniswap SDK中的Token类，用于创建和管理代币信息。
const { Token } = require("@uniswap/sdk-core");

// 定义一个异步函数getPoolData，用于获取并整理Uniswap V3池的相关数据。
async function getPoolData(poolContract) {
    // 使用Promise.all来并行执行多个合约调用，提高效率。
    const [
        tickSpacing,
        fee,
        liquidity,
        slot0,
        factory,
        token0,
        token1,
        maxLiquidityPerTick,
    ] = await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
        poolContract.factory(),
        poolContract.token0(),
        poolContract.token1(),
        poolContract.maxLiquidityPerTick(),
    ]);

    // 创建两个Token实例，分别对应池中的两种代币。
    const TokenA = new Token(3, token0, 18, "SHO", "Shoaib");
    const TokenB = new Token(3, token1, 18, "RAY", "Rayyan");

    // 创建一个Pool实例，表示Uniswap V3中的一个流动性池。
    const poolExample = new Pool(
        TokenA,
        TokenB,
        fee,
        slot0[0].toString(),
        liquidity.toString(),
        slot0[1]
    );

    // 返回整理好的池数据，包括各种参数和创建的Pool实例。
    return {
        factory: factory,
        token0: token0,
        token1: token1,
        maxLiquidityPerTick: maxLiquidityPerTick,
        tickSpacing: tickSpacing,
        fee: fee,
        liquidity: liquidity.toString(),
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
        observationIndex: slot0[2],
        observationCardinality: slot0[3],
        observationCardinalityNext: slot0[4],
        feeProtocol: slot0[5],
        unlocked: slot0[6],
        poolExample,
    };
}

// 定义主函数main，用于执行脚本的主要逻辑。
async function main() {
    // 使用waffle提供的provider，这是与以太坊网络交互的接口。
    const provider = waffle.provider;
    // 使用合约地址和ABI创建一个合约实例。
    const poolContract = new Contract(SHO_RAY, UniswapV3Pool.abi, provider);
    // 获取池数据并打印。
    const poolData = await getPoolData(poolContract);
    console.log("poolData", poolData);
}

// 执行main函数，并根据执行结果处理退出状态。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
