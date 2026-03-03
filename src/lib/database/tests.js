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

	test('not string', () => {
		expect(() => mod.collection()).toThrowError('missing collection name');
	});
	
	test('type', () => {
		expect(_collection()).toBeTypeOf('object');
	});

	describe('__create', () => {

		test('output', () => {
			const item = {
				id: Math.random().toString(),
			};
			expect(_collection().__create(item)).toBe(item);
		});

		test('persist', () => {
			const collection = Math.random().toString();
			const item = {
				id: Math.random().toString(),
			};
			_collection(collection).__create(item);
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [item] });
		});

	});

	describe('__getItems', () => {

		test('output', () => {
			const db = _collection();

			const item = {
				id: Math.random().toString(),
			};
			db.__create(item);
			
			expect(db.__getItems()).toEqual([item]);
		});

	});

	describe('__update', () => {

		test('output', () => {
			const db = _collection();

			const id = Math.random().toString();
			db.__create({ id });

			const key = Math.random().toString();
			const item = { id, key };
			expect(db.__update(id, item)).toBe(item);
		});

		test('persist', () => {
			const collection = Math.random().toString();
			const db = _collection(collection);

			const id = Math.random().toString();
			db.__create({ id });

			const key = Math.random().toString();
			const item = { id, key };
			db.__update(id, item);

			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [item] });
		});

	});

	describe('__delete', () => {

		test('output', () => {
			const db = _collection();

			const id = Math.random().toString();
			db.__create({ id });

			expect(db.__delete(id)).toBe(undefined);
		});

		test('persist', () => {
			const collection = Math.random().toString();
			const db = _collection(collection);

			const id = Math.random().toString();
			db.__create({ id });

			db.__delete(id);
			
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [] });
		});

	});

});
