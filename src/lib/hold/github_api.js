import util from './util.js';
import path from 'path';

const mod = {

	_unquote: e => e ? e.replace(/^\"/i, '').replace(/\"$/i, '') : e,

	filesystem: ({ owner, repo, token }) => ({

		async put ({ target, data, meta }) {
			const content = Buffer.from(meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data)).toString('base64');
			
			const res = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents${ target }`, {
			  method: 'PUT',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({
			    message: 'sync',
			    content,
			    // required to update, populated if exists via glue.remotestorage
			    sha: mod._unquote(meta.ETag),
			  }),
			});

			if (![200, 201].includes(res.status))
				throw new Error('put status ' + res.status);

			const json = await res.json();

			Object.assign(meta, {
				ETag: json.content.sha,
				'Content-Length': json.content.size,
				'Last-Modified': new Date(json.commit.committer.date).toUTCString(),
			});
		},

		async _content (target) {
			const res = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents${ target }`, {
				method: 'GET',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			    'Accept': 'application/vnd.github.object+json',
			  },
			});

			return res.json();
		},

		async get ({ target, contentType }) {
			const { content } = await this._content(target);
			const buffer = Buffer.from(content, 'base64');
			const encoding = util.encoding(contentType);
			return encoding ? buffer.toString(encoding) : buffer;
		},

		async meta ({ target, isFolderRequest }) {
			const res = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents${ target }`, {
				method: 'GET',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			    'Accept': 'application/vnd.github.object+json',
			  },
			});

			if (res.status !== 200)
				return null;

			const { size, content, sha } = await res.json();

			if (isFolderRequest)
				return { ETag: sha };

			const _commits = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/commits?${ new URLSearchParams({
				path: target,
				per_page: 1,
			}) }`, {
				method: 'GET',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			  },
			});
			const commits = await _commits.json();

			const date = new Date(commits[0].commit.author.date);
			const buffer = Buffer.from(content, 'base64');
			return {
				ETag: sha,
				'Content-Length': size,
				'Content-Type': await util._guessType(buffer, target),
				'Last-Modified': date.toUTCString(),
			};
		},

		async remove ({ target, meta }) {
			const res = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents${ target }`, {
			  method: 'DELETE',
			  headers: {
			    'Authorization': `token ${ token }`,
			  },
			  body: JSON.stringify({
			    message: 'sync',
			    sha: mod._unquote(meta.ETag),
			  }),
			});

			if (res.status !== 200)
				throw new Error('delete status ' + res.status);

		},

		async list ({ target }) {
			return Promise.all((await this._content(target)).entries.map(async e => [
				e.name + (e.type === 'dir' ? '/' : ''),
				e.type === 'dir' ? {
					ETag: e.sha,
				} : await this.meta({
					target: '/' + e.path,
					isFolderRequest: e.type === 'dir',
				}),
			])).then(Object.fromEntries);
		},

		async exists ({ target }) {
			const res = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/contents${ target }`, {
				method: 'GET',
			  headers: {
			    'Authorization': `token ${ token }`,
			    'Content-Type': 'application/json',
			    'Accept': 'application/vnd.github.object+json',
			  },
			});
			return res.status === 200;
		},

		async isFolder ({ target }) {
			const res = await this._content(target);
			return res.type === 'dir';
		},

	}),

};

export default mod;
