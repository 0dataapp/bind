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
			  }),
			});

			const json = await response.json();

			Object.assign(meta, {
				ETag: json.commit.committer.date,
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
};

export default mod;
