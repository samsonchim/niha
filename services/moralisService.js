const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');
const ethers = require('ethers');
const dotenv = require('dotenv');
dotenv.config();

let moralisStarted = false;

async function initMoralis() {
  if (!moralisStarted) {
    if (!process.env.MORALIS_API_KEY) {
      console.error("Configuration Error: MORALIS_API_KEY is not set in .env");
      throw new Error("MORALIS_API_KEY is not set in .env");
    }
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    moralisStarted = true;
    console.log("Moralis initialized successfully");
  }
}

module.exports = {
  // ✅ Create non-custodial wallet
  createWallet: () => {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  },

  // ✅ Get balance (Sepolia supported)
  getBalance: async (address, chain) => {
    await initMoralis();

    const moralisChain =
      chain.toUpperCase() === 'SEPOLIA'
        ? '0xaa36a7' // Sepolia hex chain ID
        : EvmChain[chain.toUpperCase()];

    const response = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain: moralisChain,
    });

    return {
      balance: response.result.balance.ether,
      chain,
    };
  },

  // ✅ Send transaction
  sendTransaction: async (to, amount, privateKey, chain) => {
    try {
      // Validate inputs
      if (!ethers.isAddress(to)) {
        console.error(`Validation Error: Invalid 'to' address: ${to}`);
        throw new Error("Invalid 'to' address");
      }
      if (isNaN(amount) || amount <= 0) {
        console.error(`Validation Error: Invalid amount: ${amount}`);
        throw new Error("Invalid amount (must be a positive number)");
      }
      if (!privateKey || !privateKey.startsWith('0x') || privateKey.length !== 66) {
        console.error(`Validation Error: Invalid privateKey: ${privateKey ? 'Provided but invalid' : 'Missing'}`);
        throw new Error("Invalid private key");
      }
      const rpcUrl = getRPC(chain);
      if (!rpcUrl) {
        console.error(`Validation Error: Invalid or unsupported chain: ${chain}`);
        throw new Error(`Unsupported chain: ${chain}`);
      }

      // Debug logs
      console.log("ethers:", ethers ? "Loaded" : "Undefined");
      console.log("RPC URL:", rpcUrl);

      // Initialize provider (ethers v6 syntax)
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);

      // Send transaction
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString()),
      });

      return {
        hash: tx.hash,
        explorer: getExplorer(chain) + '/tx/' + tx.hash,
      };
    } catch (error) {
      console.error("Error in sendTransaction:", error.message);
      throw error;
    }
  },

  // ✅ Send ERC-20 Token
sendToken: async (to, amount, tokenAddress, privateKey, chain) => {
  const { JsonRpcProvider, Wallet, parseUnits } = ethers;
  const provider = new JsonRpcProvider(getRPC(chain));
  const wallet = new Wallet(privateKey, provider);

  const erc20 = new ethers.Contract(tokenAddress, [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
  ], wallet);

  const decimals = await erc20.decimals();
  const value = parseUnits(amount, decimals);

  const tx = await erc20.transfer(to, value);
  await tx.wait(); // optional: wait for confirmation

  return {
    hash: tx.hash,
    explorer: getExplorer(chain) + "/tx/" + tx.hash,
  };
},


// ✅ Transaction History
getTransactionHistory: async (address, chain) => {
  await initMoralis();
  const moralisChain = chain.toUpperCase() === 'SEPOLIA' ? '0xaa36a7' : EvmChain[chain.toUpperCase()];

  const result = await Moralis.EvmApi.transaction.getWalletTransactions({
    address,
    chain: moralisChain,
  });

  return result.toJSON().result.slice(0, 10); // return latest 10 txs
},


// ✅ Estimate Gas Fee
estimateGas: async (to, amount, chain) => {
  const provider = new ethers.providers.JsonRpcProvider(getRPC(chain));

  const gasPrice = await provider.getGasPrice();
  const estimate = await provider.estimateGas({
    to,
    value: ethers.utils.parseEther(amount)
  });

  return {
    estimatedGas: estimate.toString(),
    gasPrice: gasPrice.toString(),
    estimatedFeeETH: ethers.utils.formatEther(gasPrice.mul(estimate))
  };
},
};




// === Helper functions ===

function getRPC(chain) {
  const key = 'b8f1d439a87580ae05cccf553a6b590d845342e9ad67d8596eeb42347925202e';
  const RPCS = {
    ETHEREUM: `https://rpc.ankr.com/eth/${key}`,
    POLYGON: `https://rpc.ankr.com/polygon/${key}`,
    BSC: `https://rpc.ankr.com/bsc/${key}`,
    SEPOLIA: `https://rpc.ankr.com/eth_sepolia/${key}`,
  };
  return RPCS[chain.toUpperCase()];
}

function getExplorer(chain) {
  const EXPLORERS = {
    ETHEREUM: 'https://etherscan.io',
    POLYGON: 'https://polygonscan.com',
    BSC: 'https://bscscan.com',
    SEPOLIA: 'https://sepolia.etherscan.io',
  };
  return EXPLORERS[chain.toUpperCase()];
}