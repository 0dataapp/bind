import util from './util.js';
import path from 'path';

const mod = {

	filesystem: ({ owner, repo, token }) => ({

		async put ({ target: _path, data, meta }) {
			const content = Buffer.from(data).toString('base64');
			
			const response = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents/${ _path }`, {
			  method: 'PUT',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({
			    message: 'sync',
			    content,
			    // required to update, populated if exists via glue.remotestorage
			    sha: meta.ETag,
			  }),
			});

			const json = await response.json();

			Object.assign(meta, {
				ETag: json.content.sha,
				'Content-Length': json.content.size,
				'Last-Modified': new Date(json.commit.committer.date).toUTCString(),
			});
		},

		async _content (target) {
			const response = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents/${ target }`, {
				method: 'GET',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			    'Accept': 'application/vnd.github.object+json',
			  },
			});

			return response.json();
		},

		async get ({ target, contentType }) {
			const { content } = await this._content(target);
			const buffer = Buffer.from(content, 'base64');
			const encoding = util.encoding(contentType);
			return encoding ? buffer.toString(encoding) : buffer;
		},

		async meta ({ target: _path, isFolderRequest }) {
			if (isFolderRequest)
				return {
					ETag: (await this._content(_path)).sha,
				};

			const response = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/commits?${ new URLSearchParams({
				path: _path,
				per_page: 1,
			}) }`, {
				method: 'GET',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			  },
			});
			const commits = await response.json();
			const date = new Date(commits[0].commit.author.date);
			const { size, content, sha } = await this._content(_path);
			const buffer = Buffer.from(content, 'base64');
			return {
				ETag: sha,
				'Content-Length': size,
				'Content-Type': await util._guessType(buffer, _path),
				'Last-Modified': date.toUTCString(),
			};
		},

		async remove ({ target: _path, meta }) {
			await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents/${ _path }`, {
			  method: 'DELETE',
			  headers: {
			    'Authorization': `token ${ token }`,
			  },
			  body: JSON.stringify({
			    message: 'sync',
			    sha: meta.ETag,
			  }),
			});
		},

		async list ({ target: _path }) {
			return Promise.all((await this._content(_path)).entries.map(async e => [
				e.name + (e.type === 'dir' ? '/' : ''),
				await this.meta({
					target: e.path,
					isFolderRequest: e.type === 'dir',
				}),
			])).then(Object.fromEntries);
		},

		async exists ({ target }) {
			const response = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents/${ target }`, {
				method: 'GET',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			    'Accept': 'application/vnd.github.object+json',
			  },
			});
			return response.status === 200;
		},
};

export default mod;
