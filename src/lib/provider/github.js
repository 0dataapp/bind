const mod = {

	id: 'github',
	name: 'GitHub',

	_prefix: 'https://api.github.com',

	repos: {

		config: token => ({
			url: `${ mod._prefix }/user/repos?${ new URLSearchParams({
				sort: 'updated',
				direction: 'desc',
				per_page: 100,
			}) }`,
			headers: {
				'Authorization': 'token ' + token,
			},
		}),

		data: json => json.filter(e => !e.archived && !e.disabled && !e.is_template).map(data => ({
			id: data.id.toString(),
			name: data.name,
			scopedName: data.full_name,
			isPrivate: data.private || (data.visibility === 'private'),
			createdAt: new Date(data.created_at),
			updatedAt: new Date(data.updated_at),
			defaultBranch: data.default_branch,
			cloneURL: data.clone_url,
			webURL: data.html_url,
			ownerId: data.owner.id.toString(),
			payload: data,
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
