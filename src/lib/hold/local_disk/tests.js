import { describe, test, expect, beforeAll } from 'vitest';
import mod from '../local_disk.js';
import stub from '../../stub.js';
import fs from 'fs';
import path from 'path';

const testFolder = './__testing/local_disk/';

mod.folder = testFolder;

describe('filesystem', () => {

	beforeAll(() => fs.rmSync(testFolder, { recursive: true, force: true }));

	describe('_encoding', () => {

		test('text', () => {
			expect(mod.filesystem._encoding(`text/${ Math.random().toString() }`)).toBe('utf8');
		});

		test('application/json', () => {
			expect(mod.filesystem._encoding('application/json')).toBe('utf8');
		});

		test('other', () => {
			expect(mod.filesystem._encoding(Math.random().toString())).toBe(undefined);
		});

	});

	describe('put', () => {

		test('data', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			expect(mod.filesystem.put({
				handle,
				target,
				data,
				ancestors: [],
				meta: stub.headers('text/plain'),
			})).toBe(undefined);
			expect(fs.readFileSync(mod.filesystem._localPath({
				handle,
				target,
			}), 'utf8')).toEqual(data);
		});

		test('meta', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			const encoding = 'text/plain';
			mod.filesystem.put({
				handle,
				target,
				data,
				ancestors: [],
				meta: stub.headers(encoding),
			});
			const _target = mod.filesystem._localPath({
				handle,
				target,
			});
			const stat = fs.statSync(_target);
			expect(JSON.parse(fs.readFileSync(mod.filesystem._metaPath(_target), 'utf8'))).toEqual({
				'Content-Length': stat.size,
				'Content-Type': encoding,
				ETag: stat.mtime.toJSON(),
			});
		});

		test('subfolders', () => {
			const handle = stub.ulid();

			const length = Math.max(Date.now() % 5, 2);
			const parents = Array.from({ length }, stub.ulid).reduce((coll, item) => {
				return coll.concat(path.join(coll.at(-1) || '', item));
			}, []);
			const ancestors = parents.map(e => mod.filesystem._localPath({ handle, target: e }) + '/');

			const target = path.join(parents.at(-1), stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				ancestors,
				meta: stub.headers('text/plain'),
			});
			expect(fs.readFileSync(mod.filesystem._localPath({
				handle,
				target,
			}), 'utf8')).toEqual(data);
			ancestors.forEach(e => {
				expect(JSON.parse(fs.readFileSync(mod.filesystem._metaPath(e), 'utf8')).ETag.slice(0, -5)).toEqual(fs.statSync(e).mtime.toJSON().slice(0, -5));
			})
		});

	});

});
