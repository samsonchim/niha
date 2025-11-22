import axios from 'axios';
import 'dotenv/config';

const apiKey = process.env.BLOCKRADAR_API_KEY;
const masterWalletId = process.env.BLOCKRADAR_MASTER_WALLET_ID;
const baseURL = process.env.BLOCKRADAR_BASE_URL || 'https://api.blockradar.co/v1';
const network = process.env.BLOCKRADAR_NETWORK || 'testnet';

if (!apiKey) {
  console.warn('BLOCKRADAR_API_KEY missing');
}
if (!masterWalletId) {
  console.warn('BLOCKRADAR_MASTER_WALLET_ID missing - you must create a master wallet via BlockRadar dashboard first');
}

const client = axios.create({
  baseURL,
  headers: { 
    'x-api-key': apiKey,
    'Content-Type': 'application/json' 
  }
});

export async function createDedicatedAddress(userName: string, userMetadata?: any) {
  if (!masterWalletId) {
    throw new Error('BLOCKRADAR_MASTER_WALLET_ID not configured. Create a master wallet via BlockRadar dashboard first.');
  }

  const payload = {
    name: userName,
    metadata: userMetadata || {},
    disableAutoSweep: false,
    enableGaslessWithdraw: true,
  };

  try {
    const { data } = await client.post(`/wallets/${masterWalletId}/addresses`, payload);
    if (!data || !data.data || !data.data.address) {
      throw new Error('Failed to create dedicated address - invalid response');
    }

    return {
      address: data.data.address,
      addressId: data.data.id,
      blockchain: data.data.blockchain?.name || 'ethereum',
      network: data.data.network || network,
      derivationPath: data.data.derivationPath,
    };
  } catch (error: any) {
    console.error('BlockRadar createDedicatedAddress error:', error.response?.data || error.message);
    throw new Error(`Failed to create BlockRadar address: ${error.response?.data?.message || error.message}`);
  }
}

export async function sendCrypto(params: { 
  toAddress: string; 
  amount: string; 
  blockchain?: string;
  reference?: string;
  metadata?: any;
}) {
  const payload = {
    address: params.toAddress,
    amount: params.amount,
    blockchain: params.blockchain || 'base',
    reference: params.reference || `tx-${Date.now()}`,
    metadata: params.metadata || {},
  };

  try {
    const { data } = await client.post('/gateway/withdraw', payload);
    if (!data || !data.data) {
      throw new Error('Failed to send crypto - invalid response');
    }

    return {
      txHash: data.data.hash || null,
      txId: data.data.id,
      status: data.data.status,
      amount: data.data.amount,
      recipientAddress: data.data.recipientAddress,
      reference: data.data.reference,
    };
  } catch (error: any) {
    console.error('BlockRadar sendCrypto error:', error.response?.data || error.message);
    throw new Error(`Failed to send crypto: ${error.response?.data?.message || error.message}`);
  }
}

export async function getAddressBalance(addressId: string) {
  try {
    const { data } = await client.get(`/addresses/${addressId}/balance`);
    return data.data;
  } catch (error: any) {
    console.error('BlockRadar getAddressBalance error:', error.response?.data || error.message);
    return null;
  }
}
