import Web3Modal from "web3modal";
import { Contract, ethers } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";

// 定义 Uniswap 合约地址
var wethAddress;
var factoryAddress;
var swapRouterAddress;
var nftDescriptorAddress;
var positionDescriptorAddress;
var positionManagerAddress;

wethAddress = '0xf09e7Af8b380cD01BD0d009F83a6b668A47742ec';
factoryAddress = '0x492844c46CEf2d751433739fc3409B7A4a5ba9A7';
swapRouterAddress = '0x50cf1849e32E6A17bBFF6B1Aa8b1F7B479Ad6C12';
nftDescriptorAddress = '0xC1dC7a8379885676a6Ea08E67b7Defd9a235De71';
positionDescriptorAddress = '0xf0F5e9b00b92f3999021fD8B88aC75c351D93fc7';
positionManagerAddress = '0xCC9676b9bf25cE45a3a5F88205239aFdDeCF1BC7';

// 引入合约 ABI
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  WETH9: require("../Context/WETH9.json"),
};

// 获取池子数据
async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

// 添加流动性的外部函数
export const addLiquidityExternal = async (
  tokenAddress1,
  tokenAddress2,
  poolAddress,
  poolFee,
  tokenAmount1,
  tokenAmount2
) => {
  const web3modal = new Web3Modal();
  const connection = await web3modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const accountAddress = await signer.getAddress();

  // 初始化两个代币的合约
  const token1Contract = new Contract(
    tokenAddress1,
    artifacts.WETH9.abi,
    provider
  );
  const token2Contract = new Contract(
    tokenAddress2,
    artifacts.WETH9.abi,
    provider
  );

  // 授权 Nonfungible Position Manager 合约操作代币
  await token1Contract
    .connect(signer)
    .approve(
      positionManagerAddress,
      ethers.utils.parseEther(tokenAmount1.toString())
    );

  await token2Contract
    .connect(signer)
    .approve(
      positionManagerAddress,
      ethers.utils.parseEther(tokenAmount2.toString())
    );

  // 获取池子合约实例
  const poolContract = new Contract(
    poolAddress,
    artifacts.UniswapV3Pool.abi,
    provider
  );

  // 获取网络 ID
  const { chainId } = await provider.getNetwork();

  // 获取代币信息
  const token1Name = await token1Contract.name();
  const token1Symbol = await token1Contract.symbol();
  const token1Decimals = await token1Contract.decimals();
  const token1Address = token1Contract.address;

  const token2Name = await token2Contract.name();
  const token2Symbol = await token2Contract.symbol();
  const token2Decimals = await token2Contract.decimals();
  const token2Address = token2Contract.address;

  // 创建 Uniswap Token 对象
  const TokenA = new Token(
    chainId,
    token1Address,
    token1Decimals,
    token1Name,
    token1Symbol
  );
  const TokenB = new Token(
    chainId,
    token2Address,
    token2Decimals,
    token2Name,
    token2Symbol
  );

  // 获取并打印池子数据
  const poolData = await getPoolData(poolContract);
  console.log(poolData);

  // 创建池子对象
  const pool = new Pool(
    TokenA,
    TokenB,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  // 计算位置
  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther("1"),
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
  });

  // 计算所需代币数量
  const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

  // 构建交易参数
  const params = {
    token0: tokenAddress1,
    token1: tokenAddress2,
    fee: poolData.fee,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: accountAddress,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,  // 设置交易截止时间
  };

  // 使用 Nonfungible Position Manager 合约添加流动性
  const nonfungiblePositionManager = new Contract(
    positionManagerAddress,
    artifacts.NonfungiblePositionManager.abi,
    signer
  );

  try {
    const transactionResponse = await nonfungiblePositionManager.mint(params);
    const transactionReceipt = await transactionResponse.wait();
    console.log('Transaction successful:', transactionReceipt);
    return transactionReceipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
