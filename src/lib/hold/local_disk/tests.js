import { describe, test, expect, beforeAll, beforeEach } from 'vitest';
import mod from '../local_disk.js';
import stub from '$lib/stub.js';
import fs from 'fs';
import path from 'path';

const testFolder = './__testing/local_disk';
mod.folder = testFolder;

const handle = stub.ulid()
const filesystem = mod.filesystem(handle);

describe('filesystem', () => {

	beforeAll(() => fs.rmSync(testFolder, { recursive: true, force: true }));
	
	beforeEach(() => fs.rmSync(filesystem._localPath('/'), { recursive: true, force: true }));

	test('blank', () => {
		expect(() => mod.filesystem('')).toThrow('username blank');
	});

	describe('put', () => {

		test('string', () => {
			const target = stub.basename();
			const data = Math.random().toString();
			const contentType = 'text/plain';
			const meta = stub.headers(contentType);

			expect(filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta,
			})).toBe(undefined);

			const _target = filesystem._localPath(target);
			const stat = fs.statSync(_target);
			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: stat.mtime.toJSON(),
				'Content-Length': stat.size,
				'Last-Modified': stat.mtime.toUTCString(),
			}));
			expect(fs.readFileSync(_target, 'utf8')).toEqual(data);
			expect(JSON.parse(fs.readFileSync(filesystem._metaPath(_target), 'utf8'))).toEqual({
				'Content-Length': stat.size,
				'Content-Type': contentType,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('blob', () => {
			const target = stub.basename();
			const data = stub.buffer();
			const contentType = 'application/octet-stream';
			const meta = stub.headers(contentType);

			expect(filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta,
			})).toBe(undefined);

			const _target = filesystem._localPath(target);
			const stat = fs.statSync(_target);
			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: stat.mtime.toJSON(),
				'Content-Length': stat.size,
				'Last-Modified': stat.mtime.toUTCString(),
			}));
			expect(fs.readFileSync(_target)).toEqual(data);
			expect(JSON.parse(fs.readFileSync(filesystem._metaPath(_target), 'utf8'))).toEqual({
				'Content-Length': stat.size,
				'Content-Type': contentType,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('subfolders', () => {
			const breadcrumbs = stub.breadcrumbs();
			const target = path.join(breadcrumbs.at(-1), stub.basename());
			const data = Math.random().toString();
			filesystem.put({
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(fs.readFileSync(filesystem._localPath(target), 'utf8')).toEqual(data);
			breadcrumbs.forEach(e => {
				e = filesystem._localPath(e) + '/';
				expect(JSON.parse(fs.readFileSync(filesystem._metaPath(e), 'utf8')).ETag.slice(0, -5)).toEqual(fs.statSync(e).mtime.toJSON().slice(0, -5));
			});
		});

	});

	describe('get', () => {

		test('string', () => {
			const target = stub.basename();
			const data = Math.random().toString();
			const contentType = 'text/plain';
			filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers(contentType),
			});
			expect(filesystem.get({
				target,
				contentType,
			})).toBe(data);
		});

		test('blob', () => {
			const target = stub.basename();
			const data = stub.buffer();
			const contentType = 'application/octet-stream';
			filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers(contentType),
			});
			expect(filesystem.get({
				target,
				contentType,
			})).toEqual(data);
		});

	});

	describe('meta', () => {

		test('non-existant', () => {
			expect(filesystem.meta({ target: stub.random() })).toEqual(null);
		});

		test('file', () => {
			const target = stub.basename();
			const contentType = 'text/plain';
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers(contentType),
			});
			const _target = filesystem._localPath(target);
			const stat = fs.statSync(_target);
			expect(filesystem.meta({ target })).toEqual({
				'Content-Length': stat.size,
				'Content-Type': contentType,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('folder', () => {
			const parent = stub.ulid();
			const breadcrumbs = [parent];

			const target = path.join(parent, stub.basename());
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.meta({
				target: parent + '/',
			}).ETag.slice(0, -5)).toEqual(fs.statSync(filesystem._localPath(breadcrumbs[0])).mtime.toJSON().slice(0, -5));
		});

	});

	describe('remove', () => {

		test('without parents', () => {
			const target = stub.basename();
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.remove({
				target,
				breadcrumbs: [],
			})).toBe(undefined);
			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
			expect(fs.existsSync(filesystem._metaPath(target))).toBe(false);
		});

		test('parents without items', () => {
			const breadcrumbs = stub.breadcrumbs();
			const target = path.join(breadcrumbs.at(-1), stub.basename());
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			filesystem.remove({
				target,
				breadcrumbs,
			});
			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
			expect(fs.existsSync(filesystem._metaPath(target))).toBe(false);
			breadcrumbs.forEach(e => {
				expect(fs.existsSync(e)).toBe(false);
			});
		});

		test('parents with items', () => {
			const breadcrumbs = stub.breadcrumbs();
			const target = path.join(breadcrumbs.at(-1), stub.basename());
			
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			filesystem.put({
				target: path.join(breadcrumbs[0], stub.basename()),
				data: Math.random().toString(),
				breadcrumbs: breadcrumbs.slice(0, 1),
				meta: stub.headers('text/plain'),
			});
			
			const meta = filesystem.meta({
				target: breadcrumbs[0] + '/',
			});
			
			filesystem.remove({
				target,
				breadcrumbs,
			});
			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
			expect(fs.existsSync(filesystem._metaPath(target))).toBe(false);
			breadcrumbs.forEach((e, i) => {
				e = filesystem._localPath(e);
				expect(fs.existsSync(e)).toBe(i === 0);
			});
			expect(meta.ETag).not.toBe(filesystem.meta({
				target: breadcrumbs[0] + '/',
			}).ETag);
		});

	});

	describe('list', () => {

		test('file', () => {
			const target = stub.basename();
			const contentType = 'text/plain';
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers(contentType),
			});
			const _target = filesystem._localPath(target);
			const stat = fs.statSync(_target);
			expect(filesystem.list({ target: '/' })).toEqual({
				[target]: filesystem.meta({ target }),
			});
		});

		test('folder', () => {
			const parent = stub.ulid();
			const target = path.join(parent, stub.basename());
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs: [parent],
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.list({ target: '/' })).toEqual({
				[parent + '/']: filesystem.meta({
					target: parent + '/',
				}),
			});
		});

	});

	describe('exists', () => {

		test('file', () => {
			const target = stub.basename();
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.exists({ target })).toBe(true);
		});

		test('folder', () => {
			const parent = stub.ulid();
			filesystem.put({
				target: path.join(parent, stub.basename()),
				data: Math.random().toString(),
				breadcrumbs: [parent],
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.exists({
				target: parent + '/',
			})).toBe(true);
		});

		test('non-existant', () => {
			const parent = stub.ulid();
			const breadcrumbs = [parent];

			filesystem.put({
				target: path.join(parent, stub.basename()),
				data: Math.random().toString(),
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.exists({
				target: path.join(parent, stub.basename()),
			})).toBe(false);
			expect(filesystem.exists({
				target: path.join(parent, `${ stub.basename() }/`),
			})).toBe(false);
		});

		describe('no meta', () => {

			test('file', () => {
				const target = stub.basename();
				filesystem.put({
					target,
					data: Math.random().toString(),
					breadcrumbs: [],
					meta: stub.headers('text/plain'),
				});
				fs.unlinkSync(filesystem._localPath(filesystem._metaPath(target)));
				expect(filesystem.exists({ target })).toBe(false);
			});

			test('folder', () => {
				const parent = stub.ulid();
				filesystem.put({
					target: path.join(parent, stub.basename()),
					data: Math.random().toString(),
					breadcrumbs: [parent],
					meta: stub.headers('text/plain'),
				});
				fs.unlinkSync(filesystem._localPath(filesystem._metaPath(parent + '/')));
				expect(filesystem.exists({
					target: parent + '/',
				})).toBe(false);
			});

		});

	});

	describe('isFolder', () => {

		test('file', () => {
			const target = stub.basename();
			filesystem.put({
				target,
				data: Math.random().toString(),
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.isFolder({ target })).toBe(false);
		});

		test('folder', () => {
			const target = stub.ulid();
			filesystem.put({
				target: path.join(target, stub.basename()),
				data: Math.random().toString(),
				breadcrumbs: [target],
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.isFolder({ target })).toBe(true);
		});

	});

	test('erase', () => {
		const target = stub.basename();
		filesystem.put({
			target,
			data: Math.random().toString(),
			breadcrumbs: [],
			meta: stub.headers('text/plain'),
		});
		expect(fs.existsSync(filesystem._localPath(target))).toBe(true);
		expect(filesystem.erase()).toBe(undefined);
		expect(fs.existsSync(filesystem._localPath('/'))).toBe(false);
	});

});
