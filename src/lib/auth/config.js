import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import { createAuthMiddleware } from 'better-auth/api';
import { genericOAuth } from 'better-auth/plugins';

import { genericAdapter } from './generic.js';
import usernames from './username.js';
import database from '$lib/database.js';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import oauth from '$lib/oauth-implicit.js';
import local_disk from '$lib/hold/local_disk.js';
import depot from '$lib/depot.js';

export const auth = betterAuth({
  secret: building ? 'BUILD_SECRET_ONLY' : env.BETTER_AUTH_SECRET,
  // baseURL: building ? 'http://localhost' : env.BETTER_AUTH_URL,

  database: genericAdapter({
    // options
  }),

  emailAndPassword: { enabled: true },

  user: {
    additionalFields: {
      trust: {
        type: ['user', 'admin'],
        required: false,
        defaultValue: 'user',
        input: false, // disable modification
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user, request) => {
        await oauth.revokeAll(user.username);
        await local_disk.hold.erase(user.id);
      },
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scopes: ['repo'],
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },

    encryptOAuthTokens: true,
  },

  disablePaths: ['/is-username-available'],
  plugins: [
    username({
      displayUsernameNormalization: () => '',
    }),
    genericOAuth({
      config: [
        {
          providerId: 'gitea_selfhosted',
          clientId: process.env.GITEA_CLIENT_ID,
          clientSecret: process.env.GITEA_CLIENT_SECRET,
          discoveryUrl: process.env.GITEA_DISCOVERY_URL,
          scopes: [
            'read:user',
            'read:repository',
            'write:repository',
          ],
          // ... other config options
        },
      ],
      // Add more providers as needed
    })
  ],

  hooks: {
    before: createAuthMiddleware(async ctx => {
      const res = await Promise.all([{
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
            body: { providerId: ctx.body.providerId, accountId: ctx.body.accountId },
            headers: ctx.headers,
          });

          const callback = {
            github: () => {
              ctx.body
            },
          }[ctx.body.providerId];

          if (callback)
            await depot.endpoint(ctx.body.providerId).invalidate({
              clientId: process.env.GITHUB_CLIENT_ID,
              clientSecret: process.env.GITHUB_CLIENT_SECRET,
              accessToken,
            });
        },
      }[ctx.path]].filter(e => !!e).map(e => e()));

      return res.shift() || {
        context: ctx,
      };
    }),
  },

  advanced: {
    database: {
      generateId: database.generateId,
    },
    cookiePrefix: 'bind',
  },
});
