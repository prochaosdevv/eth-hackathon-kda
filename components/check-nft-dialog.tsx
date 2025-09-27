"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/components/wallet-connect"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Search } from "lucide-react"
import { NFT_ABI } from "@/lib/nft-abi"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"

interface CheckNFTDialogProps {
  contractAddress: string
  onSuccess?: () => void
}

export function CheckNFTDialog({ contractAddress, onSuccess }: CheckNFTDialogProps) {
  const [open, setOpen] = useState(false)
  const [checkNFT, setCheckNFT] = useState(false)
  
  const [tokenURI, setTokenURI] = useState("")
  const [user, setUser] = useState("")
  
  // const [isLoading, setIsLoading] = useState(false)
  // const { address, isConnected } = useWallet()
  const {address} = useAccount()
  const { toast } = useToast()

  const {
    data: hasRent
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: NFT_ABI,
    functionName: "hasRent",
    args: [BigInt(tokenURI),user as `0x${string}`],
    query: { enabled: true },
  }) as {
    data: any[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };


    const {
    data: minHash,
    writeContract: mintNFT,
    isPending: isMInting,
    isError: isMintError,
    
  } = useWriteContract();

   const { isSuccess: minted, isLoading: isConfirmingMint } =
    useWaitForTransactionReceipt({
      hash: minHash,
    });

  const handleMint = async () => {
    if (!address || !tokenURI.trim()) {
      toast({
        title: "Error",
        description: "Please connect wallet and enter token URI",
        variant: "destructive",
      })
      return
    }

    // setIsLoading(true)

    try {
      mintNFT({
        address: contractAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [address, tokenURI.trim()],
      })
      // const web3 = new Web3((window as any).ethereum)
      // const contract = new web3.eth.Contract(NFT_ABI as any, contractAddress)
      //
      
    

    } catch (error) {
      console.error("Mint error:", error)
      toast({
        title: "Mint Failed",
        description: "Failed to mint NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      // setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log(minHash,minted)
    if (isConfirmingMint) {      
      setTokenURI("")
      setOpen(false)
      onSuccess?.()
    }
  },[isConfirmingMint])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="gap-2 bg-yellow-400 hover:bg-yellow-500 text-black">
          <Search className="h-4 w-4" />
          Check NFT Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check NFT Access</DialogTitle>
          <DialogDescription>Check NFT access by providing the token ID and address.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenURI">Token ID</Label>
            <Input
              id="tokenURI"
              placeholder="1"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
            />
            <Label htmlFor="tokenURI">User</Label>
            <Input
              id="tokenURI"
              placeholder="0x"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
        </div>
        {
          hasRent && checkNFT ? (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
              User has access to this NFT.
            </div>
          )
          :
          (!hasRent && checkNFT) && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              User does not have access to this NFT.
            </div>
          )
        }
        <DialogFooter>
          <Button onClick={() => {setCheckNFT(false); setCheckNFT(true)}} className="w-full">            
            Check Access          
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
