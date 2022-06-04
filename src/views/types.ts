export interface NFT {
  name: string;
  description: string;
  image: string;
}

export interface NFTData {
  data: NFT;
  price: number;
  owner: string;
  bgColor: string;
}
