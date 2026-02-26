const mod = {

	group: (e, callback) => e.reduce((coll, item) => Object.assign(coll, {
		[callback(item)]: (coll[callback(item)] || []).concat(item),
	}), {}),
	groupList: (e, callback) => Object.entries(mod.group(e, callback)).map(([key, value]) => ({ key, value })),

	sort: {
		asc: callback => (a, b) => ((a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0))(callback(a), callback(b)),
		conform: (array, callback) => mod.sort.asc(e => array.indexOf(callback(e))),
	},

	hex: {
		encode: e => Array.from(new TextEncoder().encode(e)).map(byte => byte.toString(16).padStart(2, '0')).join(''),
		decode: hex => {
		  const bytes = new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16)));
		  return new TextDecoder().decode(bytes);
		},
	},

};

export default mod;
