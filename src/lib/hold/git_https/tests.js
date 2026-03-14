import { describe, test, expect, beforeAll, beforeEach } from 'vitest';
import mod from '../git_https.js';
import stub from '../../stub.js';
import util from '../util.js';
import fs from 'fs';
import path from 'path';

const testFolder = './__testing/git_https/';
const cloneURL = 'testing-repo';
const repo = `${ testFolder }${ util.hash(cloneURL) }/`;
const filesystem = mod.filesystem(cloneURL);
function resetRepo () {
	fs.rmSync(testFolder, { recursive: true, force: true });

	fs.mkdirSync(repo, { recursive: true });

	return mod.git(repo)._init();
};

mod.folder = testFolder;

describe('filesystem', () => {

	beforeAll(resetRepo);

	describe('put', () => {

		test('data', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			const encoding = 'text/plain';
			const meta = stub.headers(encoding);
			
			expect(await filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta,
			})).toBe(undefined);

			const stat = fs.statSync(filesystem._localPath(target));
			expect(meta).toEqual(Object.assign(stub.headers(encoding), {
				ETag: stat.mtime.toJSON(),
				'Content-Length': stat.size,
				'Last-Modified': stat.mtime.toUTCString(),
			}));
			expect(fs.readFileSync(filesystem._localPath(target), 'utf8')).toEqual(data);
		});

		test('subfolders', async () => {
			const length = Math.max(Date.now() % 5, 2);
			const parents = Array.from({ length }, stub.ulid).reduce((coll, item) => {
				return coll.concat(path.join(coll.at(-1) || '', item));
			}, []);
			const breadcrumbs = parents.map(e => filesystem._localPath(e));

			const target = path.join(parents.at(-1), stub.basename());
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(fs.readFileSync(filesystem._localPath(target), 'utf8')).toEqual(data);
		});

	});

	describe('delete', () => {

		test('data', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(await filesystem.delete({
				target,
				breadcrumbs: [],
			})).toBe(undefined);
			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
		});

		test('parents without items', async () => {
			const length = Math.max(Date.now() % 5, 2);
			const parents = Array.from({ length }, stub.ulid).reduce((coll, item) => {
				return coll.concat(path.join(coll.at(-1) || '', item));
			}, []);
			const breadcrumbs = parents.map(e => filesystem._localPath(e));

			const target = path.join(parents.at(-1), stub.basename());
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			await filesystem.delete({
				target,
				breadcrumbs,
			});
			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
			breadcrumbs.forEach(e => {
				expect(fs.existsSync(e)).toBe(false);
			});
		});

		test('parents with items', async () => {
			const length = Math.max(Date.now() % 5, 2);
			const parents = Array.from({ length }, stub.ulid).reduce((coll, item) => {
				return coll.concat(path.join(coll.at(-1) || '', item));
			}, []);
			const breadcrumbs = parents.map(e => filesystem._localPath(e));

			const target = path.join(parents.at(-1), stub.basename());
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			await filesystem.put({
				target: path.join(parents[0], stub.basename()),
				data: Math.random().toString(),
				breadcrumbs: breadcrumbs.slice(0, 1),
				meta: stub.headers('text/plain'),
			});
			await mod.git(repo).commit(true);
			
			const meta = await filesystem.meta({
				target: parents[0] + '/',
			});
			expect(meta.ETag).toBe((await mod.git(repo).repo.raw(...['ls-tree', '--object-only', '-d', 'HEAD', parents[0]])).trim().split('\n').pop())
			
			await filesystem.delete({
				target,
				breadcrumbs,
			});
			await mod.git(repo).commit(true);

			expect(fs.existsSync(filesystem._localPath(target))).toBe(false);
			breadcrumbs.forEach((e, i) => {
				expect(fs.existsSync(e)).toBe(i === 0);
			});

			expect(meta.ETag).not.toBe((await filesystem.meta({
				target: parents[0] + '/',
			})).ETag);
		});

	});

	describe('list', () => {

		beforeEach(resetRepo);

		test('file', async () => {
			const handle = stub.ulid();
			const target = stub.basename();
			const data = Math.random().toString();
			const encoding = 'text/plain';
			await filesystem.put({
				handle,
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers(encoding),
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
			const breadcrumbs = [parent].map(e => filesystem._localPath(e));

			const target = path.join(parent, stub.basename());
			const data = Math.random().toString();
			await filesystem.put({
				handle,
				target,
				data,
				breadcrumbs,
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
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.exists({
				target,
			})).toBe(true);
		});

		test('folder', async () => {
			const parent = stub.ulid();
			const breadcrumbs = [parent].map(e => filesystem._localPath(e));

			const target = path.join(parent, stub.basename());
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs,
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
			const breadcrumbs = [parent].map(e => filesystem._localPath(e));

			const data = Math.random().toString();
			await filesystem.put({
				target: path.join(parent, stub.basename()),
				data,
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

	});

	describe('isFolder', () => {

		test('file', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.isFolder({ target })).toBe(false);
		});

		test('folder', async () => {
			const parent = stub.ulid();
			const breadcrumbs = [parent].map(e => filesystem._localPath(e));

			const target = path.join(parent, stub.basename());
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			expect(filesystem.isFolder({
				target: parent,
			})).toBe(true);
		});

	});

	describe('get', () => {

		test('text', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			const contentType = 'text/plain';
			await filesystem.put({
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

		test('buffer', async () => {
			const target = stub.basename();
			const data = Buffer.from(Math.random().toString());
			const contentType = 'application/octet-stream';
			await filesystem.put({
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

		test('file', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			const encoding = 'text/plain';
			await filesystem.put({
				target,
				data,
				breadcrumbs: [],
				meta: stub.headers(encoding),
			});
			const _target = filesystem._localPath(target);
			const stat = fs.statSync(_target);
			expect(await filesystem.meta({ target })).toEqual({
				'Content-Length': stat.size,
				'Content-Type': encoding,
				ETag: stat.mtime.toJSON(),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		});

		test('folder', async () => {
			const parent = stub.ulid();
			const breadcrumbs = [parent].map(e => filesystem._localPath(e));

			const target = path.join(parent, stub.basename());
			const data = Math.random().toString();
			await filesystem.put({
				target,
				data,
				breadcrumbs,
				meta: stub.headers('text/plain'),
			});
			await mod.git(repo).commit(true);
			expect(await filesystem.meta({ target: parent + '/' })).toEqual({
				ETag: (await mod.git(repo).repo.raw(...['ls-tree', '--object-only', '-d', 'HEAD', parent])).trim().split('\n').pop(),
			})
		});

	});

});
