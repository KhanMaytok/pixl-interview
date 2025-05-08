import { treaty } from '@elysiajs/eden';
import type { App } from '@repo/backend';

export const client = treaty<App>(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6969');
