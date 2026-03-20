import db from '$lib/database.js';
import util from '$lib/util.js';

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
	return {
		title: 'Settings',
		map: await db.collection('admin_settings').hydrating.getItems().then(e => Object.fromEntries(e.map(e => [e.key, e.value]))),
	};
};

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, params }) => {
		const data = await request.formData();
		const settings = await db.collection('admin_settings').hydrating.getItems();

		await Promise.all([
			'disable_signups',
		].map(key => {
			const match = settings.filter(e => e.key === key).shift();

			const value = data.get(key);

			return match ? db.collection('admin_settings').hydrating.update(match.id, Object.assign(match, {
					value,
				})) : db.collection('admin_settings').hydrating.create({
				id: db.generateId(),
				key,
				value,
			});
		}));

		return {
			flash: {
				type: 'success',
				message: 'Settings updated',
			},
		};
	},

};
