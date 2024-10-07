// 引入ethers库和BigNumber，用于与以太坊进行交互和处理大数
import { ethers, BigNumber } from "ethers";
// 引入axios用于发起HTTP请求（虽然在这段代码中没有直接使用）
import { axios } from "axios";
// 引入Web3Modal，用于连接用户的以太坊钱包
import Web3Modal from "web3modal";

// 引入bignumber.js库，用于更精确的大数运算
const bn = require("bignumber.js");
// 配置bignumber.js的参数
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

// 定义Uniswap V3工厂合约和非同质化位置管理器的地址
const UNISWAP_V3_FACTORY_ADDRESS = '0x3CA5269B5c54d4C807Ca0dF7EeB2CB7a5327E77d';
const NON_FUNGABLE_MANAGER = '0x50cf1849e32E6A17bBFF6B1Aa8b1F7B479Ad6C12';

// 引入Uniswap V3的工厂合约和非同质化位置管理器的ABI和地址
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

// 获取Uniswap V3工厂合约的函数
export const fetchPoolContract = (signerOrProvider) =>
  new ethers.Contract(
    UNISWAP_V3_FACTORY_ADDRESS,
    artifacts.UniswapV3Factory.abi,
    signerOrProvider
  );

// 获取非同质化位置管理器合约的函数
export const fetchPositionContract = (signerOrProvider) =>
  new ethers.Contract(
    NON_FUNGABLE_MANAGER,
    artifacts.NonfungiblePositionManager.abi,
    signerOrProvider
  );

// 编码价格平方根的函数，用于计算和设置Uniswap V3池的初始价格
const encodePriceSqrt = (reserve1, reserve0) => {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
};

// 连接并初始化Uniswap V3池的函数
export const connectingWithPoolContract = async (
  address1,
  address2,
  fee,
  tokenFee1,
  tokenFee2
) => {
  const web3modal = new Web3Modal();
  const connection = await web3modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  console.log(signer);

  const createPoolContract = await fetchPositionContract(signer);

  const price = encodePriceSqrt(tokenFee1, tokenFee2);
  console.log('what is the ', tokenFee1, tokenFee2, fee, price, signer);

  const transaction = await createPoolContract
    .connect(signer)
    .createAndInitializePoolIfNecessary(address1, address2, fee, price, {
      gasLimit: 5000000,
    });

  await transaction.wait();
  // console.log(transaction);

  const factory = await fetchPoolContract(signer);
  const poolAddress = await factory.getPool(address1, address2, fee);

  return poolAddress;
};
