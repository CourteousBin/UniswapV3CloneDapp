// Token 地址定义
shoaibAddress= '0xC1dC7a8379885676a6Ea08E67b7Defd9a235De71'
rayyanAddrss= '0xf0F5e9b00b92f3999021fD8B88aC75c351D93fc7'
popUpAddress= '0xCC9676b9bf25cE45a3a5F88205239aFdDeCF1BC7'

// Uniswap 合约地址定义
wethAddress= '0x9581c795DBcaf408E477F6f1908a41BE43093122'
factoryAddress= '0x3CA5269B5c54d4C807Ca0dF7EeB2CB7a5327E77d'
swapRouterAddress= '0x8a6E9a8E0bB561f8cdAb1619ECc4585aaF126D73'
nftDescriptorAddress= '0xf09e7Af8b380cD01BD0d009F83a6b668A47742ec'
positionDescriptorAddress= '0x492844c46CEf2d751433739fc3409B7A4a5ba9A7'
positionManagerAddress= '0x50cf1849e32E6A17bBFF6B1Aa8b1F7B479Ad6C12'

// 结果
// popUpAddress = 0x1D87585dF4D48E52436e26521a3C5856E4553e3F 
// rayyanAddrss = 0xDe1112a0960B9619da7F91D51fB571cdefE48B5E
// Pop_Ray= '0x4509A7bB45f3A28dE47489Dc757fc17426493157'

// 引入合约的ABI和字节码
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

// 引入必要的库
const { waffle } = require("hardhat");
const { Contract, BigNumber } = require("ethers");
const bn = require("bignumber.js");
const Web3Modal = require("web3modal");

// 配置 BigNumber 库以处理大数
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

// 定义以太坊主网的RPC URL
const MAINNET_URL = "https://eth-mainnet.g.alchemy.com/v2/QsVbrlR_F0W7NStM5YBu8rgZugugSCdn";

// 创建一个新的JSON RPC提供者
const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);



function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();

  const nonfungiblePositionManager = new Contract(
    positionManagerAddress,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );
  const factory = new Contract(
    factoryAddress,
    artifacts.UniswapV3Factory.abi,
    provider
  );


  const create = await nonfungiblePositionManager
    .connect(owner)
    .createAndInitializePoolIfNecessary(token0, token1, fee, price, {
      gasLimit: 5000000,
    });

  const poolAddress = await factory
    .connect(owner)
    .getPool(token0, token1, fee);

  return poolAddress;
}


async function main() {
  console.log('popUpAddress', popUpAddress, rayyanAddrss);
  const PopRay = await deployPool(
    popUpAddress,
    rayyanAddrss,
    3000,
    encodePriceSqrt(1, 1)
  );

  console.log("Pop_Ray=", `'${PopRay}'`);

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });