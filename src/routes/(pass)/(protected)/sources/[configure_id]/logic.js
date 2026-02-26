const mod = {

	params: e => Object.assign({
		provider: e,
	}, {
		github: {
			scopes: ['repo'],
		},
	}[e]),

};

export default mod;
