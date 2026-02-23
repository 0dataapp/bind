import { createAuthClient } from 'better-auth/svelte';

import { usernameClient } from 'better-auth/client/plugins';

export const { signIn, signUp, changePassword, updateUser, deleteUser } = createAuthClient({
	plugins: [
		usernameClient(),
	],
});
