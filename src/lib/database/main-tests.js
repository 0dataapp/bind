import { describe, it, expect, throws, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import mod from './main.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _DATA_DIRECTORY = path.join(__dirname, '../../../__testing');
const folder = path.join(_DATA_DIRECTORY, mod._subdirectory());

describe('collection', () => {

	afterAll(() => {
	  fs.readdirSync(folder).forEach(e => fs.unlinkSync(path.join(folder, e)));
	});

	const _collection = e => mod.collection(e || Math.random().toString(), {
		folder: _DATA_DIRECTORY,
	});

	it('throws if not string', () => {
		expect(() => mod.collection()).toThrowError('missing collection name');
	});
	
	it('returns object', () => {
		expect(_collection()).toBeTypeOf('object');
	});

	describe('create', () => {

		it('returns input', () => {
			const item = {
				id: Math.random().toString(),
			};
			expect(_collection().create(item)).toBe(item);
		});

		it('updates file', () => {
			const collection = Math.random().toString();
			const item = {
				id: Math.random().toString(),
			};
			_collection(collection).create(item);
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [item] });
		});

	});

	describe('getItems', () => {

		it('returns items', () => {
			const db = _collection();

			const item = {
				id: Math.random().toString(),
			};
			db.create(item);
			
			expect(db.getItems()).toEqual([item]);
		});

	});

	describe('update', () => {

		it('returns input', () => {
			const db = _collection();

			const id = Math.random().toString();
			db.create({ id });

			const key = Math.random().toString();
			const item = { id, key };
			expect(db.update(id, item)).toBe(item);
		});

		it('updates file', () => {
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

		it('returns undefined', () => {
			const db = _collection();

			const id = Math.random().toString();
			db.create({ id });

			expect(db.delete(id)).toBe(undefined);
		});

		it('updates file', () => {
			const collection = Math.random().toString();
			const db = _collection(collection);

			const id = Math.random().toString();
			db.create({ id });

			db.delete(id);
			
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [] });
		});

	});

});
