import { describe, test, expect, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import mod from '../database.js';
import util from '$lib/util.js';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _DATA_DIRECTORY = path.join(__dirname, '../../../__testing');
const folder = path.join(_DATA_DIRECTORY, mod._subdirectory());

describe('collection', () => {

	afterAll(() => {
	  fs.readdirSync(folder).forEach(e => fs.unlinkSync(path.join(folder, e)));
	});

	const _collection = e => mod.collection(e || Math.random().toString(), {
		folder: _DATA_DIRECTORY,
	});

	test('not string', async () => {
		expect(() => mod.collection()).toThrowError('missing collection name');
	});
	
	test('type', async () => {
		expect(_collection()).toBeTypeOf('object');
	});

	describe('__create', () => {

		test('output', async () => {
			const item = {
				id: Math.random().toString(),
			};
			expect(await _collection().__create(item)).toBe(item);
		});

		test('persist', async () => {
			const collection = Math.random().toString();
			const item = {
				id: Math.random().toString(),
			};
			await _collection(collection).__create(item);
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [item] });
		});

	});

	describe('__getItems', () => {

		test('output', async () => {
			const db = _collection();

			const item = {
				id: Math.random().toString(),
			};
			await db.__create(item);
			
			expect(await db.__getItems()).toEqual([item]);
		});

	});

	describe('__update', () => {

		test('output', async () => {
			const db = _collection();

			const id = Math.random().toString();
			await db.__create({ id });

			const key = Math.random().toString();
			const item = { id, key };
			expect(await db.__update(id, item)).toBe(item);
		});

		test('persist', async () => {
			const collection = Math.random().toString();
			const db = _collection(collection);

			const id = Math.random().toString();
			await db.__create({ id });

			const key = Math.random().toString();
			const item = { id, key };
			await db.__update(id, item);

			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [item] });
		});

	});

	describe('__delete', () => {

		test('output', async () => {
			const db = _collection();

			const id = Math.random().toString();
			await db.__create({ id });

			expect(await db.__delete(id)).toBe(undefined);
		});

		test('persist', async () => {
			const collection = Math.random().toString();
			const db = _collection(collection);

			const id = Math.random().toString();
			await db.__create({ id });

			await db.__delete(id);
			
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [] });
		});

	});

	describe('hydrating', () => {

		describe('create', () => {

			test('output', async () => {
				const data = { [Math.random().toString()]: Math.random().toString() };
				expect(await _collection().hydrating.create({ data })).toEqual({ data });
			});

			test('persist', async () => {
				const collection = Math.random().toString();
				const data = { [Math.random().toString()]: Math.random().toString() };
				const e = { data };
				await _collection(collection).hydrating.create(e);
				expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [{
					data: JSON.stringify(data),
				}] });
			});

		});

		describe('getItems', () => {

			test('output', async () => {
				const db = _collection();

				const data = { [Math.random().toString()]: Math.random().toString() };
				const e = { data };
				await db.hydrating.create(e);
				
				expect(await db.hydrating.getItems()).toEqual([e]);
			});

		});

		describe('update', () => {

			test('output', async () => {
				const db = _collection();

				const id = Math.random().toString();
				await db.hydrating.create({ id });

				const key = Math.random().toString();
				const data = { [Math.random().toString()]: Math.random().toString() };
				const item = { id, key, data };
				expect(await db.hydrating.update(id, item)).toEqual(item);
			});

			test('persist', async () => {
				const collection = Math.random().toString();
				const db = _collection(collection);

				const id = Math.random().toString();
				await db.hydrating.create({ id });

				const key = Math.random().toString();
				const data = { [Math.random().toString()]: Math.random().toString() };
				await db.hydrating.update(id, { id, key, data });

				expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [{ id, key, data: JSON.stringify(data) }] });
			});

		});

	});

	describe('concurrency', () => {

		test('direct', async () => {
			const coll = _collection();
			const items = Array.from({ length: 10 }).map(e => ({
				id: Math.random().toString(),
			}));
			await Promise.all(items.map(coll.__create));
			const sort = util.sort.asc(e => e.id);
			expect((await coll.__getItems()).sort(sort)).toMatchObject(items.sort(sort));
		});

		test('delayed', async () => {
			const coll = _collection();
			const items = Array.from({ length: 100 }).map(e => ({
				id: Math.random().toString(),
			}));
			await Promise.all(items.map(e => new Promise((res) => setTimeout(() => res(coll.__create(e)), Math.random() * 10))));
			const sort = util.sort.asc(e => e.id);
			expect((await coll.__getItems()).sort(sort)).toMatchObject(items.sort(sort));
		});

	});

});
