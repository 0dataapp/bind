const mod = {

	group: {
		asObject: (e, cb) => e.reduce((coll, item) => Object.assign(coll, {
				[cb(item)]: (coll[cb(item)] || []).concat(item),
			}), {}),
		asArray: (e, cb) => Object.entries(mod.group.asObject(e, cb)).map(([key, values]) => ({ key, values })),
	},

	sort: {
		asc: cb => (a, b) => ((a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0))(cb(a), cb(b)),
		conform: (array, cb) => mod.sort.asc(e => array.indexOf(cb(e))),
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
