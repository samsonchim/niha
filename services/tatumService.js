const { generateWallet, sendTransaction, getAccountBalance } = require('@tatumio/tatum');

module.exports = {
  createWallet: async () => {
    const wallet = await generateWallet('ETH', { mnemonic: true });
    return wallet;
  },

  sendTransaction: async (from, to, amount, currency) => {
    const tx = await sendTransaction({
      from,
      to,
      amount,
      currency,
      signatureId: undefined, // Use Tatum KMS if needed
    }, process.env.TATUM_API_KEY);
    
    return tx;
  },
};
