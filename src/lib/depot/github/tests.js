import { describe, test, expect } from 'vitest';
import mod from '../github.js';
import stub from './stub.js';

describe('repos', () => {

	test('config', () => {
		const token = Math.random().toString();
		expect(mod.repos.config(token)).toEqual({
			url: `${ mod._prefix }/user/repos?${ new URLSearchParams({
				sort: 'updated',
				direction: 'desc',
				per_page: 100,
			}) }`,
			headers: {
				'Authorization': 'token ' + token,
			},
		});
	});

	test('_tidy', () => {
		const json = stub.repo.sample();
		const e = mod.repos._tidy(json);
		const tidy = e => Object.fromEntries(Object.entries(e).filter(([key]) => !key.endsWith('url')))
		expect(e).toEqual(Object.assign(tidy(json), {
			owner: tidy(e.owner),
		}));
		expect(json.clone_url).not.toBeUndefined();
	});

	describe('data', () => {

		test('output', () => {
			const json = stub.repo.sample();
			expect(mod.repos.data([json])).toEqual([{
				id: json.id.toString(),
				name: json.name,
				scopedName: json.full_name,
				isPrivate: false,
				createdAt: new Date(json.created_at),
				updatedAt: new Date(json.updated_at),
				defaultBranch: json.default_branch,
				cloneURL: json.clone_url,
				cloneURLTemplate: decodeURI(Object.assign(new URL(json.clone_url), {
					username: '{token}',
					password: 'x-oauth-basic',
				}).toString()),
				webURL: json.html_url,
				ownerId: json.owner.id.toString(),
				size: json.size,
				payload: mod.repos._tidy(json),
			}]);
		});

		test('private', () => {
			const json = stub.repo.private();
			expect(mod.repos.data([json])).toMatchObject([{
				isPrivate: true,
			}]);
		});

		test('archived', () => {
			const json = stub.repo.sample({
				archived: true,
			});
			expect(mod.repos.data([json])).toEqual([]);
		});

		test('disabled', () => {
			const json = stub.repo.sample({
				disabled: true,
			});
			expect(mod.repos.data([json])).toEqual([]);
		});

		test('is_template', () => {
			const json = stub.repo.sample({
				is_template: true,
			});
			expect(mod.repos.data([json])).toEqual([]);
		});		

	});

});
