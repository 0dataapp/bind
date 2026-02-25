const _providers = {
	github: 'GitHub',
};

const mod = {

	_providers,
	providers: Object.entries(_providers).map(([slug, name]) => ({ slug, name })),

};

export default mod;
