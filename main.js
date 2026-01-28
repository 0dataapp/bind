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

	_relativePath: url => url.split(prefix).slice(1).join(prefix),

	async handle (req, res, next) {
		// await git.pull('origin');
		
		const isFolder = req.url.endsWith('/');
		const relativePath = mod._relativePath(req.url);
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

		if (req.method === 'GET' && !fs.existsSync(target))
			return res.status(404).send('Not found');

		if (req.method === 'PUT') {
			const folder = path.dirname(target);
			fs.mkdirSync(folder, { recursive: true });
			fs.writeFileSync(target, JSON.stringify(req.body));

			await git.add('./*')
				.commit('sync')
				// .push('origin');
		}

		const tree = Object.fromEntries((await git.raw('ls-tree', '-t', '-r', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD')).split('\n').map(e => {
			const [type, hash, size, path] = e.split(/\s+/);

			return [`/${ path }${ type === 'tree' ? '/' : '' }`, {
				type,
				hash,
				size: size === '-' ? null : parseInt(size),
			}]
		}));

		return res.set({
			'Content-Type': isFolder ? 'application/ld+json' : 'application/json',
			ETag: tree[relativePath].hash,
		}).status(200).json(isFolder ? {
			'@context': 'http://remotestorage.io/spec/folder-description',
			items: fs.readdirSync(target).reduce((coll, item) => {
				const _path = path.join(relativePath, item);
				const object = tree[Object.keys(tree).filter(e => e.match(_path)).shift()];
				
				coll[object.type === 'tree' ? `${ item }/` : item] = Object.assign(tree.type === 'tree' ? {} : {
					'Content-Length': object.size,
					'Content-Type': mime.getType(_path) || 'application/json',
				}, {
					ETag: object.hash,
				});

				return coll;
			}, {}),
		} : JSON.parse(fs.readFileSync(target, 'utf8')));
	},

};

export default mod;
