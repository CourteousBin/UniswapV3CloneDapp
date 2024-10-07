// Token 地址定义
shoaibAddress = '0xDC0a0B1Cd093d321bD1044B5e0Acb71b525ABb6b'
rayyanAddrss = '0xDe1112a0960B9619da7F91D51fB571cdefE48B5E'
popUpAddress = '0x1D87585dF4D48E52436e26521a3C5856E4553e3F'

SHO_RAY = '0x4509A7bB45f3A28dE47489Dc757fc17426493157'

// Uniswap 合约地址定义
wethAddress = '0xf09e7Af8b380cD01BD0d009F83a6b668A47742ec'
factoryAddress = '0x492844c46CEf2d751433739fc3409B7A4a5ba9A7'
swapRouterAddress = '0x50cf1849e32E6A17bBFF6B1Aa8b1F7B479Ad6C12'
nftDescriptorAddress = '0xC1dC7a8379885676a6Ea08E67b7Defd9a235De71'
positionDescriptorAddress = '0xf0F5e9b00b92f3999021fD8B88aC75c351D93fc7'
positionManagerAddress = '0xCC9676b9bf25cE45a3a5F88205239aFdDeCF1BC7'

// 结果
// popUpAddress = 0x1D87585dF4D48E52436e26521a3C5856E4553e3F 
// rayyanAddrss = 0xDe1112a0960B9619da7F91D51fB571cdefE48B5E
// Pop_Ray= '0x4509A7bB45f3A28dE47489Dc757fc17426493157'

// UserStorageData
// 0x1D87585dF4D48E52436e26521a3C5856E4553e3F


const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Shoaib: require("../artifacts/contracts/Shoaib.sol/Shoaib.json"),
  Rayyan: require("../artifacts/contracts/Rayyan.sol/Rayyan.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers");
const { Token } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");
const { waffle } = require("hardhat");

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  //  console.log(tickSpacing, fee, liquidity, slot0);
  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };

}

async function main() {
  const [owner, signer2] = await ethers.getSigners();
  const provider = ethers.provider;
  const ShoaibContract = new Contract(
    shoaibAddress,
    artifacts.Shoaib.abi,
    provider
  );

  console.log('11111')
  const RayyanContract = new Contract(
    rayyanAddrss,
    artifacts.Rayyan.abi,
    provider
  );

  await ShoaibContract.connect(signer2).approve(
    positionManagerAddress,
    ethers.utils.parseEther("1000")
  );

  await RayyanContract.connect(signer2).approve(
    positionManagerAddress,
    ethers.utils.parseEther("1000")
  );
  console.log('22222')
  const poolContract = new Contract(
    SHO_RAY,
    artifacts.UniswapV3Pool.abi,
    provider
  );

  console.log('3333')
  const poolData = await getPoolData(poolContract);

  const ShoaibToken = new Token(31337, shoaibAddress, 18, "Shoaib", "SHO");
  const RayyanToken = new Token(31337, rayyanAddrss, 18, "Rayyan", "RAY");



  const pool = new Pool(
    ShoaibToken,
    RayyanToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );


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

  console.log('pool', poolData)

  const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts;

  params = {
    token0: shoaibAddress,
    token1: rayyanAddrss,
    fee: 3000,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(), // ethers.utils.parseUnits('10', 18),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer2.address,
    deadline: Math.floor(Date.now() / 1000) + 1800,
  }

  const nonfungiblePositionManager = new Contract(
    positionManagerAddress,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );

  console.log('params', params);
  const tx = await nonfungiblePositionManager
    .connect(owner)
    .mint(params, { gasLimit: "3000000" });

  console.log('params', params);


  const receipt = await tx.wait();
  console.log(receipt);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    process.exit(1);
  });