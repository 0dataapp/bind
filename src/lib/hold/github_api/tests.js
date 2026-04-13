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

			const size = parseInt(Math.random().toString().slice(-2));
			const date = new Date().toJSON();
			nock('https://api.github.com')
			  .put(`/repos/${ owner }/${ repo }/contents/${ target }`)
			  .reply(201, {
			    content: { size },
			    commit: {
			      committer: { date },
			    },
			  });
			
			expect(await filesystem.put({
				target,
				data,
				meta,
			})).toBe(undefined);

			expect(meta).toEqual(Object.assign(stub.headers(contentType), {
				ETag: date,
				'Content-Length': size,
				'Last-Modified': new Date(date).toUTCString(),
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
			nock('https://api.github.com')
			  .get(`/repos/${ owner }/${ repo }/contents/${ target }`)
			  .reply(200, {
			  	sha,
			  });
			expect(await filesystem.meta({ target, isFolderRequest: true })).toEqual({
				ETag: sha,
			});
		});

	});
});
