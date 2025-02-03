import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './url.service';
import { CreateUrlSchema, CreateUrlDto } from './url.dto';
import { ZodValidationPipe } from 'src/pipes/zod.pipe';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) { }

  @Post('shorten')
  async createShortUrl(
    @Body(new ZodValidationPipe(CreateUrlSchema)) createUrlDto: CreateUrlDto,
    @Query('preview') preview?: boolean,
  ) {
    const url = await this.urlService.createShortUrl(createUrlDto.originalUrl);
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.API_PORT}`;
    const shortUrl = `${baseUrl}/${url.shortCode}`;

    return {
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl,
      preview: preview ? `${baseUrl}/preview/${url.shortCode}` : undefined,
    };
  }

  @Get(':shortCode')
  async redirectToOriginalUrl(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    const url = await this.urlService.getOriginalUrl(shortCode);
    return res.status(301).redirect(url.originalUrl);
  }

  @Get('urls/list')
  async getAllUrls(
    @Query('limit', ParseIntPipe) limit = 100,
    @Query('offset', ParseIntPipe) offset = 0,
  ) {
    return this.urlService.getAllUrls(limit, offset);
  }

  @Get('stats/:shortCode')
  async getUrlStats(@Param('shortCode') shortCode: string) {
    return this.urlService.getUrlStats(shortCode);
  }

  @Get('preview/:shortCode')
  async previewUrl(@Param('shortCode') shortCode: string) {
    const url = await this.urlService.getOriginalUrl(shortCode);
    return {
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
    };
  }
}
