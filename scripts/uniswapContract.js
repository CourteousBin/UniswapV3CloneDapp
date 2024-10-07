// npm install @uniswap/v3-periphery@1.0.1 必须要这个版本

const { Contract, ContractFactory, utils, BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const WETH9 = require("../Context/WETH9.json");

// 加载Uniswap V3相关合约的ABI和bytecode
const artifacts = {
  // UniswapV3Factory: 用于创建和管理Uniswap V3的流动性池（交易对）。此文件包含Uniswap V3 Factory合约的ABI和bytecode，必需的信息以便部署和交互。
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),

  // SwapRouter: Uniswap V3的路由合约，用于处理交易和交换代币。加载此文件获得合约的ABI和bytecode，使得应用能够实现和执行代币交换功能。
  SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),

  // NFTDescriptor: 一个库合约，生成Uniswap V3位置NFT的描述信息，例如SVG图像。此文件提供了合约的ABI和bytecode，用于视觉元素的生成和处理。
  NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),

  // NonfungibleTokenPositionDescriptor: 提供Uniswap V3位置NFT的详细描述，如图像和其他属性。此文件包含了合约的ABI和bytecode，用于部署和交互。
  NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),

  // NonfungiblePositionManager: 管理Uniswap V3的非同质化代币（NFT）位置，处理增加和移除流动性等功能。此文件包含合约的ABI和bytecode，关键于NFT位置的管理。
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),

  // WETH9: 通用的包装以太币（WETH）合约，使得以太币可以作为ERC-20代币操作。此变量应包含合约的ABI和bytecode，用于与WETH相关的操作。
  WETH9,
};


// 定义一个函数用于链接库地址到合约的字节码中。
const linkLibraries = ({ bytecode, linkReferences }, libraries) => {
  // 遍历所有文件名（fileName）和合约名（contractName）在linkReferences对象中。
  Object.keys(linkReferences).forEach((fileName) => {
    Object.keys(linkReferences[fileName]).forEach((contractName) => {
      // 检查提供的库（libraries）对象是否包含必需的合约名，如果没有，则抛出错误。
      if (!libraries.hasOwnProperty(contractName)) {
        throw new Error(`Missing link library name ${contractName}`);
      }

      // 获取库地址，并转换为小写，去除前缀'0x'。
      const address = utils
        .getAddress(libraries[contractName])
        .toLowerCase()
        .slice(2);

      // 遍历linkReferences中指定文件和合约的所有引用位置。
      linkReferences[fileName][contractName].forEach(({ start, length }) => {
        // 计算字节码中的起始和长度位置，转换为字节单位。
        const start2 = 2 + start * 2;
        const length2 = length * 2;

        // 替换字节码中指定位置的占位符为实际的库地址。
        bytecode = bytecode
          .slice(0, start2)
          .concat(address)
          .concat(bytecode.slice(start2 + length2, bytecode.length));

      });
    });
  });

  // 返回链接后的字节码。
  return bytecode;
};


// 主部署函数
async function main() {
  const [owner] = await ethers.getSigners();

  // 部署WETH合约
  Weth = new ContractFactory(
    artifacts.WETH9.abi,
    artifacts.WETH9.bytecode,
    owner
  );
  weth = await Weth.deploy();

  // 部署Uniswap V3 Factory合约
  Factory = new ContractFactory(
    artifacts.UniswapV3Factory.abi,
    artifacts.UniswapV3Factory.bytecode,
    owner
  );
  factory = await Factory.deploy();

  // 部署Swap Router合约
  SwapRouter = new ContractFactory(
    artifacts.SwapRouter.abi,
    artifacts.SwapRouter.bytecode,
    owner
  );
  swapRouter = await SwapRouter.deploy(factory.address, weth.address);

  // 部署NFT描述符合约
  NFTDescriptor = new ContractFactory(
    artifacts.NFTDescriptor.abi,
    artifacts.NFTDescriptor.bytecode,
    owner
  );
  nftDescriptor = await NFTDescriptor.deploy();

  // 链接库并部署Nonfungible Token Position Descriptor合约
  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1261,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptor.address,
    }
  );

  NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    linkedBytecode,
    owner
  );

  nonfungibleTokenPositionDescriptor =
    await NonfungibleTokenPositionDescriptor.deploy(weth.address);

  console.log(nonfungibleTokenPositionDescriptor);
  NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  );
  nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    factory.address,
    weth.address,
    nonfungibleTokenPositionDescriptor.address
  );

  // 打印所有部署的合约地址
  console.log("wethAddress=", `'${weth.address}'`);
  console.log("factoryAddress=", `'${factory.address}'`);
  console.log("swapRouterAddress=", `'${swapRouter.address}'`);
  console.log("nftDescriptorAddress=", `'${nftDescriptor.address}'`);
  console.log(
    "positionDescriptorAddress=",
    `'${nonfungibleTokenPositionDescriptor.address}'`
  );
  console.log(
    "positionManagerAddress=",
    `'${nonfungiblePositionManager.address}'`
  );


}

// 执行主函数并处理可能的错误
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
