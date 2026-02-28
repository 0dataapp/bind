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
				webURL: json.html_url,
				ownerId: json.owner.id.toString(),
				payload: json,
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
