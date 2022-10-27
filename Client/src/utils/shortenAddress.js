// This is used to shorten the address 
// Such that it fits in the card

export const shortenAddress = (address) => `${address.slice(0,6)}...${address.slice(address.length-4)}`