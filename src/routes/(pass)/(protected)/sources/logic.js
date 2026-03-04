const mod = {

	params: e => Object.assign({
		provider: e.id,
	}, {
		github: {
			scopes: ['repo'],
		},
		gitea_selfhosted: {},
	}[e.id]),

};

export default mod;
