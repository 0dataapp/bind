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

		test('string', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			const contentType = 'text/plain';
			const meta = stub.headers(contentType);

			expect(mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta,
			})).toBe(undefined);

			const _target = mod.util.localPath({
				handle,
				target,
			});
			const stat = fs.statSync(_target);
			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: stat.mtime.toJSON(),
				'Content-Length': stat.size,
				'Last-Modified': stat.mtime.toUTCString(),
			}));
			expect(fs.readFileSync(_target, 'utf8')).toEqual(data);
			expect(JSON.parse(fs.readFileSync(mod.filesystem._metaPath(_target), 'utf8'))).toEqual({
				'Content-Length': stat.size,
				'Content-Type': contentType,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('buffer', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = stub.buffer();
			const contentType = 'application/octet-stream';
			const meta = stub.headers(contentType);

			expect(mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta,
			})).toBe(undefined);

			const _target = mod.util.localPath({
				handle,
				target,
			});
			const stat = fs.statSync(_target);
			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: stat.mtime.toJSON(),
				'Content-Length': stat.size,
				'Last-Modified': stat.mtime.toUTCString(),
			}));
			expect(fs.readFileSync(_target)).toEqual(data);
			expect(JSON.parse(fs.readFileSync(mod.filesystem._metaPath(_target), 'utf8'))).toEqual({
				'Content-Length': stat.size,
				'Content-Type': contentType,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('subfolders', () => {
			const handle = stub.ulid();
			const breadcrumbs = stub.breadcrumbs();
			const target = path.join(breadcrumbs.at(-1), stub.basename());
			const data = Math.random().toString();
			mod.filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(fs.readFileSync(mod.util.localPath({
				handle,
				target,
			}), 'utf8')).toEqual(data);
			breadcrumbs.forEach(e => {
				e = mod.util.localPath({ handle, target: e }) + '/';
				expect(JSON.parse(fs.readFileSync(mod.filesystem._metaPath(e), 'utf8')).ETag.slice(0, -5)).toEqual(fs.statSync(e).mtime.toJSON().slice(0, -5));
			});
		});

	});

	describe('get', () => {

		test('string', () => {
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
			const data = stub.buffer();
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
			const contentType = 'text/plain';
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers(contentType),
			});
			const _target = mod.util.localPath({
				handle,
				target,
			});
			const stat = fs.statSync(_target);
			expect(mod.filesystem.meta({
				handle,
				target,
			})).toEqual({
				'Content-Length': stat.size,
				'Content-Type': contentType,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('folder', () => {
			const handle = stub.ulid();

			const parent = stub.ulid();
			const breadcrumbs = [parent];

			const target = path.join(parent, stub.basename());
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.meta({
				handle,
				target: parent + '/',
			}).ETag.slice(0, -5)).toEqual(fs.statSync(mod.util.localPath({ handle, target: breadcrumbs[0] })).mtime.toJSON().slice(0, -5));
		});

	});

	describe('remove', () => {

		test('without parents', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.remove({
				handle,
				target,
				breadcrumbs: [],
			})).toBe(undefined);
			expect(fs.existsSync(mod.util.localPath({
				handle,
				target,
			}))).toBe(false);
			expect(fs.existsSync(mod.filesystem._metaPath(target))).toBe(false);
		});

		test('parents without items', () => {
			const handle = stub.ulid();
			const breadcrumbs = stub.breadcrumbs();
			const target = path.join(breadcrumbs.at(-1), stub.basename());
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			mod.filesystem.remove({
				handle,
				target,
				breadcrumbs,
			});
			expect(fs.existsSync(mod.util.localPath({
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
			const breadcrumbs = stub.breadcrumbs();
			const target = path.join(breadcrumbs.at(-1), stub.basename());
			
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			mod.filesystem.put({
				handle,
				target: path.join(breadcrumbs[0], stub.basename()),
				data: Math.random().toString(),
				breadcrumbs: breadcrumbs.slice(0, 1),
				meta: stub.headers('text/plain'),
			});
			
			const meta = mod.filesystem.meta({
				handle,
				target: breadcrumbs[0] + '/',
			});
			
			mod.filesystem.remove({
				handle,
				target,
				breadcrumbs,
			});
			expect(fs.existsSync(mod.util.localPath({
				handle,
				target,
			}))).toBe(false);
			expect(fs.existsSync(mod.filesystem._metaPath(target))).toBe(false);
			breadcrumbs.forEach((e, i) => {
				e = mod.util.localPath({ handle, target: e });
				expect(fs.existsSync(e)).toBe(i === 0);
			});
			expect(meta.ETag).not.toBe(mod.filesystem.meta({
				handle,
				target: breadcrumbs[0] + '/',
			}).ETag);
		});

	});

	describe('list', () => {

		test('file', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const contentType = 'text/plain';
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers(contentType),
			});
			const _target = mod.util.localPath({
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
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
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
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.exists({
				handle,
				target,
			})).toBe(true);
		});

		test('folder', () => {
			const parent = stub.ulid();

			const handle = stub.ulid();
			mod.filesystem.put({
				handle,
				target: path.join(parent, stub.basename()),
				data: Math.random().toString(),
				breadcrumbs: [parent],
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.exists({
				handle,
				target: parent + '/',
			})).toBe(true);
		});

		test('non-existant', () => {
			const handle = stub.ulid();

			const parent = stub.ulid();
			const breadcrumbs = [parent];

			mod.filesystem.put({
				handle,
				target: path.join(parent, stub.basename()),
				data: Math.random().toString(),
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

		describe('no meta', () => {

			test('file', () => {
				const handle = stub.ulid();
				const target = stub.basename();
				mod.filesystem.put({
					handle,
					target,
					data: Math.random().toString(),
					breadcrumbs: [],
					meta: stub.headers('text/plain'),
				});
				fs.unlinkSync(mod.util.localPath({ handle, target: mod.filesystem._metaPath(target) }));
				expect(mod.filesystem.exists({
					handle,
					target,
				})).toBe(false);
			});

			test('folder', () => {
				const parent = stub.ulid();
				const handle = stub.ulid();
				mod.filesystem.put({
					handle,
					target: path.join(parent, stub.basename()),
					data: Math.random().toString(),
					breadcrumbs: [parent],
					meta: stub.headers('text/plain'),
				});
				fs.unlinkSync(mod.util.localPath({ handle, target: mod.filesystem._metaPath(parent + '/') }));
				expect(mod.filesystem.exists({
					handle,
					target: parent + '/',
				})).toBe(false);
			});

		});

	});

	describe('isFolder', () => {

		test('file', () => {
			const handle = stub.ulid();
			const target = stub.basename();
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
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
			mod.filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(mod.filesystem.isFolder({
				handle,
				target: parent,
			})).toBe(true);
		});

	});

});

describe('hold', () => {

	test('erase', () => {
		const handle = stub.ulid();
		const target = stub.basename();
		mod.filesystem.put({
			handle,
			target,
			data: Math.random().toString(),
			breadcrumbs: [],
			meta: stub.headers('text/plain'),
		});
		expect(() => mod.hold.erase('')).toThrow('username blank');
		expect(fs.existsSync(mod.util.localPath({
			handle,
			target,
		}))).toBe(true);
		expect(mod.hold.erase(handle)).toBe(undefined);
		expect(fs.existsSync(mod.util.localPath({
			handle,
			target: '/',
		}))).toBe(false);
	});

});
