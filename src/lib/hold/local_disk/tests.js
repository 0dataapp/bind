import { describe, test, expect, beforeAll } from 'vitest';
import mod from '../local_disk.js';
import stub from '../../stub.js';
import fs from 'fs';
import path from 'path';

const testFolder = './__testing/local_disk/';

mod.folder = testFolder;

describe('filesystem', () => {

	beforeAll(() => fs.rmSync(testFolder, { recursive: true, force: true }));

	describe('put', () => {

		test('data', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			const encoding = 'text/plain';
			const meta = stub.headers(encoding);

			expect(mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta,
			})).toBe(undefined);

			const stat = fs.statSync(mod.filesystem._localPath({
				handle,
				target,
			}));
			expect(meta).toEqual(Object.assign(stub.headers(encoding), {
				ETag: stat.mtime.toJSON(),
				'Content-Length': stat.size,
				'Last-Modified': stat.mtime.toUTCString(),
			}));
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
				breadcrumbs: [],
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
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('subfolders', () => {
			const handle = stub.ulid();

			const length = Math.max(Date.now() % 5, 2);
			const parents = Array.from({ length }, stub.ulid).reduce((coll, item) => {
				return coll.concat(path.join(coll.at(-1) || '', item));
			}, []);
			const breadcrumbs = parents;

			const target = path.join(parents.at(-1), stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(fs.readFileSync(mod.filesystem._localPath({
				handle,
				target,
			}), 'utf8')).toEqual(data);
			breadcrumbs.forEach(e => {
				e = mod.filesystem._localPath({ handle, target: e }) + '/';
				expect(JSON.parse(fs.readFileSync(mod.filesystem._metaPath(e), 'utf8')).ETag.slice(0, -5)).toEqual(fs.statSync(e).mtime.toJSON().slice(0, -5));
			});
		});

	});

	describe('delete', () => {

		test('data', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.delete({
				handle,
				target,
				breadcrumbs: [],
			})).toBe(undefined);
			expect(fs.existsSync(mod.filesystem._localPath({
				handle,
				target,
			}))).toBe(false);
		});

		test('meta', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			mod.filesystem.delete({
				handle,
				target,
				breadcrumbs: [],
			});
			expect(fs.existsSync(mod.filesystem._metaPath(target))).toBe(false);
		});

		test('parents without items', () => {
			const handle = stub.ulid();

			const length = Math.max(Date.now() % 5, 2);
			const parents = Array.from({ length }, stub.ulid).reduce((coll, item) => {
				return coll.concat(path.join(coll.at(-1) || '', item));
			}, []);
			const breadcrumbs = parents;

			const target = path.join(parents.at(-1), stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			mod.filesystem.delete({
				handle,
				target,
				breadcrumbs,
			});
			expect(fs.existsSync(mod.filesystem._localPath({
				handle,
				target,
			}))).toBe(false);
			expect(fs.existsSync(mod.filesystem._metaPath(target))).toBe(false);
			breadcrumbs.forEach(e => {
				expect(fs.existsSync(e)).toBe(false);
			});
		});

		test('parents with items', () => {
			const handle = stub.ulid();

			const length = Math.max(Date.now() % 5, 2);
			const parents = Array.from({ length }, stub.ulid).reduce((coll, item) => {
				return coll.concat(path.join(coll.at(-1) || '', item));
			}, []);
			const breadcrumbs = parents;

			const target = path.join(parents.at(-1), stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			mod.filesystem.put({
				handle,
				target: path.join(parents[0], stub.basename()),
				data: Math.random().toString(),
				breadcrumbs: breadcrumbs.slice(0, 1),
				meta: stub.headers('text/plain'),
			});
			
			const meta = mod.filesystem.meta({
				handle,
				target: parents[0] + '/',
			});
			
			mod.filesystem.delete({
				handle,
				target,
				breadcrumbs,
			});
			expect(fs.existsSync(mod.filesystem._localPath({
				handle,
				target,
			}))).toBe(false);
			expect(fs.existsSync(mod.filesystem._metaPath(target))).toBe(false);
			breadcrumbs.forEach((e, i) => {
				e = mod.filesystem._localPath({ handle, target: e });
				expect(fs.existsSync(e)).toBe(i === 0);
			});
			expect(meta.ETag).not.toBe(mod.filesystem.meta({
				handle,
				target: parents[0] + '/',
			}).ETag);
		});

	});

	describe('list', () => {

		test('file', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			const encoding = 'text/plain';
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers(encoding),
			});
			const _target = mod.filesystem._localPath({
				handle,
				target,
			});
			const stat = fs.statSync(_target);
			expect(mod.filesystem.list({
				handle,
				target: '/',
			})).toEqual({
				[target]: mod.filesystem.meta({
					handle,
					target,
				}),
			});
		});

		test('folder', () => {
			const handle = stub.ulid();

			const parent = stub.ulid();
			const breadcrumbs = [parent];

			const target = path.join(parent, stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.list({
				handle,
				target: '/',
			})).toEqual({
				[parent + '/']: mod.filesystem.meta({
					handle,
					target: parent + '/',
				}),
			});
		});

	});

	describe('exists', () => {

		test('file', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.exists({
				handle,
				target,
			})).toBe(true);
		});

		test('folder', () => {
			const handle = stub.ulid();

			const parent = stub.ulid();
			const breadcrumbs = [parent];

			const target = path.join(parent, stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.exists({
				handle,
				target: parent,
			})).toBe(true);
			expect(mod.filesystem.exists({
				handle,
				target: parent + '/',
			})).toBe(true);
		});

		test('non-existant', () => {
			const handle = stub.ulid();

			const parent = stub.ulid();
			const breadcrumbs = [parent];

			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target: path.join(parent, stub.basename()),
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.exists({
				handle,
				target: path.join(parent, stub.basename()),
			})).toBe(false);
			expect(mod.filesystem.exists({
				handle,
				target: path.join(parent, `${ stub.basename() }/`),
			})).toBe(false);
		});

	});

	describe('isFolder', () => {

		test('file', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.isFolder({
				handle,
				target,
			})).toBe(false);
		});

		test('folder', () => {
			const handle = stub.ulid();

			const parent = stub.ulid();
			const breadcrumbs = [parent];

			const target = path.join(parent, stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.isFolder({
				handle,
				target: parent,
			})).toBe(true);
		});

	});

	describe('get', () => {

		test('text', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			const contentType = 'text/plain';
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers(contentType),
			});
			expect(mod.filesystem.get({
				handle,
				target,
				contentType,
			})).toBe(data);
		});

		test('buffer', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Buffer.from(Math.random().toString());
			const contentType = 'application/octet-stream';
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers(contentType),
			});
			expect(mod.filesystem.get({
				handle,
				target,
				contentType,
			})).toEqual(data);
		});

	});

	describe('meta', () => {

		test('file', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			const encoding = 'text/plain';
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers(encoding),
			});
			const _target = mod.filesystem._localPath({
				handle,
				target,
			});
			const stat = fs.statSync(_target);
			expect(mod.filesystem.meta({
				handle,
				target,
			})).toEqual({
				'Content-Length': stat.size,
				'Content-Type': encoding,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('folder', () => {
			const handle = stub.ulid();

			const parent = stub.ulid();
			const breadcrumbs = [parent];

			const target = path.join(parent, stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.meta({
				handle,
				target: parent + '/',
			}).ETag.slice(0, -5)).toEqual(fs.statSync(mod.filesystem._localPath({ handle, target: breadcrumbs[0] })).mtime.toJSON().slice(0, -5));
		});

	});

});
