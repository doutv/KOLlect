import { Chain } from '@wagmi/core'

// Contract addresses for different networks
export const contractAddresses: { [chainId: number]: `0x${string}` } = {
  57054: '0x27B23C2Fc9B9a5f7e9E4dA455B7e85A000F807D0',
}

// Vote cost in ETH (matches the VOTE_COST constant in the contract)
export const VOTE_COST = '0.1'

// Duration options for proposals (in seconds)
export const DURATION_OPTIONS = [
  { value: '86400', label: '1 day' },
  { value: '259200', label: '3 days' },
  { value: '604800', label: '1 week' },
  { value: '1209600', label: '2 weeks' },
  { value: '2592000', label: '30 days' },
]

export const sonicTestnet = {
  id: 57_054,
  name: 'Sonic Blaze Testnet',
  network: 'sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    public: { http: ['https://rpc.blaze.soniclabs.com'] },
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'SonicScan', url: 'https://testnet.sonicscan.org/' },
    default: { name: 'SonicScan', url: 'https://testnet.sonicscan.org/' },
  },
  contracts: {
  },
} as const satisfies Chain