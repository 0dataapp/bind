import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins';

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
import { state } from '$lib/welcome.svelte.js';
import db from '$lib/database.js';

export const auth = betterAuth({
  secret: building ? 'BUILD_SECRET_ONLY' : env.BIND_SECRET,
  // baseURL: building ? 'http://localhost' : env.BETTER_AUTH_URL,

  database: genericAdapter({
    // options
  }),

  emailAndPassword: { enabled: true },

  user: {
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
      scope: ['repo'],
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
    }),
    admin(),
  ],

  hooks: {
    before: createAuthMiddleware(async ctx => {
      const res = await Promise.all([{
        '/admin/create-user': async () => {
          return {
            context: {
              ...ctx,
              body: {
                ...ctx.body,
                data: Object.assign(ctx.body.data || {}, {
                  username: await usernames.generate(auth),
                }),
              },
            },
          };
        },
        '/sign-up/email': async () => {
          return {
            context: {
              ...ctx,
              body: {
                ...ctx.body,
                username: await usernames.generate(auth),
              },
            },
          };
        },
        '/unlink-account': async () => {
          const { accessToken } = await auth.api.getAccessToken({
            body: { providerId: ctx.body.providerId, accountId: ctx.body.accountId },
            headers: ctx.headers,
          });

          const params = {
            github: {
              clientId: process.env.GITHUB_CLIENT_ID,
              clientSecret: process.env.GITHUB_CLIENT_SECRET,
              accessToken,
            },
          }[ctx.body.providerId];

          if (params)
            await depot.endpoint(ctx.body.providerId).invalidate(params);
        },
      }[ctx.path]].filter(e => !!e).map(e => e()));

      return res.shift() || {
        context: ctx,
      };
    }),

    after: createAuthMiddleware(async (ctx) => {
      if (!ctx.path.startsWith('/sign-up'))
        return

      // null means not loaded
      if (state.storedUsers !== 0)
        return

      const newSession = ctx.context.newSession;
      if (!newSession)
        return

      state.storedUsers = 1;

      await db.collection('user').__update(newSession.user.id, {
        role: 'admin',
      });
    }),
  },

  advanced: {
    database: {
      generateId: database.generateId,
    },
    cookiePrefix: 'bind',
  },
});
