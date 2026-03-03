import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

import { env } from '$env/dynamic/private';

import { ulid } from "ulid";

const mod = {

	_subdirectory: () => '__db',

	collection (collection, params = {}) {
		if (!collection)
			throw new Error('missing collection name');

		const folder = path.join(env.DATA_DIRECTORY || params.folder || __dirname, mod._subdirectory());
		fs.mkdirSync(folder, { recursive: true });

		let db;
		const _this = {};
		return Object.assign(_this, {

			_db: () => {
				if (db)
					return db;

				db = new LowSync(new JSONFileSync(path.join(folder, `${ collection }.json`)), { items: [] })

				db.read();

				return db;
			},

			create: obj => {
				_this._db().update(({ items }) => items.push(obj));

				return obj;
			},

			getItems: () => _this._db().data.items,

			update: (id, obj) => {
				_this._db().update(({ items }) => Object.assign(items.filter(e => e.id === id).shift(), obj));

				return obj;
			},

			delete: id => {
				_this._db().update(({ items }) => items.splice(items.findIndex(e => e.id === id), 1));
			},

		});
	},

	generateId: () => ulid().toLowerCase(),

};

export default mod;