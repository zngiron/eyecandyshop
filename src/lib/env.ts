import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string(),
});

export const env = schema.parse(process.env);
