// 引入 Chai 库中的 expect 断言函数
// const { expect } = require("chai");
// 引入 Hardhat 中的 ethers 库
const { ethers } = require("hardhat");

// 定义一些常用的 ERC20 代币地址
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// 定义测试套件
describe("SingleSwapToken", () => {
  // 定义一些变量，用于在测试中存储合约实例和账户信息
  let singleSwapToken;
  let accounts;
  let weth;
  let dai;
  let usdc;

  // 在所有测试运行之前执行一次的钩子函数
  before(async () => {
    // 获取测试账户
    accounts = await ethers.getSigners(1);

    // 获取 SingleSwapToken 合约的工厂实例，并部署合约
    const SingleSwapToken = await ethers.getContractFactory("SingleSwapToken");
    singleSwapToken = await SingleSwapToken.deploy();
    await singleSwapToken.deployed();

    // 获取 WETH, DAI 和 USDC 代币的合约实例
    weth = await ethers.getContractAt("IWETH", WETH9);
    dai = await ethers.getContractAt("IERC20", DAI);
    usdc = await ethers.getContractAt("IERC20", USDC);
  });

  // 定义测试用例，用于测试 swapExactInputSingle 函数
  it("swapExactInputSingle", async () => {
    // 定义输入金额
    const amountIn = 10n ** 18n;

    // 存入 WETH
    await weth.deposit({ value: amountIn });
    // 批准 SingleSwapToken 合约使用 WETH
    await weth.approve(singleSwapToken.address, amountIn);

    // 进行代币交换
    await singleSwapToken.swapExactInputSingle(amountIn);
    // 打印账户的 DAI 余额
    console.log('singleSwapToken 49');
    console.log("DAI balance", await dai.balanceOf(accounts[0].address));
  });

  // 定义测试用例，用于测试 swapExactOutputSingle 函数
  it("swapExactOutputSingle", async () => {
    // 定义最大输入金额和预期输出金额
    const wethAmountInMax = 10n ** 18n;
    const daiAmountOut = 100n * 10n ** 18n;

    // 存入 WETH
    await weth.deposit({ value: wethAmountInMax });
    // 批准 SingleSwapToken 合约使用 WETH
    await weth.approve(singleSwapToken.address, wethAmountInMax);

    // 进行代币交换
    await singleSwapToken.swapExactOutputSingle(daiAmountOut, wethAmountInMax);
    // 打印账户地址
    console.log(accounts[0].address);
    console.log(accounts[1].address);
    // 打印账户的 DAI 余额（注释掉的代码）
    // console.log("Dai balance", await dai.balanceOf(accounts[0].address));
    // console.log("Dai balance", await dai.balanceOf(accounts[1].address));
  });
});
