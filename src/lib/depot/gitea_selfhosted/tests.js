import { describe, test, expect } from 'vitest';
import mod from '../gitea_selfhosted.js';
import stub from './stub.js';

describe('repos', () => {

	test('config', () => {
		const accessToken = Math.random().toString();
		expect(mod.repos.config({ accessToken })).toEqual({
			url: mod.apiURL('/user/repos'),
			headers: {
				'Authorization': 'token ' + accessToken,
			},
		});
	});

	describe('data', () => {

		test('output', ({ skip }) => {
			if (!process.env.GITEA_URL)
				return skip();

			const json = stub.repo.sample();
			const cloneURL = `${ process.env.GITEA_URL }/${ json.full_name }.git`;
			expect(mod.repos.data([json])).toEqual([{
				id: json.id.toString(),
				name: json.name,
				scopedName: json.full_name,
				isPrivate: false,
				createdAt: new Date(json.created_at),
				updatedAt: new Date(json.updated_at),
				defaultBranch: json.default_branch,
				cloneURL,
				cloneURLTemplate: decodeURI(Object.assign(new URL(cloneURL), {
					username: json.owner.username,
					password: '{token}',
				}).toString()),
				webURL: json.html_url,
				ownerId: json.owner.id.toString(),
				ownerHandle: json.owner.login.toString(),
				size: json.size,
				payload: json,
			}]);
		});

		test('private', ({ skip }) => {
			if (!process.env.GITEA_URL)
				return skip();
			
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

		test('template', () => {
			const json = stub.repo.sample({
				template: true,
			});
			expect(mod.repos.data([json])).toEqual([]);
		});		

	});

});
