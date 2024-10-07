// 导入必要的依赖
const { ethers } = require("hardhat");
// 修改后的代码：
let expect;

(async () => {
  const chai = await import('chai');
  expect = chai.expect;
})();

// 定义 DAI 和 USDC 代币的地址
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// 定义 DAI 和 USDC 巨鲸账户的地址（持有大量代币的账户）
const DAI_WHALE = "0xa359Fc83C48277EedF375a5b6DC9Ec7D093aD3f2";
const USDC_WHALE = "0x5041ed759Dd4aFc3a72b8192C143F72f4724081A";

describe("LiquidityExamples", () => {
  let liquidityExamples;
  let accounts;
  let dai;
  let usdc;

  before(async () => {
    // 获取签名者账户
    accounts = await ethers.getSigners(1);

    // 部署 LiquidityExamples 合约
    const LiquidityExamples = await ethers.getContractFactory("LiquidityExamples");
    liquidityExamples = await LiquidityExamples.deploy();
    await liquidityExamples.deployed();

    // 获取 DAI 和 USDC 代币合约实例
    dai = await ethers.getContractAt("IERC20", DAI);
    usdc = await ethers.getContractAt("IERC20", USDC);

    // 解锁 DAI 和 USDC 巨鲸账户
    await network.provider.request({
      // 模拟巨鲸账户
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });
    await network.provider.request({
      // 模拟巨鲸账户
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    });

    // 获取巨鲸账户的签名者实例
    const daiWhale = await ethers.getSigner(DAI_WHALE);
    const usdcWhale = await ethers.getSigner(USDC_WHALE);

    // 查询 DAI 和 USDC 巨鲸账户的余额
    const daiBalanceWhale = await dai.balanceOf(DAI_WHALE);
    const usdcBalanceWhale = await usdc.balanceOf(USDC_WHALE);
    console.log(`DAI Whale Balance: ${ethers.utils.formatEther(daiBalanceWhale)} DAI`);
    console.log(`USDC Whale Balance: ${ethers.utils.formatUnits(usdcBalanceWhale, 6)} USDC`);

    // 定义要转移的 DAI 和 USDC 数量
    const daiAmount = 1000n * 10n ** 18n; // 1000 DAI
    const usdcAmount = 1000n * 10n ** 6n; // 1000 USDC

    // 获取巨鲸账户的 DAI 和 USDC 余额
    const daiBal = await dai.balanceOf(daiWhale.address);
    const usdcBal = await usdc.balanceOf(usdcWhale.address);
    console.log(daiBal, usdcBal, daiAmount, usdcAmount);

    // 检查巨鲸账户是否有足够的 DAI 和 USDC
    // 使用 BigNumber 的 gte (greater than or equal) 方法来比较
    expect((await dai.balanceOf(daiWhale.address)).gte(daiAmount)).to.be.true;
    expect((await usdc.balanceOf(usdcWhale.address)).gte(usdcAmount)).to.be.true;


    // 将 DAI 和 USDC 转移到测试账户
    await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount);
    await usdc.connect(usdcWhale).transfer(accounts[0].address, usdcAmount);
  });

  it("mintNewPosition", async () => {
    // 定义要添加流动性的 DAI 和 USDC 数量
    const daiAmount = 100n * 10n ** 18n; // 100 DAI
    const usdcAmount = 100n * 10n ** 6n; // 100 USDC

    // 将 DAI 和 USDC 转移到合约中
    await dai.connect(accounts[0]).transfer(liquidityExamples.address, daiAmount);
    await usdc.connect(accounts[0]).transfer(liquidityExamples.address, usdcAmount);

    // 调用合约的 mintNewPosition 方法，创建新的流动性头寸
    await liquidityExamples.mintNewPosition();

    // 打印添加流动性后的 DAI 和 USDC 余额
    console.log('Liqudity: ' + '93');
    console.log("DAI balance after add liquidity", await dai.balanceOf(accounts[0].address));
    console.log("USDC balance after add liquidity", await usdc.balanceOf(accounts[0].address));
  });
});
