import {
  BlockFrostAPI,
  BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import { Injectable } from '@nestjs/common';
import {
  Address,
  AddressResponse,
  AssetMetadata,
  DecodedNft,
  NFTData,
} from 'types/wallet';

@Injectable()
export class AppService {
  API = new BlockFrostAPI({
    projectId: 'mainnet1CIpwi2vOHyrJiy846mNK0odUIMSt9pi',
  });
  private PAINS_POLICY_ID =
    '12efb6c78a821bfc8ab8b8dc6814aff9a695019ededa872df1b652bf';

  async decodeWallet(walletAddress: string): Promise<AddressResponse> {
    console.log('Wallet Address:', walletAddress);
    try {
      const response: Address = await this.API.addresses(walletAddress);
      console.log('Response:', response);

      const adaAmount = response.amount.find(
        (item) => item.unit === 'lovelace',
      )?.quantity;

      const nfts = response.amount.filter(
        (item) => item.unit !== 'lovelace' && item.quantity === '1',
      );

      const decodedNfts: DecodedNft[] = nfts.map((asset) => {
        const policyId = asset.unit.slice(0, 56);
        const assetNameHex = asset.unit.slice(56);
        const assetName = Buffer.from(assetNameHex, 'hex').toString('utf-8');
        return { unit: asset.unit, policyId, assetName };
      });

      const filteredNfts = decodedNfts.filter(
        (nft) => nft.policyId === this.PAINS_POLICY_ID,
      );

      const nftsData: NFTData[] = await Promise.all(
        filteredNfts.map(async (nft) => {
          console.log(nft);
          const metadata: Partial<AssetMetadata> = await this.getAssets(nft);
          console.log('META:', metadata);
          const img = metadata?.onchain_metadata?.image;
          return {
            ...nft,
            metadata,
            imageUrl: this.resolveIpfsUri(img),
          };
        }),
      );

      return {
        address: response.address,
        adaAmount: Number(adaAmount),
        nfts: nftsData,
      };
    } catch (error) {
      if (error instanceof BlockfrostServerError && error.status_code === 404) {
        // address was not used before, but most likely we don't want to throw an error
        return {
          address: walletAddress,
          adaAmount: 0,
          nfts: [],
        };
      } else {
        console.error('Error fetching from Blockfrost:', error.message);
        throw error;
      }
    }
  }

  async getAssets(nft: DecodedNft): Promise<Partial<AssetMetadata>> {
    try {
      const asset = await this.API.assetsById(nft.unit);
      return asset;
    } catch (error) {
      console.error('Error fetching from Blockfrost:', error.message);
      return null;
    }
  }

  private resolveIpfsUri = (ipfsUri: string | undefined): string | null => {
    if (!ipfsUri) {
      return null;
    }

    if (ipfsUri.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${ipfsUri.split('ipfs://')[1]}`;
    }
    return ipfsUri || null;
  };
}
