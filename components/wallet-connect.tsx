"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { connectWallet, disconnectWallet, getWalletState, type WalletState } from "@/lib/wallet-utils"
import { useToast } from "@/hooks/use-toast"

export function WalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if wallet is already connected
    getWalletState().then(setWalletState)

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletState((prev) => ({
          ...prev,
          address: accounts[0] || null,
          isConnected: accounts.length > 0,
        }))
      }

      const handleChainChanged = (chainId: string) => {
        setWalletState((prev) => ({
          ...prev,
          chainId: Number.parseInt(chainId, 16),
        }))
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const newState = await connectWallet()
      setWalletState(newState)
      toast({
        title: "Wallet Connected",
        description: `Connected to ${newState.address?.slice(0, 6)}...${newState.address?.slice(-4)}`,
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    const newState = disconnectWallet()
    setWalletState(newState)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  if (walletState.isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground font-mono">
          {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect} className="gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting} className="gap-2" variant="default">
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}

// Export wallet state hook for other components
export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
  })

  useEffect(() => {
    getWalletState().then(setWalletState)

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletState((prev) => ({
          ...prev,
          address: accounts[0] || null,
          isConnected: accounts.length > 0,
        }))
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [])

  return walletState
}
