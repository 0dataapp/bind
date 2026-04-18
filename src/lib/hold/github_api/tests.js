import { describe, test, expect } from 'vitest';
import mod from '../github_api.js';
import nock from 'nock';
import path from 'path';
import stub from '$lib/stub.js';

const owner = Math.random().toString();
const repo = Math.random().toString();
const filesystem = mod.filesystem({ owner, repo });

describe('_unquote', () => {

	test('no quotes', () => {
		const e = Math.random().toString();
		expect(mod._unquote(e)).toBe(e);
	});

	test('single quotes', () => {
		const e = `'${ Math.random().toString() }'`;
		expect(mod._unquote(e)).toBe(e);
	});

	test('double quotes', () => {
		const e = Math.random().toString();
		expect(mod._unquote(`"${ e }"`)).toBe(e);
	});

	test('not set', () => {
		expect(mod._unquote(undefined)).toBe(undefined);
		expect(mod._unquote(null)).toBe(null);
	});

});

describe('filesystem', () => {

	describe('put', () => {

		test('string', async () => {
			const target = path.join(stub.breadcrumbs().at(-1), stub.basename());
			const data = Math.random().toString();
			const contentType = 'text/plain';
			const meta = stub.headers(contentType);

			const sha = stub.ulid();
			const size = stub.size();
			const date = new Date();
			nock('https://api.github.com')
			  .put(`/repos/${ owner }/${ repo }/contents${ target }`, body => {
			  	expect(body).toEqual({
			  		message: 'sync',
			  		content: Buffer.from(data).toString('base64'),
			  	});
			  	return true;
			  })
			  .reply(201, {
			    content: { sha, size },
			    commit: {
			      committer: { date: date.toJSON() },
			    },
			  });
			
			expect(await filesystem.put({
				target,
				data,
				meta,
			})).toBe(undefined);

			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: sha,
				'Content-Length': size,
				// 'Last-Modified': date.toUTCString(),
			}));
		});

		test('blob', async () => {
			const target = path.join(stub.breadcrumbs().at(-1), stub.basename());
			const data = stub.buffer();
			const contentType = 'application/octet-stream';
			const meta = stub.headers(contentType);

			const sha = stub.ulid();
			const size = stub.size();
			const date = new Date();
			nock('https://api.github.com')
			  .put(`/repos/${ owner }/${ repo }/contents${ target }`, body => {
			  	expect(body).toEqual({
			  		message: 'sync',
			  		content: data.toString('base64'),
			  	});
			  	return true;
			  })
			  .reply(201, {
			    content: { sha, size },
			    commit: {
			      committer: { date: date.toJSON() },
			    },
			  });
			
			expect(await filesystem.put({
				target,
				data,
				meta,
			})).toBe(undefined);

			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: sha,
				'Content-Length': size,
				// 'Last-Modified': date.toUTCString(),
			}));
		});

		test('ETag', async () => {
			const target = path.join(stub.breadcrumbs().at(-1), stub.basename());
			const data = Math.random().toString();
			const contentType = 'text/plain';
			const ETag = stub.ulid();
			const meta = Object.assign(stub.headers(contentType), { ETag });

			const sha = stub.ulid();
			const size = stub.size();
			const date = new Date();
			nock('https://api.github.com')
			  .put(`/repos/${ owner }/${ repo }/contents${ target }`, body => {
			  	expect(body.sha).toBe(ETag);
			  	return true;
			  })
			  .reply(201, {
			    content: { sha, size },
			    commit: {
			      committer: { date: date.toJSON() },
			    },
			  });
			
			expect(await filesystem.put({
				target,
				data,
				meta,
			})).toBe(undefined);

			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: sha,
				'Content-Length': size,
				// 'Last-Modified': date.toUTCString(),
			}));
		});

	});

	describe('get', () => {

		test('string', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents${ target }`)
			  .reply(200, {
					content: Buffer.from(data).toString('base64'),
				});
			expect(await filesystem.get({
				target,
				contentType: 'text/plain',
			})).toBe(data);
		});

		test('blob', async () => {
			const target = stub.basename();
			const data = stub.buffer();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents${ target }`)
			  .reply(200, {
					content: data.toString('base64'),
				});
			expect(await filesystem.get({
				target,
				contentType: 'application/octet-stream',
			})).toEqual(data);
		});

	});

	describe('meta', () => {

		test('file', async () => {
			const target = stub.basename();
			const size = stub.size();
			const date = new Date();
			const sha = stub.ulid();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/commits?${ new URLSearchParams({
				path: target,
				per_page: 1,
			}) }`)
			  .reply(200, [{
			  	commit: {
			  		author: { date: date.toJSON() },
			  	},
			  }]);
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents${ target }`)
			  .reply(200, {
				  size,
				  content: stub.buffer().toString('base64'),
				  sha,
				});
			expect(await filesystem.meta({
				target,
			})).toEqual({
				'Content-Length': size,
				'Content-Type': 'text/plain',
				ETag: sha,
				// 'Last-Modified': date.toUTCString(),
			});
		});

		test('folder', async () => {
			const target = stub.ulid();
			const sha = stub.ulid();
			nock('https://api.github.com', {
				reqheaders: {
					'Accept': 'application/vnd.github.object+json',
				},
			})
			  .get(`/repos/${ owner }/${ repo }/contents${ target }`)
			  .reply(200, {
			  	sha,
			  });
			expect(await filesystem.meta({ target, isFolderRequest: true })).toEqual({
				ETag: sha,
			});
		});

	});

	test('remove', async () => {
		const target = path.join(stub.breadcrumbs().at(-1), stub.basename());
		const ETag = stub.ulid();
		const meta = Object.assign(stub.headers('text/plain'), { ETag });
		const sha = stub.ulid();
		nock('https://api.github.com')
		  .delete(`/repos/${ owner }/${ repo }/contents${ target }`, body => {
		  	expect(body).toEqual({
		  		message: 'sync',
		  		sha: ETag,
		  	});
		  	return true;
		  })
		  .reply(200, {
		    content: null,
		  });
		expect(await filesystem.remove({
			target,
			breadcrumbs: [],
			meta,
		})).toBe(undefined);
	});

	describe('list', () => {

		test('file', async () => {
			const folder = stub.ulid();
			const basename = stub.basename();
			const target = path.join(folder, basename);
			nock('https://api.github.com', {
				reqheaders: {
					'Accept': 'application/vnd.github.object+json',
				},
			})
			  .get(`/repos/${ owner }/${ repo }/contents${ folder }`)
			  .reply(200, {
			  	entries: [{
			  		name: basename,
			  		path: target,
			  		type: 'file',
			  	}],
			  });
			const scope = nock('https://api.github.com')
				.persist()
			//   .get(`/repos/${ owner }/${ repo }/commits?${ new URLSearchParams({
			// 	path: '/' + target,
			// 	per_page: 1,
			// }) }`)
			//   .reply(200, [{
			//   	commit: {
			//   		author: { date: new Date().toJSON() },
			//   	},
			//   }])
			  .get(`/repos/${ owner }/${ repo }/contents/${ target }`)
			  .reply(200, {
				  size: stub.size(),
				  content: stub.buffer().toString('base64'),
				  sha: stub.ulid(),
				});
			expect(await filesystem.list({ target: folder })).toEqual({
				[basename]: await filesystem.meta({
					target: '/' + target,
				}),
			});
			expect(scope.isDone()).toBe(true);
			scope.persist(false);
		});

		test('folder', async () => {
			const folder = stub.ulid();
			const basename = stub.ulid();
			const target = path.join(folder, basename);
			const sha = stub.ulid();
			nock('https://api.github.com', {
				reqheaders: {
					'Accept': 'application/vnd.github.object+json',
				},
			})
			  .get(`/repos/${ owner }/${ repo }/contents${ folder }`)
			  .reply(200, {
			  	entries: [{
			  		name: basename,
			  		sha,
			  		path: target,
			  		type: 'dir',
			  	}],
			  });
			expect(await filesystem.list({ target: folder })).toEqual({
				[basename + '/']: {
					ETag: sha,
				},
			});
		});

	});

	describe('exists', () => {

		test('existant', async () => {
			const target = stub.basename();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents${ target }`)
			  .reply(200, {
					content: Buffer.from(Math.random().toString()).toString('base64'),
				});
			expect(await filesystem.exists({
				target
			})).toBe(true);
		});

		test('non-existant', async () => {
			const target = stub.basename();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents${ target }`)
			  .reply(404, {
					content: Buffer.from(Math.random().toString()).toString('base64'),
				});
			expect(await filesystem.exists({
				target
			})).toBe(false);
		});

	});

	describe('isFolder', () => {

		test('file', async () => {
			const target = stub.basename();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents${ target }`)
			  .reply(200, {
					type: 'file',
				});
			expect(await filesystem.isFolder({ target })).toBe(false);
		});

		test('folder', async () => {
			const target = stub.basename();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents${ target }`)
			  .reply(200, {
					type: 'dir',
				});
			expect(await filesystem.isFolder({ target })).toBe(true);
		});

	});

});
