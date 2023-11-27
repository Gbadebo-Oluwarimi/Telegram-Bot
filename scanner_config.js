import abiDecoder from "abi-decoder";
import ethers from "ethers";
import fs from "fs";
export const routerAbi = JSON.parse(fs.readFileSync("./router_abi.json"));
const swapEvent = [
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out,address indexed to)",
];

export const ethSwaps = [
  "swapExactETHForTokens",
  "swapETHForExactTokens",
  "swapExactETHForTokensSupportingFeeOnTransferTokens",
];

const tokenInterface = new ethers.utils.Interface([
  "function name() external view returns (string memory)",

  "function symbol() external view returns (string memory)",

  "function decimals() external view returns (uint8)",

  "function totalSupply() external view returns (uint256)",

  "function balanceOf(address owner) external view returns (uint256)",

  "function allowance(address owner, address spender) external view returns (uint256)",
]);

export let iface = new ethers.utils.Interface(swapEvent);

abiDecoder.addABI(routerAbi);

const url = "https://bsc-dataseed.binance.org/";

export const routerAddress = ethers.utils.getAddress(
  "0x10ED43C718714eb63d5aA57B78B54704E256024E"
);

export const provider = new ethers.providers.JsonRpcProvider(url);

export const tokenContract = new ethers.Contract(
  ethers.constants.AddressZero,
  tokenInterface,
  provider
);

export const filter = {
  topics: [
    ethers.utils.id("Swap(address,uint256,uint256,uint256,uint256,address)"),
  ],
};
export const filterId = ethers.utils.id(
  "Swap(address,uint256,uint256,uint256,uint256,address)"
);
