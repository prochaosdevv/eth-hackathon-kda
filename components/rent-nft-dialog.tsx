"use client"

import type React from "react"

import { useState } from "react"
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
import { Clock, DollarSign, Loader2 } from "lucide-react"
import { NFT_ABI } from "@/lib/nft-abi"
import { useToast } from "@/hooks/use-toast"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { LIST_ABI } from "@/lib/list-abi"
import { parseEther } from "viem"

interface RentNFTDialogProps {
  tokenId: string
  contractAddress: string
  onSuccess?: () => void
  children: React.ReactNode
}

export function RentNFTDialog({ cost, tokenId,listingContractAddress, contractAddress, onSuccess, children }: RentNFTDialogProps) {
  const [open, setOpen] = useState(false)
  const [rentalDuration, setRentalDuration] = useState("7") // days
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected } = useWallet()
  const { toast } = useToast()


        const {
        data: rentHash,
        writeContract: rentNFT,
        isPending: isRenting,
        isError: isRentError,
        
      } = useWriteContract();
    
       const { isSuccess: rented, isLoading: isConfirmingRent } =
        useWaitForTransactionReceipt({
          hash: rentHash,
        });

  const handleRent = async () => {
    if (!isConnected || !address || !rentalDuration) {
      toast({
        title: "Error",
        description: "Please connect wallet and enter rental duration",
        variant: "destructive",
      })
      return
    }

    const durationInSeconds = Number.parseInt(rentalDuration) // Convert days to seconds
    setIsLoading(true)

    try {
      console.log("Renting NFT...", cost * rentalDuration);
      rentNFT({
        address: listingContractAddress as `0x${string}`,
        abi: LIST_ABI,
        functionName: "rent",
        args: [contractAddress as `0x${string}`, BigInt(tokenId), BigInt(durationInSeconds)],
        value: parseEther((cost * rentalDuration).toString()), // Convert KAD to Wei
      })
      // const tx = await rentNFT.wait()
 

      // setOpen(false)
      // onSuccess?.()
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
          <DialogTitle>Rent NFT #{parseInt(tokenId)}</DialogTitle>
          <DialogDescription>Specify how long you'd like to rent this NFT.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Rental Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="365"
              placeholder="7"
              value={rentalDuration}
              onChange={(e) => setRentalDuration(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">          
          <DollarSign className="h-4 w-4 inline mr-1" />
          Cost: {cost*rentalDuration} KAD
          </div>
          <div className="text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            You'll have access to this NFT for {rentalDuration || "0"} days
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleRent} disabled={isConfirmingRent || isRenting} className="w-full">
            {((isConfirmingRent || isRenting)) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Renting...
              </>
            ) : (
              "Rent NFT"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
