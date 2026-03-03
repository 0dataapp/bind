const mod = {

	id: 'github',
	name: 'GitHub',

	_prefix: 'https://api.github.com',

	repos: {

		config: token => ({
			// https://docs.github.com/en/rest/repos/repos#list-repositories-for-the-authenticated-user
			url: `${ mod._prefix }/user/repos?${ new URLSearchParams({
				sort: 'updated',
				direction: 'desc',
				per_page: 100,
			}) }`,
			headers: {
				'Authorization': 'token ' + token,
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
			webURL: e.html_url,
			ownerId: e.owner.id.toString(),
			payload: mod.repos._tidy(e),
		})),

	},

	invalidate: {

		config ({ clientId, clientSecret, accessToken }) {
		  const credentials = btoa(`${ clientId }:${ clientSecret }`);

		  return {
		  	url: `https://api.github.com/applications/${ clientId }/token`,
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
