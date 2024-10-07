// 导入所需的库和模块
import { AlphaRouter } from "@uniswap/smart-order-router";
import { ethers, BigNumber } from "ethers";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";

// 定义Uniswap V3交换路由器的地址
const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

// 定义以太坊主网的链ID
const chainId = 1;

// 创建一个以太坊JSON-RPC提供者，用于连接到以太坊主网
const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/QsVbrlR_F0W7NStM5YBu8rgZugugSCdn");

// 创建一个AlphaRouter实例，用于路径计算
const router = new AlphaRouter({ chainId: chainId, provider: provider });

// 定义第一个代币的相关信息（WETH）
const name0 = "Wrapped Ether";
const symbol0 = "WETH";
const decimals0 = 18;
const address0 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// 定义第二个代币的相关信息（DAI）
const name1 = "DAI";
const symbol1 = "DAI";
const decimals1 = 18;
const address1 = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

// 创建WETH和DAI代币实例
const WETH = new Token(chainId, address0, decimals0, symbol0, name0);
const DAI = new Token(chainId, address1, decimals1, symbol1, name1);

// 定义一个异步函数，用于更新交换价格
export const swapUpdatePrice = async (
  inputAmount,    // 输入代币数量
  slippageAmount, // 滑点容忍度
  deadline,       // 交易截止时间
  walletAddress   // 钱包地址
) => {
  // 创建一个滑点容忍度百分比实例
  const percentSlippage = new Percent(slippageAmount, 100);
  
  // 将输入代币数量转换为Wei单位
  const wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0);
  
  // 创建一个货币数量实例
  const currencyAmount = CurrencyAmount.fromRawAmount(
    WETH,
    BigNumber.from(wei)
  );

  // 使用AlphaRouter计算最佳交换路径
  const route = await router.route(currencyAmount, DAI, TradeType.EXACT_INPUT, {
    recipient: walletAddress,         // 接收代币的地址
    slippageTolerance: percentSlippage, // 滑点容忍度
    deadline: deadline,               // 交易截止时间
  });

  // 构建交易对象
  const transaction = {
    data: route.methodParameters.calldata, // 交易数据
    to: V3_SWAP_ROUTER_ADDRESS,           // 交易目标地址（Uniswap V3交换路由器）
    value: BigNumber.from(route.methodParameters.value), // 交易金额
    from: walletAddress,                  // 交易发起地址
    gasPrice: BigNumber.from(route.gasPriceWei), // Gas价格
    gasLimit: ethers.utils.hexlify(1000000), // Gas限制
  }

  // 获取报价的输出代币数量，并计算交换比率
  const quoteAmountOut = route.quote.toFixed(6);
  const ratio = (inputAmount / quoteAmountOut).toFixed(3);

  // 输出报价和交换比率
  console.log(quoteAmountOut, ratio);
  
  // 返回交易对象、报价和交换比率
  return [transaction, quoteAmountOut, ratio];
};
