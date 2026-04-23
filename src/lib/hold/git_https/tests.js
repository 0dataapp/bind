import { describe, test, expect, beforeAll, beforeEach } from 'vitest';
import mod from '../git_https.js';
import stub from '$lib/stub.js';
import util from '../util.js';
import fs from 'fs';
import path from 'path';

const testFolder = path.join(process.cwd(), '__testing/git_https');
const cloneURL = 'testing-repo';
const repo = `${ testFolder }/${ util.hash(cloneURL) }`;
const filesystem = mod.filesystem({
	localDir: testFolder,
	cloneURL,
});
const resetRepo = () => mod.util._reset(repo);

describe('util', () => {

	describe('_gitTreePath', () => {

		test('empty', () => {
			expect(mod.util._gitTreePath('')).toEqual('./');
		});

		test('root', () => {
			expect(mod.util._gitTreePath('/')).toEqual('./');
		});

		test('with no slashes', () => {
			const e = stub.ulid();
			expect(mod.util._gitTreePath(e)).toEqual(`./${ e }`);
		});

		test('with slash after', () => {
			const e = stub.ulid();
			expect(mod.util._gitTreePath(`${ e }/`)).toEqual(`./${ e }`);
		});

	});

});

describe('filesystem', () => {

	beforeAll(resetRepo);

	test('blank', () => {
		expect(() => mod.filesystem('')).toThrow('url blank');
	});

	describe('put', () => {

		test('string', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			const contentType = 'text/plain';
			const meta = stub.headers(contentType);
			
			expect(await filesystem.put({
				target,
				data,
				meta,
			})).toBe(undefined);

			const stat = fs.statSync(filesystem._localPath(target));
			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: stat.mtime.toJSON(),
				'Content-Length': stat.size,
				'Last-Modified': stat.mtime.toUTCString(),
			}));
			expect(fs.readFileSync(filesystem._localPath(target), 'utf8')).toEqual(data);
		});

		test('blob', async () => {
			const target = stub.ulid();
			const data = stub.zip();
			const contentType = 'application/zip';
			const meta = stub.headers(contentType);
			
			expect(await filesystem.put({
				target,
				data,
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
		});

		test('subfolders', async () => {
			const target = path.join(stub.breadcrumbs().at(-1), stub.basename());
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				meta: stub.headers('text/plain'),
			});
			expect(fs.readFileSync(filesystem._localPath(target), 'utf8')).toEqual(data);
		});

	});

	describe('get', () => {

		test('string', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			const contentType = 'text/plain';
			await filesystem.put({
				target,
				data,
				meta: stub.headers(contentType),
			});
			expect(filesystem.get({
				target,
				contentType,
			})).toBe(data);
		});

		test('blob', async () => {
			const target = stub.basename();
			const data = stub.buffer();
			const contentType = 'application/octet-stream';
			await filesystem.put({
				target,
				data,
				meta: stub.headers(contentType),
			});
			expect(filesystem.get({
				target,
				contentType,
			})).toEqual(data);
		});

	});

	describe('meta', () => {

		test('non-existant', async () => {
			expect(await filesystem.meta({ target: stub.random() })).toEqual(null);
		});

		test('file', async () => {
			const target = stub.basename();
			const contentType = 'text/plain';
			await filesystem.put({
				target,
				data: Math.random().toString(),
				meta: stub.headers(contentType),
			});
			const _target = filesystem._localPath(target);
			const stat = fs.statSync(_target);
			expect(await filesystem.meta({ target })).toEqual({
				'Content-Length': stat.size,
				'Content-Type': contentType,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('folder', async () => {
			const parent = stub.ulid();

			const target = path.join(parent, stub.basename());
			await filesystem.put({
				target,
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			await mod.git(repo).commit(true);
			expect(await filesystem.meta({ target: parent + '/' })).toEqual({
				ETag: (await mod.git(repo).repo.raw('ls-tree', '--object-only', '-d', 'HEAD', parent)).trim().split('\n').pop(),
			});
		});

	});

	describe('remove', () => {

		test('without parents', async () => {
			const target = stub.basename();
			await filesystem.put({
				target,
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			expect(await filesystem.remove({
				target,
				breadcrumbs: [],
			})).toBe(undefined);
			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
		});

		test('parents without items', async () => {
			const breadcrumbs = stub.breadcrumbs();
			const target = path.join(breadcrumbs.at(-1), stub.basename());
			await filesystem.put({
				target,
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			await filesystem.remove({
				target,
				breadcrumbs,
			});
			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
			breadcrumbs.forEach(e => {
				expect(fs.existsSync(filesystem._localPath(e))).toBe(false);
			});
		});

		test('parents with items', async () => {
			const breadcrumbs = stub.breadcrumbs();
			const target = path.join(breadcrumbs.at(-1), stub.basename());
			await filesystem.put({
				target,
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			await filesystem.put({
				target: path.join(breadcrumbs[0], stub.basename()),
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			await mod.git(repo).commit(true);
			
			const meta = await filesystem.meta({
				target: breadcrumbs[0] + '/',
			});
			expect(meta.ETag).toBe((await mod.git(repo).repo.raw('ls-tree', '--object-only', '-d', 'HEAD', breadcrumbs[0])).trim().split('\n').pop())
			
			await filesystem.remove({
				target,
				breadcrumbs,
			});
			await mod.git(repo).commit(true);

			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
			breadcrumbs.forEach((e, i) => {
				expect(fs.existsSync(filesystem._localPath(e))).toBe(i === 0);
			});

			expect(meta.ETag).not.toBe((await filesystem.meta({
				target: breadcrumbs[0] + '/',
			})).ETag);
		});

	});

	describe('list', () => {

		beforeEach(resetRepo);

		test('file', async () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const contentType = 'text/plain';
			await filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				meta: stub.headers(contentType),
			});
			await mod.git(repo).commit(true);
			const _target = filesystem._localPath(target);
			const stat = fs.statSync(_target);
			expect(await filesystem.list({
				handle,
				target: '/',
			})).toEqual({
				[target]: await filesystem.meta({
					handle,
					target,
				}),
			});
		});

		test('folder', async () => {
			const handle = stub.ulid();

			const parent = stub.ulid();

			const target = path.join(parent, stub.basename());
			await filesystem.put({
				handle,
				target,
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			await mod.git(repo).commit(true);
			expect(await filesystem.list({
				handle,
				target: '/',
			})).toEqual({
				[parent + '/']: await filesystem.meta({
					handle,
					target: parent + '/',
				}),
			});
		});

	});

	describe('exists', () => {

		test('file', async () => {
			const target = stub.basename();
			await filesystem.put({
				target,
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.exists({
				target,
			})).toBe(true);
		});

		test('folder', async () => {
			const parent = stub.ulid();
			
			const target = path.join(parent, stub.basename());
			await filesystem.put({
				target,
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.exists({
				target: parent,
			})).toBe(true);
			expect(filesystem.exists({
				target: parent + '/',
			})).toBe(true);
		});

		test('non-existant', async () => {
			const parent = stub.ulid();

			await filesystem.put({
				target: path.join(parent, stub.basename()),
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.exists({
				target: path.join(parent, stub.basename()),
			})).toBe(false);
			expect(filesystem.exists({
				target: path.join(parent, `${ stub.basename() }/`),
			})).toBe(false);
		});

	});

	describe('isFolder', () => {

		test('file', async () => {
			const target = stub.basename();
			await filesystem.put({
				target,
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.isFolder({ target })).toBe(false);
		});

		test('folder', async () => {
			const target = stub.ulid();
			await filesystem.put({
				target: path.join(target, stub.basename()),
				data: Math.random().toString(),
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.isFolder({ target })).toBe(true);
		});

	});

	test('erase', async () => {
		const target = stub.basename();
		await filesystem.put({
			target,
			data: Math.random().toString(),
			meta: stub.headers('text/plain'),
		});
		expect(fs.existsSync(filesystem._localPath(target))).toBe(true);
		expect(filesystem.erase(cloneURL)).toBe(undefined);
		expect(fs.existsSync(filesystem._localPath('/'))).toBe(false);
	});

});
