import { betterAuth } from 'better-auth';

import { genericAdapter } from '$lib/adapter/main.js';
export const auth = betterAuth({
  database: genericAdapter({
    // options
  }),
  emailAndPassword: { enabled: true },
});
