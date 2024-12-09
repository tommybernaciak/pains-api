export const ADA_UNIT = 'lovelace';

export interface Address {
  address: string;
  amount: Amount[];
  stake_address: string;
  type: string;
  script: boolean;
}

export interface Amount {
  unit: string;
  quantity: string;
}

export interface DecodedNft {
  policyId: string;
  assetName: string;
  unit: string;
}

export interface NFTData extends DecodedNft {
  metadata: any;
  imageUrl: string | null;
}

export interface AddressResponse {
  address: string;
  adaAmount: number;
  nfts: NFTData[];
}

export interface AssetMetadata {
  asset: string;
  policy_id: string;
  asset_name: string;
  fingerprint: string;
  quantity: string;
  onchain_metadata: Partial<OnchainMetadata>;
  onchain_metadata_standard: string;
}

interface OnchainMetadata {
  Body: string;
  Eyes: string;
  Hair: string;
  name: string;
  Mouth: string;
  files: any[];
  image: string;
  Extras: string;
  Clothes: string;
  website: string;
  Eyebrows: string;
  mediaType: string;
  Background: string;
  Accessories: string;
}
