import { options } from './depot/options.js';

const mod = {

	_maxBytes: 100000,
	maxSize: () => `${ mod._maxBytes / 1000 }MB`,

	options,

	endpoint: provider => ({

		async repos (params) {
			const _provider = mod.options[provider].repos;
			const config = _provider.config(params);

			config.headers = Object.assign(config.headers || {}, {
				'Content-Type': 'application/json',
			});

			const res = await fetch(config.url, config);

			return _provider.data(await res.json()).filter(e => e.size < mod._maxBytes);
		},

		invalidate (params) {
			if (!mod.options[provider].invalidate)
				return;
			
		  const config = mod.options[provider].invalidate.config(params);
		  
		  config.headers = Object.assign(config.headers || {}, {
		  	'Content-Type': 'application/json',
		  });

		  return fetch(config.url, config);
		},

	}),

};

export default mod;
