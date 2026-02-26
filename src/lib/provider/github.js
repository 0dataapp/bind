const prefix = 'https://api.github.com';

const mod = {

	id: 'github',
	name: 'GitHub',

	repos: {

		config: token => ({
			url: `${ prefix }/user/repos?${ new URLSearchParams({
				sort: 'updated',
				direction: 'desc',
				per_page: 100,
			}) }`,
			headers: {
				'Authorization': 'token ' + token,
			},
		}),

		data: json => {
			// id: 374317859
			// name: "alfa"
			// archived: false
			// created_at: "2021-06-06T09:22:27Z"
			// default_branch: "master"
			// disabled: false
			// is_template: false
			// private: false
			// size: 0
			// updated_at: "2024-06-16T21:56:47Z"
			// visibility: "public"
			// web_commit_signoff_required: false

			return json.filter(e => !e.archived && !e.disabled && !e.is_template).map(data => ({
				id: data.id,
				name: data.name,
				isPrivate: data.private || (data.visibility === 'private'),
				createdAt: new Date(data.created_at),
				updatedAt: new Date(data.updated_at),
				defaultBranch: data.default_branch,
				cloneURL: data.clone_url,
				data,
			}));
		},

	},

};

export default mod;
