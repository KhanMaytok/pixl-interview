import { treaty } from '@elysiajs/eden';
import type { App } from '@repo/backend';

export const client = treaty<App>('http://localhost:6969');
