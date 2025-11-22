import axios from 'axios';
import 'dotenv/config';

const baseURL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';
const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
const bvn = process.env.BVN_FOR_DVA || '2211903400';

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

export async function createDedicatedVirtualAccount(userId: string, email: string) {
  // Reference: https://docs.flutterwave.com/reference/virtual-account-numbers
  const payload = {
    email,
    is_permanent: true,
    bvn,
    tx_ref: `onboard-${userId}-${Date.now()}`
  };
  const { data } = await client.post('/virtual-account-numbers', payload);
  if (!data || !data.data) throw new Error('Failed to create virtual account');
  return {
    account_number: data.data.account_number,
    account_name: data.data.account_name,
    bank_name: data.data.bank_name,
    flw_ref: data.data.flw_ref
  };
}

export async function initiateFiatTransfer(params: { amount: number; narration?: string; account_number: string; bank_code: string }) {
  // Reference: https://docs.flutterwave.com/reference/payouts
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
  // Flutterwave sends 'verif-hash' header; compare with FLUTTERWAVE_HASH env.
  const expected = process.env.FLUTTERWAVE_HASH;
  const received = headers['verif-hash'] || headers['Verif-Hash'];
  if (!expected) {
    console.warn('FLUTTERWAVE_HASH not set; skipping signature verification');
    return true;
  }
  return expected === received;
}
