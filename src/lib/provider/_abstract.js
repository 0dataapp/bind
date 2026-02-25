import github from './github.js';

const mod = {

	_map: {
		github,
	},

	generate: provider => ({

		async repos (token) {
			const _provider = mod._map[provider].repos;
			const config = _provider.config(token);

			config.headers = Object.assign(config.headers || {}, {
				'Content-Type': 'application/json',
			});

			const res = await fetch(config.url, config);

			return _provider.data(await res.json());
		},

	}),

};

export default mod;