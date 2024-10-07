// 导入 Hardhat 的 ethers 库
const { ethers } = require("hardhat");

// 定义代币的地址
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

describe("SwapMultiHop", () => {
  // 定义变量
  let swapMultiHop;
  let accounts;
  let weth;
  let dai;
  let usdc;

  // 部署合约和初始化代币接口
  before(async () => {
    // 获取账户
    accounts = await ethers.getSigners(1);

    // 部署 SwapMultiHop 合约
    const SwapMultiHop = await ethers.getContractFactory("SwapMultiHop");
    swapMultiHop = await SwapMultiHop.deploy();
    await swapMultiHop.deployed();

    // 获取 WETH9, DAI 和 USDC 的合约接口
    weth = await ethers.getContractAt("IWETH", WETH9);
    dai = await ethers.getContractAt("IERC20", DAI);
    usdc = await ethers.getContractAt("IERC20", USDC);
  });

  // 测试 swapExactInputMultihop 函数
  it("swapExactInputMultihop", async () => {
    const amountIn = 10n ** 18n; // 输入的 WETH 数量为 1 ETH

    // 存入 WETH
    await weth.deposit({ value: amountIn });
    // 授权合约使用 WETH
    await weth.approve(swapMultiHop.address, amountIn);

    // 执行多跳交换
    await swapMultiHop.swapExactInputMultihop(amountIn);
    // 打印账户的 DAI 余额
    console.log("DAI balance", await dai.balanceOf(accounts[0].address));
  });

  // 测试 swapExactOutputMultihop 函数
  it("swapExactOutputMultihop", async () => {
    const wethAmountInMax = 10n ** 18n; // 最大输入的 WETH 数量为 1 ETH
    const daiAmountOut = 100n * 10n ** 18n; // 目标输出的 DAI 数量为 100 DAI

    // 存入 WETH
    await weth.deposit({ value: wethAmountInMax });
    // 授权合约使用 WETH
    await weth.approve(swapMultiHop.address, wethAmountInMax);

    // 执行多跳交换
    await swapMultiHop.swapExactOutputMultihop(daiAmountOut, wethAmountInMax);
    // 打印账户地址
    console.log(accounts[0].address);
    // 打印账户的 DAI 余额
    console.log("Dai balance", await dai.balanceOf(accounts[0].address));
  });
});
