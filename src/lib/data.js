const _providers = {
	credential: 'local disk',
	github: 'GitHub',
};

const mod = {

	_providers,
	providers: Object.entries(_providers).map(([slug, name]) => ({ slug, name })),

};

export default mod;
