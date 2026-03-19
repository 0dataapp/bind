import fs from 'fs';
import path from 'path';

import { env } from '$env/dynamic/private';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import { ulid } from 'ulid';

const collections = {};

const mod = {

	_subdirectory: () => '__db',

	collection (collection, params = {}) {
		if (!collection)
			throw new Error('missing collection name');

		const folder = path.join(env.DATA_DIRECTORY || params.folder || __dirname, mod._subdirectory());
		fs.mkdirSync(folder, { recursive: true });

		const _this = {};
		return Object.assign(_this, {

			_db: async () => {
				if (collections[collection])
					return collections[collection];

				collections[collection] = new Low(new JSONFile(path.join(folder, `${ collection }.json`)), { items: [] })

				await collections[collection].read();

				return collections[collection];
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

			hydrating: {

				_hydrate: e => {
					e = structuredClone(e);

					[
						'createdAt',
						'updatedAt',
					].forEach(key => {
						if (typeof e[key] !== 'undefined')
							e[key] = new Date(e[key]);
					});

					if (typeof e.data === 'string')
						e.data = JSON.parse(e.data);

					return e;
				},

				_dehydrate: e => Object.assign(structuredClone(e), { data: JSON.stringify(e.data) }),
				
				create: async e => {
					await _this.__create(_this.hydrating._dehydrate(e));
					return e;
				},

				getItems: async () => (await _this.__getItems()).map(_this.hydrating._hydrate),

				update: async (id, e) => {
					await _this.__update(id, _this.hydrating._dehydrate(e));
					return e;
				},

			},

		});
	},

	generateId: () => ulid().toLowerCase(),

};

export default mod;
