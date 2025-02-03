import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UrlService {
  constructor(private prisma: DatabaseService) { }

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

    const existingUrl = await this.prisma.url.findFirst({
      where: { originalUrl: normalizedUrl },
    });

    if (existingUrl) {
      return existingUrl;
    }

    const shortCode = nanoid(8);
    return this.prisma.url.create({
      data: {
        originalUrl: normalizedUrl,
        shortCode,
      },
    });
  }

  async getOriginalUrl(shortCode: string) {
    const url = await this.prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      throw new NotFoundException('Short URL not found');
    }

    this.prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } },
    }).catch(error => {
      console.error('Failed to update click count:', error);
    });

    return url;
  }

  async getAllUrls(limit = 100, offset = 0) {
    const [urls, total] = await Promise.all([
      this.prisma.url.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          originalUrl: true,
          shortCode: true,
          createdAt: true,
          clicks: true,
        },
      }),
      this.prisma.url.count(),
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
    const url = await this.prisma.url.findUnique({
      where: { shortCode },
    });

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
