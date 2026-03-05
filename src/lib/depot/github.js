const mod = {

	meta: {
		id: 'github',
		name: 'GitHub',
		hasSubsources: true,
	},

	apiURL: e => 'https://api.github.com' + e,

	repos: {

		config: ({ accessToken }) => ({
			// https://docs.github.com/en/rest/repos/repos#list-repositories-for-the-authenticated-user
			url: mod.apiURL(`/user/repos?${ new URLSearchParams({
				sort: 'updated',
				direction: 'desc',
				per_page: 100,
			}) }`),
			headers: {
				'Authorization': 'token ' + accessToken,
			},
		}),

		_tidy: e => {
			e = structuredClone(e);

			const tidy = e => {
				for (let key in e)
					if (key.endsWith('url'))
						delete e[key];
					else if (key === 'owner')
						tidy(e[key])
			};

			tidy(e);

			return e;
		},

		data: json => json.filter(e => !e.archived && !e.disabled && !e.is_template).map(e => ({
			id: e.id.toString(),
			name: e.name,
			scopedName: e.full_name,
			isPrivate: e.private || (e.visibility === 'private'),
			createdAt: new Date(e.created_at),
			updatedAt: new Date(e.updated_at),
			defaultBranch: e.default_branch,
			cloneURL: e.clone_url,
			cloneURLTemplate: decodeURI(Object.assign(new URL(e.clone_url), {
				username: '{token}',
				password: 'x-oauth-basic',
			}).toString()),
			webURL: e.html_url,
			ownerId: e.owner.id.toString(),
			size: e.size,
			payload: mod.repos._tidy(e),
		})),

	},

	invalidate: {

		config ({ clientId, clientSecret, accessToken }) {
		  const credentials = btoa(`${ clientId }:${ clientSecret }`);

		  return {
		  	url: mod.apiURL(`/applications/${ clientId }/token`),
		  	method: 'DELETE',
		  	headers: {
	        'Authorization': `Basic ${ credentials }`,
	      },
	      body: JSON.stringify({
	      	access_token: accessToken,
			  }),
		  };
		},

	},


};

export default mod;
