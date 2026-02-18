import { betterAuth } from 'better-auth';

import { genericAdapter } from '$lib/adapter/main.js';
export const auth = betterAuth({
  database: genericAdapter({
    // options
  }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: ['user', 'admin'],
        required: false,
        defaultValue: 'user',
        input: false, // disallow setting role
      },
    },
  },
  advanced: {
    cookiePrefix: 'bind',
  },
});
