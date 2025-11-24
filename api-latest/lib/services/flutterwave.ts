import axios from 'axios';
import 'dotenv/config';

const baseURL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';
const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
const bvn = process.env.BVN_FOR_DVA;
const defaultPhone = process.env.DEFAULT_CUSTOMER_PHONE || '08000000000';

if (!secretKey) {
  console.warn('FLUTTERWAVE_SECRET_KEY missing');
}

const client = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json'
  }
});

export async function createDedicatedVirtualAccount(userId: string, email: string, firstName?: string, lastName?: string, phone?: string) {
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : email;
  const accountName = `${firstName || 'User'} ${lastName || 'Account'} NIHA FLW`;

  const payload: any = {
    email,
    is_permanent: true,
    tx_ref: `onboard-${userId}-${Date.now()}`,
    firstname: firstName || 'User',
    lastname: lastName || 'Account',
    phonenumber: phone || defaultPhone,
    narration: fullName,
    account_name: accountName,
    bvn,
    metadata: { userId }
  };
  if (!bvn) delete payload.bvn; // only send if available
  if (bvn) payload.bvn = bvn;
  try {
    const { data } = await client.post('/virtual-account-numbers', payload);
    if (!data || !data.data) throw new Error('Failed to create virtual account');
    return {
      account_number: data.data.account_number,
      account_name: data.data.account_name || accountName,
      bank_name: data.data.bank_name,
      flw_ref: data.data.flw_ref
    };
  } catch (error: any) {
    console.error('Flutterwave createDedicatedVirtualAccount error:', error.response?.data || error.message);
    throw error;
  }
}

export async function initiateFiatTransfer(params: { amount: number; narration?: string; account_number: string; bank_code: string }) {
  const payload = {
    account_bank: params.bank_code,
    account_number: params.account_number,
    amount: params.amount,
    narration: params.narration || 'NIHA transfer',
    currency: 'NGN',
    reference: `fiat-${Date.now()}`,
    debit_subaccount: null
  };
  const { data } = await client.post('/transfers', payload);
  if (data.status !== 'success') throw new Error('Fiat transfer failed');
  return data.data;
}

export function verifyFlutterwaveSignature(headers: any, rawBody: string): boolean {
  const expected = process.env.FLUTTERWAVE_HASH;
  const received = headers['verif-hash'] || headers['Verif-Hash'];
  if (!expected) {
    console.warn('FLUTTERWAVE_HASH not set; skipping signature verification');
    return true;
  }
  return expected === received;
}

export async function getVirtualAccountBalance(accountNumber: string) {
  try {
    const { data } = await client.get(`/virtual-account-numbers/${accountNumber}`);
    if (!data || !data.data) throw new Error('Failed to get virtual account balance');
    return {
      balance: data.data.available_balance || 0,
      currency: data.data.currency || 'NGN'
    };
  } catch (error: any) {
    console.error('Flutterwave getVirtualAccountBalance error:', error.response?.data || error.message);
    return { balance: 0, currency: 'NGN' };
  }
}
