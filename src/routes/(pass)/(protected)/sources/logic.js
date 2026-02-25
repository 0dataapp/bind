const mod = {

	params: e => Object.assign({
		provider: e,
	}, {
		github: {
			scopes: ['repo'],
		},
	}[e]),

	providers: Object.entries({
		github: 'GitHub',
	}).map(([slug, name]) => ({ slug, name })),

};

export default mod;
