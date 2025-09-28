"use client"

import type React from "react"

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
import { Clock, Loader2 } from "lucide-react"
import { NFT_ABI } from "@/lib/nft-abi"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { LIST_ABI } from "@/lib/list-abi"
import { etherUnits, parseEther } from "viem"

interface RentNFTDialogProps {
  tokenId: string
  contractAddress: string
  onSuccess?: () => void
  children: React.ReactNode
}

export function ListNFTDialog({ tokenId, listingContractAddress , contractAddress, onSuccess, children }: RentNFTDialogProps) {
  const [open, setOpen] = useState(false)
  const [rentalPrice, setRentalPrice] = useState("0.01") // days
  const [numberOfRents, setNumberOfRents] = useState("0") // days
  
  const [isLoading, setIsLoading] = useState(false)
  // const { address, isConnected } = useWallet()
  const { toast } = useToast()

    const {address} = useAccount()
  

  const {
    data: isApproved,
    refetch: refetchIsApproved,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: NFT_ABI,
    functionName: "getApproved",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  }) as {
    data: any[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };
      const {
      data: approveHash,
      writeContract: approveNFT,
      isPending: isApproving,
      isError: isApproveError,
    } = useWriteContract();
  
     const { isSuccess: approved, isLoading: isApprovingConfirm } =
      useWaitForTransactionReceipt({
        hash: approveHash,
      });
  
    const handleApprove = async () => {
      if (!address) {
        toast({
          title: "Error",
          description: "Please connect wallet",
          variant: "destructive",
        })
        return
      }
  
      // setIsLoading(true)
  
      try {
        approveNFT({
          address: contractAddress as `0x${string}`,
          abi: NFT_ABI,
          functionName: 'approve',
          args: [listingContractAddress, BigInt(tokenId)],
          
        })
        // const web3 = new Web3((window as any).ethereum)
        // const contract = new web3.eth.Contract(NFT_ABI as any, contractAddress)
        //
        
      
  
      } catch (error) {
        console.error("Approve error:", error)
        toast({
          title: "Approve Failed",
          description: "Failed to Approve NFT. Please try again.",
          variant: "destructive",
        })
      } finally {
        // setIsLoading(false)
      }
    }


      const {
      data: listHash,
      writeContract: listNFT,
      isPending: isListing,
      isError: isListError,
      
    } = useWriteContract();
  
     const { isSuccess: listed, isLoading: isConfirmingList } =
      useWaitForTransactionReceipt({
        hash: listHash,
      });
  
    const handleList = async () => {
      if (!address || !rentalPrice.trim()) {
        toast({
          title: "Error",
          description: "Please connect wallet and enter token rental price",
          variant: "destructive",
        })
        return
      }
  
      // setIsLoading(true)
  
      try {
        listNFT({
          address: listingContractAddress as `0x${string}`,
          abi: LIST_ABI,
          functionName: 'listItem',
          args: [contractAddress, BigInt(tokenId), parseEther(rentalPrice.trim()), numberOfRents ],
        })
        // const web3 = new Web3((window as any).ethereum)
        // const contract = new web3.eth.Contract(NFT_ABI as any, contractAddress)
        //
        
      
  
      } catch (error) {
        console.error("List error:", error)
        toast({
          title: "List Failed",
          description: "Failed to list NFT. Please try again.",
          variant: "destructive",
        })
      } finally {
        // setIsLoading(false)
      }
    }
  
    useEffect(() => {
      console.log(listHash,listed)
      if (isConfirmingList && listHash && listed) {      
       
        setOpen(false)
        onSuccess?.()
      }
      refetchIsApproved()
    },[listed,approved])

  const handleRent = async () => {
    if ( !address || !rentalPrice) {
      toast({
        title: "Error",
        description: "Please connect wallet and enter rental duration",
        variant: "destructive",
      })
      return
    }

    // const durationInSeconds = Number.parseInt(rentalDuration) * 24 * 60 * 60 // Convert days to seconds
    setIsLoading(true)

    try {
      const provider = window.ethereum
      if (!provider) {
        throw new Error("No wallet provider found")
      }

      // Encode the function call
      const web3 = new (await import("web3")).default(provider)
      const contract = new web3.eth.Contract(NFT_ABI, contractAddress)

      const tx = await contract.methods.rentNFT(tokenId, address, durationInSeconds.toString()).send({
        from: address,
      })

      toast({
        title: "NFT Rented Successfully!",
        description: `Transaction hash: ${tx.transactionHash}`,
      })

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Rent error:", error)
      toast({
        title: "Rent Failed",
        description: "Failed to rent NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>List NFT #{tokenId}</DialogTitle>
          <DialogDescription>Specify per day KAD rent for this NFT.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Rental Price (KAD)</Label>
            <Input
              id="duration"
              type="text"
              placeholder="0.01"
              value={rentalPrice}
              onChange={(e) => setRentalPrice(e.target.value)}
            />
            <Label htmlFor="duration">Number of Renters (Enter 0 for Unlimited)</Label>

 <Input
              id="numberOfRents"
              type="text"
              placeholder="Enter 0 for Unlimited"
              value={numberOfRents}
              onChange={(e) => setNumberOfRents(e.target.value)}
            />

            
          </div>
          <div className="text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            User will be charged one-time
          </div>
        </div>
        <DialogFooter>
          {(isApproved != listingContractAddress)  && (
          <Button onClick={handleApprove} disabled={isLoading || isApproving || isApprovingConfirm || !address } className="w-full mb-2">
            {((isApproving || isApprovingConfirm)) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              "Approve NFT"
            )}
          </Button>
          )  
          }
           {(isApproved == listingContractAddress)  && (
          <Button onClick={handleList} disabled={isLoading } className="w-full">
            {((isListing || isConfirmingList)) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Listing...
              </>
            ) : (
              "List NFT"
            )}
          </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
