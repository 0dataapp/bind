import github from './depot/github.js';

const _providers = {
	credential: 'local disk',
	github: 'GitHub',
};

const mod = {

	_map: {
		github,
	},

	_providers,
	asList: Object.entries(_providers).map(([slug, name]) => ({ slug, name })),

	endpoint: provider => ({

		async repos (token) {
			const _provider = mod._map[provider].repos;
			const config = _provider.config(token);

			config.headers = Object.assign(config.headers || {}, {
				'Content-Type': 'application/json',
			});

			const res = await fetch(config.url, config);

			return _provider.data(await res.json());
		},

		invalidate (params) {
		  const config = mod._map[provider].invalidate.config(params);
		  
		  config.headers = Object.assign(config.headers || {}, {
		  	'Content-Type': 'application/json',
		  });

		  return fetch(config.url, config);
		},

	}),

};

export default mod;