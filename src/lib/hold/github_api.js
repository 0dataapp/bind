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

};

export default mod;
