// 引入 ethers.js 库，这是一个用于与以太坊区块链交互的库。
const { ethers } = require("ethers");

// 引入 Uniswap V3 池合约的 ABI。
const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

// 引入 Uniswap V3 的 Quoter 合约的 ABI，用于获取交易报价。
const {
  abi: QuoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

// 引入自定义的辅助函数，用于获取代币 ABI 和池合约的不变属性。
const { getAbi, getPoolImmutables } = require("./priceHelpers");

// 定义连接到以太坊主网的 RPC URL。
const MAINNET_URL = "https://eth-mainnet.g.alchemy.com/v2/QsVbrlR_F0W7NStM5YBu8rgZugugSCdn";
const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

// 定义 Quoter 合约的地址。
const qutorAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

// 定义一个异步函数，用于获取给定输入金额和池地址的价格信息。
export const getPrice = async (inputAmount, poolAddress) => {
    // 创建一个新的合约实例用于与 Uniswap V3 池合约进行交互。
    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI,
      provider
    );

    // 获取池中两种代币的地址。
    const tokenAddrss0 = await poolContract.token0();
    const tokenAddrss1 = await poolContract.token1();

    // 打印代币地址，用于调试。
    console.log(tokenAddrss0, tokenAddrss1);

    // 使用辅助函数获取两种代币的 ABI。
    const tokenAbi0 = await getAbi(tokenAddrss0);
    const tokenAbi1 = await getAbi(tokenAddrss1);

    // 创建代币合约实例以获取代币的符号和小数位。
    const tokenContract0 = new ethers.Contract(tokenAddrss0, tokenAbi0, provider);
    const tokenContract1 = new ethers.Contract(tokenAddrss1, tokenAbi1, provider);
  
    const tokenSymbol0 = await tokenContract0.symbol();
    const tokenSymbol1 = await tokenContract1.symbol();
    const tokenDecimals0 = await tokenContract0.decimals();
    const tokenDecimals1 = await tokenContract1.decimals();
  
    // 创建 Quoter 合约实例。
    const quoterContract = new ethers.Contract(qutorAddress, QuoterABI, provider);
  
    // 获取池合约的不变属性。
    const immutables = await getPoolImmutables(poolContract);

    // 将输入金额从标准单位转换为最小单位。
    const amountIn = ethers.utils.parseUnits(
        inputAmount.toString(),
        tokenDecimals0
      );
    
    // 使用 Quoter 合约获取交易的预估输出金额。
    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
        immutables.token0,
        immutables.token1,
        immutables.fee,
        amountIn,
        0
      );
    
    // 将预估输出金额从最小单位转换回标准单位。
    const amountOut = ethers.utils.formatUnits(quotedAmountOut, tokenDecimals1);
    
    // 返回转换结果和代币符号。
    return [amountOut, tokenSymbol0, tokenSymbol1];
};
