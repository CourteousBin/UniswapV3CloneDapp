import React, { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import Web3Modal from "web3modal";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import axios from "axios";

//INTERNAL IMPORT
import {
  checkIfWalletConnected,
  connectWallet,
  connectingWithBooToken,
  connectingWithLIfeToken,
  connectingWithSingleSwapToken,
  connectingWithIWTHToken,
  connectingWithDAIToken,
  connectingWithUserStorageContract,
} from "../Utils/appFeatures";

import { getPrice } from '../Utils/fetchingPrice'
import { swapUpdatePrice } from '../Utils/swapUpdatePrice'
import { addLiquidityExternal } from "../Utils/addLiquidity";
import { getLiquidityData } from "../Utils/checkLiquidity";
import { connectingWithPoolContract } from "../Utils/deployPool";

import { IWETHABI } from "./constants";
import ERC20 from "./ERC20.json";

export const SwapTokenContext = React.createContext();

export const SwapTokenContextProvider = ({ children }) => {
  const swap = "welcome to swap my token"

  //USSTATE
  const [account, setAccount] = useState("");
  const [ether, setEther] = useState("");
  const [networkConnect, setNetworkConnect] = useState("");
  const [weth9, setWeth9] = useState("");
  const [dai, setDai] = useState("");

  const [tokenData, setTokenData] = useState([]);
  const [getAllLiquidity, setGetAllLiquidity] = useState([]);
  // TOP TOKENS
  const [topTokensList, setTopTokensList] = useState([]);

  const addToken = [
    "0xC1dC7a8379885676a6Ea08E67b7Defd9a235De71",
    "0xf0F5e9b00b92f3999021fD8B88aC75c351D93fc7",
    "0xCC9676b9bf25cE45a3a5F88205239aFdDeCF1BC7",
  ];

  const fetchingData = async () => {
    try {
      // 获取用户账户
      const userAccount = await checkIfWalletConnected();
      setAccount(userAccount);

      // 创建 Web3 提供者
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      // const yaho = await provider.getCode(address);
      // console.log(yaho);

      // 检查账户余额
      const balance = await provider.getBalance(userAccount);
      const convertBal = BigNumber.from(balance).toString();
      // 转化成 人类可读ETH
      const ethValue = ethers.utils.formatEther(convertBal);
      // 赋值useState
      setEther(ethValue);
      // console.log(ethValue);


      // 获取网络信息
      const network = await provider.getNetwork();
      console.log(network);
      setNetworkConnect(network.name);

      // 获取所有代币余额和数据
      addToken.map(async (el, i) => {
        // 获取代币合约
        const contract = new ethers.Contract(el, ERC20, provider);
        // 获取代币余额
        const userBalance = await contract.balanceOf(userAccount);
        const tokenLeft = BigNumber.from(userBalance).toString();
        const convertTokenBal = ethers.utils.formatEther(tokenLeft);

        // 获取代币名称和符号
        const symbol = await contract.symbol();
        const name = await contract.name();

        // 将代币数据推入 tokenData 数组
        tokenData.push({
          name: name,
          symbol: symbol,
          tokenBalance: convertTokenBal,
          tokenAddress: el,
        });
      });



      // GET LIQUIDITY
      // 获取流动性数据
      const userStorageData = await connectingWithUserStorageContract();
      const userLiquidity = await userStorageData.getAllTransactions();
      console.log(userLiquidity);

      userLiquidity.map(async (el, i) => {
        const liquidityData = await getLiquidityData(
          el.poolAddress,
          el.tokenAddress0,
          el.tokenAddress1
        );

        // 将流动性数据推入 getAllLiquidity 数组
        getAllLiquidity.push(liquidityData);
        console.log(getAllLiquidity);
      });

      // FETCH TOP TOKENS LIST
      // 获取顶级代币列表
      // const URL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
      const URL = "/api/uniswap";
      const query = `
        {
          tokens(orderBy: volumeUSD, orderDirection: desc, first: 20) {
            id
            name
            symbol
            decimals
            volume
            volumeUSD
            totalSupply
            feesUSD
            txCount
            poolCount
            totalValueLockedUSD
            totalValueLocked
            derivedETH
          }
        }
      `;
      const axiosData = await axios.post(URL, { query: query });
      console.log(axiosData.data.data.tokens);
      setTopTokensList(axiosData.data.data.tokens);

      const wethContract = await connectingWithIWTHToken()
      const wethBal = await wethContract.balanceOf(userAccount);
      const wethToken = BigNumber.from(wethBal).toString()
      const convertwethTokenBal = ethers.utils.formatEther(wethToken)
      setWeth9(convertwethTokenBal)


      const DaiContract = await connectingWithDAIToken()
      const DaiBal = await DaiContract.balanceOf(userAccount);
      const DaiToken = BigNumber.from(DaiBal).toString()
      const convertDaiTokenBal = ethers.utils.formatEther(DaiToken)
      setDai(convertDaiTokenBal)

      console.log(dai, weth9);
    } catch (error) {
      // 捕获并打印错误
      console.log(error);
    }
  };


  //CREATE AND ADD LIQUIDITY
  const createLiquidityAndPool = async ({
    tokenAddress0,
    tokenAddress1,
    fee,
    tokenPrice1,
    tokenPrice2,
    slippage,
    deadline,
    tokenAmmountOne,
    tokenAmmountTwo,
  }) => {
    try {
      console.log(tokenAddress0,
        tokenAddress1,
        fee,
        tokenPrice1,
        tokenPrice2,
        slippage,
        deadline,
        tokenAmmountOne,
        tokenAmmountTwo);
      //CREATE POOL
      const createPool = await connectingWithPoolContract(
        tokenAddress0,
        tokenAddress1,
        fee,
        tokenPrice1,
        tokenPrice2,
        {
          gasLimit: 500000,
        }
      );

      const poolAddress = createPool;
      // console.log(poolAddress);

      //CREATE LIQUIDITY
      const info = await addLiquidityExternal(
        tokenAddress0,
        tokenAddress1,
        poolAddress,
        fee,
        tokenAmmountOne,
        tokenAmmountTwo
      );
      console.log(info);

      //ADD DATA
      const userStorageData = await connectingWithUserStorageContract();

      const userLiqudity = await userStorageData.addToBlockchain(
        poolAddress,
        tokenAddress0,
        tokenAddress1
      );
    } catch (error) {
      console.log(error);
    }
  };


  // SINGL SWAP TOKEN
  const singleSwapToken = async ({ token1, token2, swapAmount }) => {

    // console.log(
    //   token1.tokenAddress.tokenAddress,
    //   token2.tokenAddress.tokenAddress,
    //   swapAmount
    // );
    try {
      let singleSwapToken;
      let weth;
      let dai;

      singleSwapToken = await connectingWithSingleSwapToken();
      weth = await connectingWithIWTHToken();
      dai = await connectingWithDAIToken();

      const decimals0 = 18;
      const inputAmount = swapAmount;
      const amountIn = ethers.utils.parseUnits(
        inputAmount.toString(),
        decimals0
      );

      console.log(weth, dai);

      await weth.deposit({ value: amountIn });
      await weth.approve(singleSwapToken.address, amountIn);

      // SWAP
      // await singleSwapToken.swapExactInputSingle(amountIn, {
      //   gasLimit: 300000,
      // })
      const transaction = await singleSwapToken.swapExactInputSingle(
        token1.tokenAddress.tokenAddress,
        token2.tokenAddress.tokenAddress,
        amountIn,
        {
          gasLimit: 300000,
        });

      await transaction.wait()
      console.log(transaction);

      console.log('swapContext: ' + '286');
      const balance = await dai.balanceOf(account);
      const transferAmount = BigNumber.from(balance).toString();
      const ethValue = ethers.utils.formatEther(transferAmount);
      setDai(ethValue);
      console.log("DAI balance:", ethValue);

    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    fetchingData();
  }, []);

  return (
    <SwapTokenContext.Provider value={{
      connectWallet,
      singleSwapToken,
      getPrice,
      swapUpdatePrice,
      createLiquidityAndPool,
      getAllLiquidity,
      account,
      weth9,
      dai,
      networkConnect,
      ether,
      tokenData,
      topTokensList
    }}>
      {children}
    </SwapTokenContext.Provider>
  )
}