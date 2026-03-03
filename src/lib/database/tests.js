import { describe, test, expect, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import mod from '../database.js';

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

});
