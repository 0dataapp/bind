import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import { createAuthMiddleware } from 'better-auth/api';

import { genericAdapter } from '$lib/generic/main.js';
import usernames from '$lib/username/main.js';
import database from '$lib/database/main.js';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import oauth from '$lib/oauth-implicit/main.js';
import storage from '$lib/storage/disk/main.js';
import _abstract from '$lib/provider/_abstract.js';

export const auth = betterAuth({
  secret: building ? 'BUILD_SECRET_ONLY' : env.BETTER_AUTH_SECRET,
  baseURL: building ? 'http://localhost' : env.BETTER_AUTH_URL,

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
    deleteUser: {
      enabled: true,
      beforeDelete: async (user, request) => {
        await oauth.revokeAll(user.id);
        await storage.erase(user.id);
      },
    },
  },

  socialProviders: {
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }, 
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },

  disablePaths: ['/is-username-available'],
  plugins: [
    username({
      displayUsernameNormalization: () => '',
    }),
  ],

  hooks: {
    before: createAuthMiddleware(ctx => [{
      '/sign-up/email': async () => {
        let username, response;
        let tries = 0;
        const check = username => auth.api.isUsernameAvailable({
          body: { username },
        });
        while (!response || !response?.available)
          response = await check(username = usernames.generate(3 + tries++ / 10));

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              username,
            },
          },
        };
      },
      '/unlink-account': async () => {
        const { accessToken } = await auth.api.getAccessToken({
          body: Object.assign(structuredClone(ctx.body), { accountId: ctx.body.id }),
          headers: ctx.headers,
        });

        const callback = {
          github: () => {
            ctx.body
          },
        }[ctx.body.providerId];

        if (!callback)
          return

        _abstract.generate(ctx.body.providerId).invalidate({
          clientId: process.env.GITHUB_CLIENT_ID, 
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          accessToken,
        });
      },
    }[ctx.path]].filter(e => !!e).map(e => e()).shift()),
  },

  advanced: {
    database: {
      generateId: database.generateId,
    },
    cookiePrefix: 'bind',
  },
});
