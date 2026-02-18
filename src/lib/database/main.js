import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

const mod = {

	collection (collection, params = {}) {
		if (!collection)
			throw new Error('missing collection name');

		const folder = params.folder || path.join(__dirname, '__data');
		fs.mkdirSync(folder, { recursive: true });

		let db;
		const _this = {};
		return Object.assign(_this, {

			db: () => {
				if (db)
					return db;

				db = new LowSync(new JSONFileSync(path.join(folder, `${ collection }.json`)), { items: [] })

				db.read();

				return db;
			},

			create: obj => {
				_this.db().update(({ items }) => items.push(obj));

				return obj;
			},

			getItems: () => _this.db().data.items,

			update: (id, obj) => {
				_this.db().update(({ items }) => Object.assign(items.filter(e => e.id === id).shift(), obj));

				return obj;
			},

			delete: id => {
				_this.db().update(({ items }) => items.splice(items.findIndex(e => e.id === id), 1));
			},

		});
	}

};

export default mod;