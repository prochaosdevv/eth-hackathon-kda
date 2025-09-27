// Simple wallet utilities without wagmi dependencies
export interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
}

export const getEthereumProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum
  }
  return null
}

export const connectWallet = async (): Promise<WalletState> => {
  const provider = getEthereumProvider()

  if (!provider) {
    throw new Error("No wallet found. Please install MetaMask or another Web3 wallet.")
  }

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" })
    const chainId = await provider.request({ method: "eth_chainId" })

    return {
      address: accounts[0] || null,
      isConnected: accounts.length > 0,
      chainId: Number.parseInt(chainId, 16),
    }
  } catch (error) {
    console.error("Failed to connect wallet:", error)
    throw error
  }
}

export const disconnectWallet = (): WalletState => {
  return {
    address: null,
    isConnected: false,
    chainId: null,
  }
}

export const getWalletState = async (): Promise<WalletState> => {
  const provider = getEthereumProvider()

  if (!provider) {
    return { address: null, isConnected: false, chainId: null }
  }

  try {
    const accounts = await provider.request({ method: "eth_accounts" })
    const chainId = await provider.request({ method: "eth_chainId" })

    return {
      address: accounts[0] || null,
      isConnected: accounts.length > 0,
      chainId: Number.parseInt(chainId, 16),
    }
  } catch (error) {
    return { address: null, isConnected: false, chainId: null }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
