import { PipeTransform, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) { }

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsed = this.schema.parse(value);
      return parsed;
    } catch (error) {
      throw new BadRequestException('Validation failed', {
        cause: error,
        description: error.errors?.map(e => e.message).join(', '),
      });
    }
  }
}
