const mod = {

	meta: {
		id: 'gitea_selfhosted',
		name: 'Gitea (self-hosted)',
		hasSubsources: true,
	},

	credentials: [
		'GITEA_CLIENT_ID',
		'GITEA_CLIENT_SECRET',
		'GITEA_DISCOVERY_URL',
		'GITEA_URL',
	],

	apiURL: e => process.env.GITEA_URL + '/api/v1' + e,

	repos: {

		config: ({ accessToken }) => ({
			// https://docs.gitea.com/api/1.25/#tag/user/operation/userCurrentListRepos
			url: mod.apiURL('/user/repos'),
			headers: {
				'Authorization': 'token ' + accessToken,
			},
		}),

		data: json => json.filter(e => !e.archived && !e.template).map(e => {
			const cloneURL = `${ process.env.GITEA_URL }/${ e.full_name }.git`;
			return {
				id: e.id.toString(),
				name: e.name,
				scopedName: e.full_name,
				isPrivate: e.private,
				createdAt: new Date(e.created_at),
				updatedAt: new Date(e.updated_at),
				defaultBranch: e.default_branch,
				cloneURL,
				cloneURLTemplate: decodeURI(Object.assign(new URL(cloneURL), {
					username: e.owner.username,
					password: '{token}',
				}).toString()),
				webURL: e.html_url,
				ownerId: e.owner.id.toString(),
				size: e.size,
				payload: e,
			};
		}),

	},

	invalidate: {},

};

export default mod;
