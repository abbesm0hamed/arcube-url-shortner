import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { DatabaseService } from 'src/database/database.service';
import { UrlModel, IUrl } from 'src/database/url.model';

@Injectable()
export class UrlService {
  constructor(private database: DatabaseService) { }

  private normalizeUrl(url: string): string {
    try {
      const urlObject = new URL(url);
      if (!urlObject.protocol) {
        urlObject.protocol = 'https:';
      }
      return urlObject.toString();
    } catch (error) {
      throw new BadRequestException('Invalid URL format');
    }
  }

  async createShortUrl(originalUrl: string) {
    const normalizedUrl = this.normalizeUrl(originalUrl);

    const existingUrl = await UrlModel.findOne({ originalUrl: normalizedUrl });

    if (existingUrl) {
      return existingUrl;
    }

    const shortCode = nanoid(8);
    const newUrl = new UrlModel({
      originalUrl: normalizedUrl,
      shortCode,
      clicks: 0
    });

    return await newUrl.save();
  }

  async getOriginalUrl(shortCode: string) {
    const url = await UrlModel.findOne({ shortCode });

    if (!url) {
      throw new NotFoundException('Short URL not found');
    }

    // Update click count
    UrlModel.updateOne(
      { _id: url._id },
      { $inc: { clicks: 1 } }
    ).catch(error => {
      console.error('Failed to update click count:', error);
    });

    return url;
  }

  async getAllUrls(limit = 100, offset = 0) {
    const [urls, total] = await Promise.all([
      UrlModel.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .select('originalUrl shortCode createdAt clicks')
        .exec(),
      UrlModel.countDocuments()
    ]);

    return {
      urls,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getUrlStats(shortCode: string) {
    const url = await UrlModel.findOne({ shortCode });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return {
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
    };
  }
}
