import { ethers } from "ethers"; // 从 ethers.js 库导入 ethers 对象
import Web3Modal from "web3modal"; // 从 web3modal 库导入 Web3Modal 对象

// 从 constants 文件中导入合约地址和 ABI（Application Binary Interface）
import {
  BooTokenAddress,
  BooTokenABI,
  LifeTokenAddress,
  LifeTokenABI,
  SingleSwapTokenAddress,
  SingleSwapTokenABI,
  SwapMultiHopAddress,
  SwapMultiHopABI,
  IWETHAddress,
  IWETHABI,
  userStorageDataAddrss,
  userStorageDataABI,
} from "../Context/constants";

// 检查钱包是否已连接
export const checkIfWalletConnected = async () => {
  try {
    // 检查 window 对象中是否存在 ethereum 对象（MetaMask 注入的对象）
    if (!window.ethereum) return console.log("Install MetaMask");

    // 请求获取已连接的账户
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    // 返回第一个账户（如果有）
    const firstAccount = accounts[0];
    return firstAccount;
  } catch (error) {
    console.log(error); // 捕捉并打印错误
  }
};

// 连接钱包
export const connectWallet = async () => {
  try {
    // 检查是否安装了 MetaMask
    if (!window.ethereum) return console.log("Install MetaMask");

    // 请求连接账户
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // 返回第一个账户
    const firstAccount = accounts[0];
    return firstAccount;
  } catch (error) {
    console.log(error); // 捕捉并打印错误
  }
};

// 获取 BOO Token 合约实例
export const fetchBooContract = (signerOrProvider) =>
  new ethers.Contract(BooTokenAddress, BooTokenABI, signerOrProvider);

// 连接 BOO Token 合约
export const connectingWithBooToken = async () => {
  try {
    const web3modal = new Web3Modal(); // 创建 Web3Modal 实例
    const connection = await web3modal.connect(); // 连接到钱包
    const provider = new ethers.providers.Web3Provider(connection); // 创建 Web3Provider 实例
    const signer = provider.getSigner(); // 获取签名者
    const contract = fetchBooContract(signer); // 获取 BOO Token 合约实例
    return contract;
  } catch (error) {
    console.log(error); // 捕捉并打印错误
  }
};

// 获取 Life Token 合约实例
export const fetchLifeContract = (signerOrProvider) =>
  new ethers.Contract(LifeTokenAddress, LifeTokenABI, signerOrProvider);

// 连接 Life Token 合约
export const connectingWithLIfeToken = async () => {
  try {
    const web3modal = new Web3Modal(); // 创建 Web3Modal 实例
    const connection = await web3modal.connect(); // 连接到钱包
    const provider = new ethers.providers.Web3Provider(connection); // 创建 Web3Provider 实例
    const signer = provider.getSigner(); // 获取签名者
    const contract = fetchLifeContract(signer); // 获取 Life Token 合约实例
    return contract;
  } catch (error) {
    console.log(error); // 捕捉并打印错误
  }
};

// 获取 SingleSwapToken 合约实例
export const fetchSingleSwapContract = (signerOrProvider) =>
  new ethers.Contract(
    SingleSwapTokenAddress,
    SingleSwapTokenABI,
    signerOrProvider
  );

// 连接 SingleSwapToken 合约
export const connectingWithSingleSwapToken = async () => {
  try {
    const web3modal = new Web3Modal(); // 创建 Web3Modal 实例
    const connection = await web3modal.connect(); // 连接到钱包
    const provider = new ethers.providers.Web3Provider(connection); // 创建 Web3Provider 实例
    const signer = provider.getSigner(); // 获取签名者
    const contract = fetchSingleSwapContract(signer); // 获取 SingleSwapToken 合约实例
    return contract;
  } catch (error) {
    console.log(error); // 捕捉并打印错误
  }
};

// 获取 IWETH 合约实例
export const fetchIWTHContract = (signerOrProvider) =>
  new ethers.Contract(
    IWETHAddress,
    IWETHABI,
    signerOrProvider);

// 连接 IWETH 合约
export const connectingWithIWTHToken = async () => {
  try {
    const web3modal = new Web3Modal(); // 创建 Web3Modal 实例
    const connection = await web3modal.connect(); // 连接到钱包
    const provider = new ethers.providers.Web3Provider(connection); // 创建 Web3Provider 实例
    const signer = provider.getSigner(); // 获取签名者
    const contract = fetchIWTHContract(signer); // 获取 IWETH 合约实例
    return contract;
  } catch (error) {
    console.log(error); // 捕捉并打印错误
  }
};

// 获取 DAI 合约实例
const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const fetchDAIContract = (signerOrProvider) =>
  new ethers.Contract(DAIAddress, IWETHABI, signerOrProvider);

// 连接 DAI 合约
export const connectingWithDAIToken = async () => {
  try {
    const web3modal = new Web3Modal(); // 创建 Web3Modal 实例
    const connection = await web3modal.connect(); // 连接到钱包
    const provider = new ethers.providers.Web3Provider(connection); // 创建 Web3Provider 实例
    const signer = provider.getSigner(); // 获取签名者
    const contract = fetchDAIContract(signer); // 获取 DAI 合约实例
    return contract;
  } catch (error) {
    console.log(error); // 捕捉并打印错误
  }
};

// 获取用户存储合约实例
export const fetchUserStorageContract = (signerOrProvider) =>
  new ethers.Contract(userStorageDataAddrss, userStorageDataABI, signerOrProvider);

// 连接用户存储合约
export const connectingWithUserStorageContract = async () => {
  try {
    const web3modal = new Web3Modal(); // 创建 Web3Modal 实例
    const connection = await web3modal.connect(); // 连接到钱包
    const provider = new ethers.providers.Web3Provider(connection); // 创建 Web3Provider 实例
    const signer = provider.getSigner(); // 获取签名者
    const contract = fetchUserStorageContract(signer); // 获取用户存储合约实例
    return contract;
  } catch (error) {
    console.log(error); // 捕捉并打印错误
  }
};
