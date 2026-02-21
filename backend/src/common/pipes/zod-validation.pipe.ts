import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  /**
   * Validates the input value against the provided Zod schema.
   * Only performs validation if the metadata type is 'body'.
   *
   * @param value - The data to validate.
   * @param metadata - Metadata about the parameter being validated.
   * @returns The parsed and validated value.
   */
  transform(value: unknown, metadata: ArgumentMetadata) {
    // Only validate if the value is from the request body
    if (metadata.type !== 'body') {
      return value;
    }

    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        // Format errors to match standard NestJS validation exception usually
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
