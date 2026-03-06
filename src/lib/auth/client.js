import { createAuthClient } from 'better-auth/svelte';

import { usernameClient } from 'better-auth/client/plugins';
import { genericOAuthClient } from 'better-auth/client/plugins';
import { adminClient } from "better-auth/client/plugins"

export const {
	signIn,
	signUp,

	changePassword,
	updateUser,

	linkSocial,
	unlinkAccount,

	admin,
} = createAuthClient({
	plugins: [
		usernameClient(),
		genericOAuthClient(),
		adminClient(),
	],
});
