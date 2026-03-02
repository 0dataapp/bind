<script>
import { signUp } from '$lib/better-auth/client';
import { goto } from '$app/navigation';

const didSubmit = state => signUp.email({
	email: state.email,
	password: state.password,
	name: '',
	fetchOptions: {
		onSuccess: () => goto('/dash'),
		onError: context => state.setError(context.error.message),
	},
});

import AccountForm from '$lib/component/AccountForm.svelte';
</script>

<AccountForm { didSubmit } />

<a class="login" href="/login">Sign in</a>
