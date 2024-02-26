import { Configuration } from '@alephium/cli';
import 'dotenv/config'

const privateKeys = () => {
  const pks = process.env.PRIVATE_KEYS;
  if (!pks) {
    return [];
  }
  return pks.split(',');
};

const defaultSettings = {};

const config: Configuration<unknown> = {
  networks: {
    devnet: {
      nodeUrl: 'http://localhost:22973',
      privateKeys: [
        'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5',
      ],
      confirmations: 1,
      settings: defaultSettings,
    },
    testnet: {
      nodeUrl:
        process.env.NODE_URL ??
        'https://wallet-v20.testnet.alephium.org',
      privateKeys: privateKeys(),
      settings: defaultSettings,
    },
    mainnet: {
      nodeUrl: process.env.NODE_URL ??
        'https://wallet-v20.mainnet.alephium.org',
      privateKeys: privateKeys(),
      settings: defaultSettings,
    },
  },
};

export default config;
