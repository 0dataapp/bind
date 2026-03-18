const mod = {

	groupName: e => {
		try {
			const url = new URL(e);
			return (url.host.replace('www.', '') + url.pathname).replace(/\/$/, '');
		} catch {
			return e;
		}
	},

};

export default mod;
