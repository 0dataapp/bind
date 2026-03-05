const mod = {

	groupName: e => {
		try {
			const url = new URL(e);
			return url.hostname;
		} catch {
			return e;
		}
	},

};

export default mod;
