import { describe, test, expect, throws, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import mod from './main.js';

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

	describe('create', () => {

		test('output', () => {
			const item = {
				id: Math.random().toString(),
			};
			expect(_collection().create(item)).toBe(item);
		});

		test('persist', () => {
			const collection = Math.random().toString();
			const item = {
				id: Math.random().toString(),
			};
			_collection(collection).create(item);
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [item] });
		});

	});

	describe('getItems', () => {

		test('output', () => {
			const db = _collection();

			const item = {
				id: Math.random().toString(),
			};
			db.create(item);
			
			expect(db.getItems()).toEqual([item]);
		});

	});

	describe('update', () => {

		test('output', () => {
			const db = _collection();

			const id = Math.random().toString();
			db.create({ id });

			const key = Math.random().toString();
			const item = { id, key };
			expect(db.update(id, item)).toBe(item);
		});

		test('persist', () => {
			const collection = Math.random().toString();
			const db = _collection(collection);

			const id = Math.random().toString();
			db.create({ id });

			const key = Math.random().toString();
			const item = { id, key };
			db.update(id, item);

			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [item] });
		});

	});

	describe('delete', () => {

		test('output', () => {
			const db = _collection();

			const id = Math.random().toString();
			db.create({ id });

			expect(db.delete(id)).toBe(undefined);
		});

		test('persist', () => {
			const collection = Math.random().toString();
			const db = _collection(collection);

			const id = Math.random().toString();
			db.create({ id });

			db.delete(id);
			
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [] });
		});

	});

});
