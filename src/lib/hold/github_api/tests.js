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
			const length = Math.max(Date.now() % 5, 2);
			const parents = Array.from({ length }, stub.ulid).reduce((coll, item) => {
				return coll.concat(path.join(coll.at(-1) || '', item));
			}, []);
			const target = path.join(parents.at(-1), stub.basename());

			const data = Math.random().toString();
			const encoding = 'text/plain';
			const meta = stub.headers(encoding);

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

			expect(meta).toEqual(Object.assign(stub.headers(encoding), {
				ETag: date,
				'Content-Length': size,
				'Last-Modified': new Date(date).toUTCString(),
			}));
		});

	});

});
