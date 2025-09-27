"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Loader2, User, Zap } from "lucide-react"
import Image from "next/image"
import { RentNFTDialog } from "./rent-nft-dialog"
import React, { use, useEffect, useMemo } from "react"
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { NFT_ABI } from "@/lib/nft-abi"
import { formatEther, zeroAddress } from "viem"
import { ListNFTDialog } from "./listt-nft-dialog"
import { LIST_ABI } from "@/lib/list-abi"

interface NFTCardProps {
  tokenId: string
  listing: boolean
  listingContractAddress: string
  name: string
  image: string
  isRented: boolean
  renter?: string
  rentalEndTime?: number
  contractAddress: string
  onRent?: () => void
  onReturn?: () => void
  showRentButton?: boolean
  showReturnButton?: boolean
}

export function NFTCard({
  listing,
  rentalPrice,
  renting= false,
  numberOfRents,
  tokenId,
  active = false,
  listingContractAddress,
  contractAddress,
  onRent,
  onReturn,
  showReturnButton = false,
}: NFTCardProps) {
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  const [metadata, setMetadata] = React.useState<any>(null);
  
  const {address } = useAccount();
  const {
    data: tokenURI,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: NFT_ABI,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  }) as {
    data: any[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };

  const {
    data: isListed,
    refetch: refetchIsListed,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: NFT_ABI,
    functionName: "listed",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  }) as {
    data: any[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };

    



  const {
    data: rentUsed
  } = useReadContract({
    address: listingContractAddress as `0x${string}`,
    abi: LIST_ABI,
    functionName: "rentUsed",
    args: [contractAddress, BigInt(tokenId)],
    query: { enabled: true },
  }) as {
    data: any[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };



  const {
    data: hasRent
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: NFT_ABI,
    functionName: "hasRent",
    args: [BigInt(tokenId),address as `0x${string}`],
    query: { enabled: true },
  }) as {
    data: any[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };


  const {
    data: tokenOwner
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: NFT_ABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  }) as {
    data: any[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };


  const {
    data: userExpires
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: NFT_ABI,
    functionName: "userExpires",
    args: [BigInt(tokenId),address as `0x${string}`],
    query: { enabled: true },
  }) as {
    data: any[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };

console.log("Token Owner:", tokenOwner);

  useEffect(() => {
    fetchMetadata(tokenURI as string);
  },[tokenURI])


  const fetchMetadata = async (uri: string) => {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const _metadata = await response.json();
      setMetadata(_metadata);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  const {
    name,
  image,
  isRented,
  renter,
  rentalEndTime,
  } =  useMemo(() => {

    if (!metadata) {
      return {
        name: `NFT #${tokenId}`,
        image: "/placeholder.svg",
        isRented: parseInt(tokenId) % 3 === 0,
        renter:
          parseInt(tokenId) % 3 === 0
            ? `0x${((parseInt(tokenId) + 5) % 10)
                .toString()
                .repeat(40 - 2)}`
            : undefined,
        rentalEndTime:
          parseInt(tokenId) % 3 === 0
            ? Math.floor(Date.now() / 1000) + (parseInt(tokenId) % 5) * 86400
            : undefined,
      }
    }
    
    return {
      name: `${metadata.name}`,
      image: metadata.image || "/placeholder.svg", 
      isRented: parseInt(userExpires)  > Math.floor(Date.now() / 1000),
      renter:
        parseInt(tokenId) % 3 === 0
          ? `0x${((parseInt(tokenId) + 5) % 10)
              .toString()
              .repeat(40 - 2)}`
          : undefined,
      rentalEndTime:
        parseInt(userExpires) 
    }
  }, [metadata, tokenId])

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = endTime - now
    if (remaining <= 0) return "Expired"

    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }



        const {
        data: delistHash,
        writeContract: delistNft,
        isPending: isDelisting,
        isError: isDelistError,
        
      } = useWriteContract();
    
       const { isSuccess: delisted, isLoading: isConfirmingDelist } =
        useWaitForTransactionReceipt({
          hash: delistHash,
        });

  const handleDelist = async () => {
    if (tokenOwner != address) {
      alert("Only the owner can de-list this NFT.")
      return
    }

    try {
      delistNft({
        address: listingContractAddress as `0x${string}`,
        abi: LIST_ABI,
        functionName: 'cancelListing',
        args: [contractAddress as `0x${string}`, BigInt(tokenId)],
        
      })
      
    }
    catch (error) {
      console.error("Delist error:", error)
      toast({
        title: "Delist Failed",
        description: "Failed to delist NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      // setIsLoading(false)
    }
  }
      


  useEffect(() => {
    
      refetchIsListed();
    
  },[delisted])
      
  return (
    ((tokenOwner != address && !renting &&  !listing) || (listing && !isListed) ||  (renting && !hasRent)) ? null :
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20 border-border/50">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        {isRented && (
          <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Rented
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-balance">{name}</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Owner: {tokenOwner ? formatAddress(tokenOwner) : "0x"}</span>
          </div>
          <div className="text-xs text-muted-foreground">Token ID: #{parseInt(tokenId)}</div>

          {/* {userOfToken != zeroAddress && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Renter: {formatAddress(userOfToken)}</span>
            </div>
          )} */}
 {(listing) && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Availablity: {parseInt(numberOfRents) == 0 ? "Unlimited" : parseInt(numberOfRents) - parseInt(rentUsed) == 0 ? "Out of stock" :  parseInt(numberOfRents) - parseInt(rentUsed)}</span>
            </div>
          )}
           
          {(renting && isRented && rentalEndTime) && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Ends: {formatTimeRemaining(rentalEndTime)}</span>
            </div>
          )}
        </div>

      </CardContent>

      <CardFooter className="p-4 pt-0">
        {(!isListed && tokenOwner == address )&& (
          <ListNFTDialog tokenId={tokenId} listingContractAddress={listingContractAddress} contractAddress={contractAddress} onSuccess={onRent}>
            <Button className="w-full">List NFT</Button>
          </ListNFTDialog>
        )}

         {(isListed && tokenOwner != address && listing) && (
          <RentNFTDialog tokenId={tokenId} listingContractAddress={listingContractAddress}  cost={formatEther(rentalPrice)} contractAddress={contractAddress} onSuccess={onRent}>
            <Button className="w-full">Rent NFT ({formatEther(rentalPrice)} KAD/day)</Button>
          </RentNFTDialog>
        )}

        {(tokenOwner == address && isListed) && (                   
          <Button onClick={handleDelist} disabled={isDelisting || isConfirmingDelist}  className="w-full" variant={"destructive"} >
             {(isDelisting || isConfirmingDelist) ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              De-Listing...
            </>
          ) :
            `De-List NFT`
        }
          </Button>
        )}
 
        
      </CardFooter>
    </Card>
  )
}
