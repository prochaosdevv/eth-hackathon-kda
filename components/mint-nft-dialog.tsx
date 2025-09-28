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
import { Plus, Loader2 } from "lucide-react"
import { NFT_ABI } from "@/lib/nft-abi"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi"

interface MintNFTDialogProps {
  contractAddress: string
  onSuccess?: () => void
}

export function MintNFTDialog({ contractAddress, onSuccess }: MintNFTDialogProps) {
  const [open, setOpen] = useState(false)
  const [tokenURI, setTokenURI] = useState("")
  // const [isLoading, setIsLoading] = useState(false)
  // const { address, isConnected } = useWallet()
  const {address} = useAccount()
  const { toast } = useToast()

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
    if (!isConfirmingMint && minted) {      
      setTokenURI("")
      setOpen(false)
      onSuccess?.()
    }
  },[isConfirmingMint,minted])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Mint NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mint New NFT</DialogTitle>
          <DialogDescription>Create a new NFT by providing the token URI (metadata URL).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenURI">Token URI</Label>
            <Input
              id="tokenURI"
              placeholder="https://example.com/metadata.json"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleMint} disabled={(isMInting && !isMintError) || !tokenURI.trim()} className="w-full">
            {(isMInting && !isMintError) ? 
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Waiting for user to confirm...
              </>
              :
            (isMInting || isConfirmingMint) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Transaction Sent.
              </>
            ) : (
              "Mint NFT"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
