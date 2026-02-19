<script>
import { signIn } from '$lib/better-auth/client.js';
import { goto } from '$app/navigation';

const props = {

	didSubmit: state => signIn[state.username ? 'username' : 'email'](Object.assign({
		fetchOptions: {
			onSuccess: () => {
				const { target } = Object.fromEntries(new URLSearchParams(location.search));
				return goto(target ? decodeURIComponent(target) : '/dash');
			},
			onError: context => state.setError(context.error.message),
		},
	}, state)),

	acceptHandle: true,

}

import AccountForm from '$lib/AccountForm.svelte';
</script>

<AccountForm { ...props } />

<a class="signup" href="/signup">Create account</a>
