<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();

import { signIn } from '$lib/auth/client.js';
import { goto } from '$app/navigation';

const propsProps = {

	didSubmit: state => signIn[state.username ? 'username' : 'email'](Object.assign({
		fetchOptions: {
			onSuccess: () => {
				const { target } = Object.fromEntries(new URLSearchParams(location.search));
				return goto(target && ['/', encodeURIComponent('/')].filter(e => target.startsWith(e)).length ? decodeURIComponent(target) : '/dash');
			},
			onError: context => state.setError(context.error.message),
		},
	}, state)),

	acceptHandle: true,

}

import AccountForm from '$lib/component/AccountForm.svelte';
</script>

<AccountForm { ...propsProps } />

{#if !data.DISABLE_SIGNUPS }

<a class="signup" href="/signup">Create account</a>
	
{/if}
