import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { simpleGit, CleanOptions } from 'simple-git';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'data');
const git = simpleGit(dataPath, {
	maxConcurrentProcesses: 10,
	trimmed: true,
}).clean(CleanOptions.FORCE);

const prefix = '/storage';

const mod = {

	_relativePath: (url, prefix) => url.split(prefix).slice(1).join(prefix),

	async handle (req, res, next) {
		// await git.pull('origin');
		const isFolder = req.url.endsWith('/');
		const relativePath = mod._relativePath(req.url, prefix);
		const target = path.join(dataPath, relativePath);

		if (req.url.toLowerCase().match('/.well-known/webfinger'))
			return res.json({
				links: [{
					rel: 'remotestorage',
					href: req.protocol + '://' + req.get('host') + prefix,
					type: 'draft-dejong-remotestorage-02',
				}],
			});

		if (!req.headers.authorization)
			return res.status(401).send('Unauthorized');

		if (['GET', 'HEAD'].includes(req.method) && !fs.existsSync(target))
			return res.status(404).send('Not found');

		if (req.method === 'PUT') {
			const folder = path.dirname(target);
			fs.mkdirSync(folder, { recursive: true });
			fs.writeFileSync(target, JSON.stringify(req.body));

			await git.add('./*')
				.commit('sync')
				// .push('origin');
		}

		const gitPath = `.${ relativePath }`;
		const etag = (await git.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', gitPath))).trim().split('\n').shift();

		if (req.method === 'DELETE') {
			fs.unlinkSync(target);

			await git.add('./*')
				.commit('sync')
				// .push('origin');

			return res.set({
				ETag: etag,
			}).status(200).send('OK');
		}

		res.set({
			'Content-Type': isFolder ? 'application/ld+json' : 'application/json',
			ETag: etag,
		}).status(200);

		if (!isFolder)
			return res.json(JSON.parse(fs.readFileSync(target, 'utf8')));

		return res.json({
			'@context': 'http://remotestorage.io/spec/folder-description',
			items: (await git.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', gitPath)).trim().split('\n').map(e => {
				const [type, hash, size, path] = e.split(/\s+/);
				return {
					name: type === 'tree' ? `${ path }/` : path,
					type,
					hash,
					size: size === '-' ? null : parseInt(size),
				};
			}).reduce((coll, item) => {
				const _path = path.join(relativePath, item.name);
				coll[mod._relativePath(item.name, relativePath.slice(1))] = Object.assign(item.type === 'tree' ? {} : {
					'Content-Length': item.size,
					'Content-Type': mime.getType(_path) || 'application/json',
				}, {
					ETag: item.hash,
				});

				return coll;
			}, {}),
		});
	},

};

export default mod;
