const mod = {

	parseScopes: e => e.split(/\s+/).map(e => {
		const [scope, permissions] = e.split(':');
		return {
			scope,
			name: scope === '*' ? 'Everything in your storage' : `/${ scope }`,
			permissions: {
				r: 'Read only',
				rw: 'Read & Write',
			}[permissions] || 'unknown',
		};
	}),

};

export default mod;