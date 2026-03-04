const mod = {

	repo: {

		sample: (params = {}) => {
			const login = Math.random().toString();
			const full_name = `${ login }/${ Math.random().toString() }`;
			
			return Object.assign({
				id: Date.now(),
				name: Math.random().toString(),
				full_name,
				created_at: new Date().toJSON(),
				updated_at: new Date().toJSON(),

				archived: false,
				default_branch: 'master',
				description: '',
				empty: true,
				fork: false,
				template: false,
				private: false,
				size: parseInt(Math.random().toString().slice(-5)),

				owner: {
					id: parseInt(Math.random().toString().slice(2)),

					active: false,
					created: new Date().toJSON(),
					description: '',
					email: 'me@example.com',
					followers_count: 0,
					following_count: 0,
					full_name: '',
					is_admin: false,
					language: '',
					last_login: new Date().toJSON(),
					location: '',
					login: 'me',
					login_name: '',
					prohibit_login: false,
					restricted: false,
					source_id: 0,
					starred_repos_count: 0,
					username: 'me',
					visibility: 'private',
					website: '',
				},
				
				allow_fast_forward_only_merge: true,
				allow_manual_merge: false,
				allow_merge_commits: true,
				allow_rebase: true,
				allow_rebase_explicit: true,
				allow_rebase_update: true,
				allow_squash_merge: true,
				archived_at: '1970-01-01T00:00:00Z',
				autodetect_manual_merge: false,
				default_allow_maintainer_edit: false,
				default_delete_branch_after_merge: false,
				default_merge_style: 'merge',
				description: '',
				forks_count: 0,
				has_actions: true,
				has_code: true,
				has_issues: true,
				has_packages: true,
				has_projects: true,
				has_pull_requests: true,
				has_releases: true,
				has_wiki: true,
				ignore_whitespace_conflicts: false,
				internal_tracker: {
					enable_time_tracker: true,
					allow_only_contributors_to_track_time: true,
					enable_issue_dependencies: true
				},
				internal: false,
				language: '',
				licenses: [],
				link: '',
				mirror: false,
				mirror_interval: '',
				mirror_updated: '0001-01-01T00:00:00Z',
				object_format_name: 'sha1',
				open_issues_count: 0,
				open_pr_counter: 0,
				projects_mode: 'all',
				permissions: { admin: true, push: true, pull: true },
				release_counter: 0,
				stars_count: 0,
				topics: [],
				watchers_count: 1,
				website: '',
			}, params);
		},

		private: () => mod.repo.sample({
			private: true,
		}),

	},

};

export default mod;
