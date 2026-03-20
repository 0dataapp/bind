<script>
import { signUp } from '$lib/auth/client';
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

<h6>Create your administrative account to get started</h6>

<AccountForm { didSubmit } />
