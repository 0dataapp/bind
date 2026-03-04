const mod = {

	_randomItem () {
		const array = [].concat(...arguments);
		return array[Date.now() % array.length];
	},

	repo: {

		sample: (params = {}) => {
			const login = Math.random().toString();
			const full_name = `${ login }/${ Math.random().toString() }`;
			const id = parseInt(Math.random().toString().slice(2));
							
			return Object.assign({
				id: Date.now(),
				name: Math.random().toString(),
				full_name,
				created_at: new Date().toJSON(),
				updated_at: new Date().toJSON(),
				
				archived: false,
				clone_url: `https://github.com/${ full_name }.git`,
				default_branch: 'main',
				description: null,
				disabled: false,
				fork: false,
				html_url: `https://github.com/${ full_name }`,
				is_template: false,
				private: false,
				size: parseInt(Math.random().toString().slice(-5)),
				visibility: 'public',
				web_commit_signoff_required: false,

				owner: {
					id,
					type: mod._randomItem('User', 'Organization'),

					avatar_url: `https://avatars.githubusercontent.com/u/${ id }?v=4`,
					events_url: `https://api.github.com/users/${ login }/events{/privacy}`,
					followers_url: `https://api.github.com/users/${ login }/followers`,
					following_url: `https://api.github.com/users/${ login }/following{/other_user}`,
					gists_url: `https://api.github.com/users/${ login }/gists{/gist_id}`,
					gravatar_id: '',
					html_url: `https://github.com/${ login }`,
					login,
					node_id: Math.random().toString(),
					organizations_url: `https://api.github.com/users/${ login }/orgs`,
					received_events_url: `https://api.github.com/users/${ login }/received_events`,
					repos_url: `https://api.github.com/users/${ login }/repos`,
					site_admin: false,
					starred_url: `https://api.github.com/users/${ login }/starred{/owner}{/repo}`,
					subscriptions_url: `https://api.github.com/users/${ login }/subscriptions`,
					url: `https://api.github.com/users/${ login }`,
					user_view_type: 'public',
				},

				allow_forking: true,
				archive_url: `https://api.github.com/repos/${ full_name }/{archive_format}{/ref}`,
				assignees_url: `https://api.github.com/repos/${ full_name }/assignees{/user}`,
				blobs_url: `https://api.github.com/repos/${ full_name }/git/blobs{/sha}`,
				branches_url: `https://api.github.com/repos/${ full_name }/branches{/branch}`,
				collaborators_url: `https://api.github.com/repos/${ full_name }/collaborators{/collaborator}`,
				comments_url: `https://api.github.com/repos/${ full_name }/comments{/number}`,
				commits_url: `https://api.github.com/repos/${ full_name }/commits{/sha}`,
				compare_url: `https://api.github.com/repos/${ full_name }/compare/{base}...{head}`,
				contents_url: `https://api.github.com/repos/${ full_name }/contents/{+path}`,
				contributors_url: `https://api.github.com/repos/${ full_name }/contributors`,
				deployments_url: `https://api.github.com/repos/${ full_name }/deployments`,
				downloads_url: `https://api.github.com/repos/${ full_name }/downloads`,
				events_url: `https://api.github.com/repos/${ full_name }/events`,
				forks: 0,
				forks_count: 0,
				forks_url: `https://api.github.com/repos/${ full_name }/forks`,
				git_commits_url: `https://api.github.com/repos/${ full_name }/git/commits{/sha}`,
				git_refs_url: `https://api.github.com/repos/${ full_name }/git/refs{/sha}`,
				git_tags_url: `https://api.github.com/repos/${ full_name }/git/tags{/sha}`,
				git_url: `git://github.com/${ full_name }.git`,
				has_discussions: false,
				has_downloads: true,
				has_issues: true,
				has_pages: false,
				has_projects: true,
				has_pull_requests: true,
				has_wiki: true,
				homepage: null,
				hooks_url: `https://api.github.com/repos/${ full_name }/hooks`,
				issue_comment_url: `https://api.github.com/repos/${ full_name }/issues/comments{/number}`,
				issue_events_url: `https://api.github.com/repos/${ full_name }/issues/events{/number}`,
				issues_url: `https://api.github.com/repos/${ full_name }/issues{/number}`,
				keys_url: `https://api.github.com/repos/${ full_name }/keys{/key_id}`,
				labels_url: `https://api.github.com/repos/${ full_name }/labels{/name}`,
				language: null,
				languages_url: `https://api.github.com/repos/${ full_name }/languages`,
				license: null,
				merges_url: `https://api.github.com/repos/${ full_name }/merges`,
				milestones_url: `https://api.github.com/repos/${ full_name }/milestones{/number}`,
				mirror_url: null,
				node_id: Math.random().toString(),
				notifications_url: `https://api.github.com/repos/${ full_name }/notifications{?since,all,participating}`,
				open_issues: 0,
				open_issues_count: 0,
				permissions: {
					admin: true,
					maintain: true,
					push: true,
					triage: true,
					pull: true
				},
				pull_request_creation_policy: 'all',
				pulls_url: `https://api.github.com/repos/${ full_name }/pulls{/number}`,
				pushed_at: new Date().toJSON(),
				releases_url: `https://api.github.com/repos/${ full_name }/releases{/id}`,
				ssh_url: `git@github.com:${ full_name }.git`,
				stargazers_count: 0,
				stargazers_url: `https://api.github.com/repos/${ full_name }/stargazers`,
				statuses_url: `https://api.github.com/repos/${ full_name }/statuses/{sha}`,
				subscribers_url: `https://api.github.com/repos/${ full_name }/subscribers`,
				subscription_url: `https://api.github.com/repos/${ full_name }/subscription`,
				svn_url: `https://github.com/${ full_name }`,
				tags_url: `https://api.github.com/repos/${ full_name }/tags`,
				teams_url: `https://api.github.com/repos/${ full_name }/teams`,
				topics: [],
				trees_url: `https://api.github.com/repos/${ full_name }/git/trees{/sha}`,
				url: `https://api.github.com/repos/${ full_name }`,
				watchers: 0,
				watchers_count: 0,
			}, params);
		},

		private: () => mod.repo.sample(mod._randomItem({
			visibility: 'private',
		}, {
			private: true,
		})),

	},

};

export default mod;