import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import { env } from '$env/dynamic/private';

import { ulid } from 'ulid';

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

			_db: async () => {
				if (db)
					return db;

				db = new Low(new JSONFile(path.join(folder, `${ collection }.json`)), { items: [] })

				await db.read();

				return db;
			},

			__create: async obj => {
				await (await _this._db()).update(({ items }) => items.push(obj));

				return obj;
			},

			__getItems: async () => (await _this._db()).data.items,

			__update: async (id, obj) => {
				await (await _this._db()).update(({ items }) => Object.assign(items.filter(e => e.id === id).shift(), obj));

				return obj;
			},

			__delete: async id => (await _this._db()).update(({ items }) => items.splice(items.findIndex(e => e.id === id), 1)),
			},

		});
	},

	generateId: () => ulid().toLowerCase(),

};

export default mod;