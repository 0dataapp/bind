import { describe, test, expect } from 'vitest';
import mod from '../github_api.js';
import nock from 'nock';
import path from 'path';
import stub from '../../stub.js';

const owner = Math.random().toString();
const repo = Math.random().toString();
const filesystem = mod.filesystem({ owner, repo });

describe('filesystem', () => {

	describe('put', () => {

		test('string', async () => {
			const target = path.join(stub.breadcrumbs().at(-1), stub.basename());
			const data = Math.random().toString();
			const contentType = 'text/plain';
			const meta = stub.headers(contentType);

			const sha = stub.ulid();
			const size = parseInt(Math.random().toString().slice(-2));
			const date = new Date();
			nock('https://api.github.com')
			  .put(`/repos/${ owner }/${ repo }/contents/${ target }`, body => {
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
				'Last-Modified': date.toUTCString(),
			}));
		});

		test('ETag', async () => {
			const target = path.join(stub.breadcrumbs().at(-1), stub.basename());
			const data = Math.random().toString();
			const contentType = 'text/plain';
			const ETag = stub.ulid();
			const meta = Object.assign(stub.headers(contentType), { ETag });

			const sha = stub.ulid();
			const size = parseInt(Math.random().toString().slice(-2));
			const date = new Date();
			nock('https://api.github.com')
			  .put(`/repos/${ owner }/${ repo }/contents/${ target }`, body => {
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
				'Last-Modified': date.toUTCString(),
			}));
		});

	});

	describe('get', () => {

		test('string', async () => {
			const target = stub.basename();
			const data = Math.random().toString();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents/${ target }`)
			  .reply(200, {
					content: Buffer.from(data).toString('base64'),
				});
			expect(await filesystem.get({
				target,
				contentType: 'text/plain',
			})).toBe(data);
		});

		test('buffer', async () => {
			const target = stub.basename();
			const data = stub.buffer();
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents/${ target }`)
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
			const size = parseInt(Math.random().toString().slice(-2));
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
			  .get(`/repos/${ owner }/${ repo }/contents/${ target }`)
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
				'Last-Modified': date.toUTCString(),
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
			  .get(`/repos/${ owner }/${ repo }/contents/${ target }`)
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
		  .delete(`/repos/${ owner }/${ repo }/contents/${ target }`, body => {
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
			  .get(`/repos/${ owner }/${ repo }/contents/${ folder }`)
			  .reply(200, {
			  	entries: [{
			  		name: basename,
			  		path: target,
			  		type: 'file',
			  	}],
			  });
			const scope = nock('https://api.github.com')
				.persist()
			  .get(`/repos/${ owner }/${ repo }/commits?${ new URLSearchParams({
				path: target,
				per_page: 1,
			}) }`)
			  .reply(200, [{
			  	commit: {
			  		author: { date: new Date().toJSON() },
			  	},
			  }])
			  .get(`/repos/${ owner }/${ repo }/contents/${ target }`)
			  .reply(200, {
				  size: parseInt(Math.random().toString().slice(-2)),
				  content: stub.buffer().toString('base64'),
				  sha: stub.ulid(),
				});
			expect(await filesystem.list({ target: folder })).toEqual({
				[basename]: await filesystem.meta({
					target,
				}),
			});
			expect(scope.isDone()).toBe(true);
			scope.persist(false);
		});

		test('folder', async () => {
			const folder = stub.ulid();
			const basename = stub.ulid();
			const target = path.join(folder, basename);
			nock('https://api.github.com', {
				reqheaders: {
					'Accept': 'application/vnd.github.object+json',
				},
			})
			  .get(`/repos/${ owner }/${ repo }/contents/${ folder }`)
			  .reply(200, {
			  	entries: [{
			  		name: basename,
			  		path: target,
			  		type: 'folder',
			  	}],
			  });
			const scope = nock('https://api.github.com', {
				reqheaders: {
					'Accept': 'application/vnd.github.object+json',
				},
			})
				.persist()
			  .get(`/repos/${ owner }/${ repo }/contents/${ target }`)
			  .reply(200, {
				  sha: stub.ulid(),
				});
			expect(await filesystem.list({ target: folder })).toEqual({
				[basename + '/']: await filesystem.meta({
					target,
					isFolderRequest: true,
				}),
			});
		});

	});
});
