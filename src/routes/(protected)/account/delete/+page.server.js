import props from './props.js';

/** @type {import('./$types').PageLoad} */
export function load() {
	return props;
};

import { auth } from '$lib/auth/config';
import { redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, params }) => {
		const formData = await request.formData();

		if (formData.get('confirm') !== 'CONFIRM')
			return { error: 'Confirmation incorrect' };

		try {
			await auth.api.deleteUser({
				body: {
					password: formData.get('password'),
				},
				headers: request.headers,
				fetchOptions: {
					onError: context => {
						return { error: context.error.message };
					},
				},
			});
		} catch (e) {
			return {
				error: e.message,
			}
		}

		return redirect(303, '/');
	},

};
