import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  bscTestnet
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    
   { 
     id: 5920,
  name: 'Kadena Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KAD',
    symbol: 'KAD',
  },
  rpcUrls: {
    default: { http: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://chain-20.evm-testnet-blockscout.chainweb.com',
      apiUrl: 'https://chain-{cid}.evm-testnet-blockscout.chainweb.com/api/',
    },
  },
  contracts: {
    
  },
  testnet: true,
   },
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [bscTestnet] : []),
  ],
  ssr: true,
});
