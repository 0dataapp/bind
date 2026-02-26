const mod = {

	group: {
		asObject: (e, callback) => e.reduce((coll, item) => Object.assign(coll, {
				[callback(item)]: (coll[callback(item)] || []).concat(item),
			}), {}),
		asArray: (e, callback) => Object.entries(mod.group.asObject(e, callback)).map(([key, values]) => ({ key, values })),
	},

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

	dehydrate: object => {
	  return Object.assign(object, {
	  	data: JSON.stringify(object.data),
	  });
	},
	hydrate: object => {
	  return typeof object.data !== 'string' ? object : Object.assign(structuredClone(object), {
	    createdAt: new Date(object.createdAt),
	    data: JSON.parse(object.data),
	  });
	},

};

export default mod;
