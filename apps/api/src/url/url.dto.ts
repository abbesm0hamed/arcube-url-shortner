import { z } from 'zod';

export const CreateUrlSchema = z.object({
  originalUrl: z.string().url({
    message: "Invalid URL format. Must be a valid http(s) URL",
  }),
});

export type CreateUrlDto = z.infer<typeof CreateUrlSchema>;
