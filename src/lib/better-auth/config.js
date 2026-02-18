import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import { createAuthMiddleware } from 'better-auth/api';

import { genericAdapter } from '$lib/generic/main.js';
import usernames from '$lib/username/main.js';
import database from '$lib/database/main.js';
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
    database: {
      generateId: database.generateId,
    },
    cookiePrefix: 'bind',
  },
  disablePaths: ['/is-username-available'],
  plugins: [
    username({
      displayUsernameNormalization: () => '',
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async ctx => {
      if (ctx.path !== '/sign-up/email')
        return;

      let username, response;
      const check = username => auth.api.isUsernameAvailable({
        body: { username },
      });
      while (!response || !response?.available)
        response = await check(username = usernames.generate());

      return {
        context: {
          ...ctx,
          body: {
            ...ctx.body,
            username,
          },
        },
      };
    }),
  },
});
