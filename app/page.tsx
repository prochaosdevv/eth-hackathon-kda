"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { WalletConnect, useWallet } from "@/components/wallet-connect"
import { NFTCard } from "@/components/nft-card"
import { MintNFTDialog } from "@/components/mint-nft-dialog"
import { useToast } from "@/hooks/use-toast"
import { Palette, Loader2 } from "lucide-react"
import { NFT_ABI } from "@/lib/nft-abi"
// import { connectWallet, disconnectWallet, getWalletState, type WalletState } from "@/lib/wallet-utils"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useReadContract } from "wagmi"
import { LIST_ABI } from "@/lib/list-abi"
import { CheckNFTDialog } from "@/components/check-nft-dialog"
import Image from "next/image"

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x2074c07facAD3c21e7a8E6a523922Df18C325c97"
const LIST_CONTRACT_ADDRESS = "0xC8616C07a84cf3175c58d49ff71a012E8B0A8AA7"
interface NFTData {
  tokenId: string
  name: string
  image: string
  owner: string
  isRented: boolean
  renter?: string
  rentalEndTime?: number
}

export default function NFTMarketplace() {
  
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const {address} = useAccount()
  // const { address, isConnected } = useWallet()

  // Mock NFT data for demonstration - replace with real blockchain data
  // const mockNFTs: NFTData[] = [
  //   {
  //     tokenId: "1",
  //     name: "Cosmic Explorer #1",
  //     image: "/cosmic-space-explorer-nft.jpg",
  //     owner: "0x1234567890123456789012345678901234567890",
  //     isRented: false,
  //   },
  //   {
  //     tokenId: "2",
  //     name: "Digital Artifact #42",
  //     image: "/digital-artifact-nft-glowing.jpg",
  //     owner: "0x2345678901234567890123456789012345678901",
  //     isRented: true,
  //     renter: "0x3456789012345678901234567890123456789012",
  //     rentalEndTime: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 days from now
  //   },
  //   {
  //     tokenId: "3",
  //     name: "Neon Dreams #7",
  //     image: "/neon-dreams-cyberpunk-nft.jpg",
  //     owner: walletState.address || "0x4567890123456789012345678901234567890123",
  //     isRented: false,
  //   },
  //   {
  //     tokenId: "4",
  //     name: "Abstract Vision #15",
  //     image: "/abstract-vision-colorful-nft.jpg",
  //     owner: walletState.address || "0x5678901234567890123456789012345678901234",
  //     isRented: true,
  //     renter: walletState.address || "0x6789012345678901234567890123456789012345",
  //     rentalEndTime: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
  //   },
  // ]

//   useEffect(() => {
//     // getWalletState().then(setWalletState)
// if (typeof window !== "undefined" && window.ethereum) {
//       const handleAccountsChanged = (accounts: string[]) => {
//         setWalletState((prev) => ({
//           ...prev,
//           address: accounts[0] || null,
//           isConnected: accounts.length > 0,
//         }))
//       }

//       window.ethereum.on("accountsChanged", handleAccountsChanged)
//       return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
//     }
//     // In a real app, you would fetch NFTs from the blockchain
//     // setNfts(mockNFTs)
//   }, [])

//   useEffect(() => {
//     // console.log("Wallet state changed:", walletState)
// if(address){
//   getNFTs()
// }
//   }, [address])

  // const availableToRent = nfts.filter((nft) => !nft.isRented && nft.owner !== walletState.address)
  // const yourNFTs = nfts.filter((nft) => nft.owner === walletState.address)
  // const rentedNFTs = nfts.filter((nft) => nft.isRented && nft.renter === walletState.address)

  const availableToRent = [] ;
  const yourNFTs = [] ;
  const rentedNFTs = [] ;
  const handleRent = (tokenId: string) => {
    console.log("Rent NFT:", tokenId)
    toast({
      title: "NFT Rented",
      description: `Successfully rented NFT #${tokenId}`,
    })
    // Refresh NFTs after renting
    // setNfts((prev) =>
    //   prev.map((nft) =>
    //     nft.tokenId === tokenId
    //       ? {
    //           ...nft,
    //           isRented: true,
    //           renter: walletState.address,
    //           rentalEndTime: Math.floor(Date.now() / 1000) + 86400 * 7,
    //         }
    //       : nft,
    //   ),
    // )
  }

  const handleReturn = async (tokenId: string) => {
    // if (!walletState.address) return

    try {
      // In a real app, you would call the smart contract here
      console.log("Return NFT:", tokenId)

      toast({
        title: "NFT Returned",
        description: `Successfully returned NFT #${tokenId}`,
      })

      // Update local state
      setNfts((prev) =>
        prev.map((nft) =>
          nft.tokenId === tokenId ? { ...nft, isRented: false, renter: undefined, rentalEndTime: undefined } : nft,
        ),
      )
    } catch (error) {
      console.error("Return error:", error)
      toast({
        title: "Return Failed",
        description: "Failed to return NFT. Please try again.",
        variant: "destructive",
      })
    }
  }
 

const {
  data: totalMinted,
  isError,
  isLoading,
  refetch,
} = useReadContract({
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: NFT_ABI,
  functionName: "totalMinted",
  
  query: { enabled: true },
}) as {
  data: any[] | undefined;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};


const {
  data: userBalance
} = useReadContract({
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: NFT_ABI,
  functionName: "balanceOf",
  args: [address as `0x${string}`],
  
  query: { enabled: true },
}) as {
  data: any[] | undefined;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};


const 
  {
    data: allListing
  }
  
= useReadContract({
  address: LIST_CONTRACT_ADDRESS as `0x${string}`,
  abi: LIST_ABI,
  functionName: "getAllListing",
  query: { enabled: true },
}) as {
  data: any[] | undefined;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};
 
// console.log("Owned NFTs:", walletState);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Image src="/Kadena - Vertical - Light.png" alt="Logo" width={40} height={40} className="w-8 h-8"/>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">NFT Marketplace</h1>
                <p className="text-sm text-muted-foreground">Rent digital assets</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <CheckNFTDialog
                  contractAddress={CONTRACT_ADDRESS}
                  onSuccess={() => {
                    toast({
                      title: "NFT Minted",
                      description: "Your NFT has been successfully minted!",
                    })
                  }}
                />
              {address && (
                <MintNFTDialog
                  contractAddress={CONTRACT_ADDRESS}
                  onSuccess={() => {
                    toast({
                      title: "NFT Minted",
                      description: "Your NFT has been successfully minted!",
                    })
                  }}
                />
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {!address ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
             <Image src="/Kadena - Vertical - Light.png" alt="Logo" width={40} height={40} className="w-8 h-8"/>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your wallet to start minting and renting NFTs in our marketplace.
            </p>
            {/* <WalletConnect /> */}
          </div>
        ) : (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="available" className="text-sm">
                Available to Rent
              </TabsTrigger>
              <TabsTrigger value="owned" className="text-sm">
                Your NFTs ({userBalance ? parseInt(userBalance) : 0})
              </TabsTrigger>
              <TabsTrigger value="rented" className="text-sm">
                Rented NFTs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Available to Rent</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : parseInt(allListing?.length) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allListing.map((v,i) => { 
  return (
    <NFTCard
      listing={true}
      rentalPrice={v.price}
      active={v.active}
      numberOfRents={v.numberOfRents}
      key={v.tokenId}
      listingContractAddress={LIST_CONTRACT_ADDRESS}
      contractAddress={v.nft}
      tokenId={v.tokenId}
    />
  );
})}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <p>No NFTs available for rent at the moment.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="owned" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Your NFTs</h2>
                {parseInt(userBalance) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(parseInt(totalMinted)).keys()].map((i) => {
  const tokenId = i + 1; // start from 1
  return (
    <NFTCard
    listing={false}
      key={tokenId}
       rentalPrice={0}
      numberOfRents={0}
      listingContractAddress={LIST_CONTRACT_ADDRESS}
      contractAddress={CONTRACT_ADDRESS}
      tokenId={tokenId}
    />
  );
})}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <p>You don't own any NFTs yet. Mint your first NFT to get started!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rented" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Rented NFTs</h2>
                {parseInt(allListing?.length) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allListing.map((v,i) => { 
  return (
    <NFTCard
      listing={false}
      renting={true}
      rentalPrice={v.price}
      numberOfRents={v.numberOfRents}
      key={v.tokenId}
      listingContractAddress={LIST_CONTRACT_ADDRESS}
      contractAddress={v.nft}
      tokenId={v.tokenId}

    />
  );
})}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <p>You haven't rented any NFTs yet. Browse available NFTs to start renting!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
