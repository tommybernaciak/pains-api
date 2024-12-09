import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AddressResponse } from 'types/wallet';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/decode-wallet')
  async decodeWallet(
    @Query('wallet_address') walletAddress: string,
  ): Promise<any> {
    if (!walletAddress) {
      throw new HttpException(
        'The "wallet_address" query parameter is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response: AddressResponse =
        await this.appService.decodeWallet(walletAddress);
      console.log('Response:', response);
      return response;
    } catch (error) {
      console.error(`Server Error:`, error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
