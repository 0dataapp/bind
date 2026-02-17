<script>
import { signIn } from '$lib/better-auth/client.js';
import { goto } from "$app/navigation";

const didSubmit = state => signIn.email({
	email: state.email,
	password: state.password,
	fetchOptions: {
		onSuccess: () => goto('/dash'),
		onError: context => state.setError(context.error.message),
	},
});

import AccountForm from '$lib/AccountForm.svelte';
</script>

<AccountForm { didSubmit } />

<a class="signup" href="/signup">Create account</a>
