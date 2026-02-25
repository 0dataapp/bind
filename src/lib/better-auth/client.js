import { createAuthClient } from 'better-auth/svelte';

import { usernameClient } from 'better-auth/client/plugins';

export const {
	signIn,
	signUp,

	changePassword,
	updateUser,
} = createAuthClient({
	plugins: [
		usernameClient(),
	],
});
