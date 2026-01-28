import fs from 'fs';
import path from 'path';
import mime from 'mime';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mod = {

	handle (req, res, next) {
		const prefix = '/storage';
		const isFolder = req.url.endsWith('/');
		const target = path.join(__dirname, '__storage', req.url.split(prefix).slice(1).join(prefix));

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
			fs.mkdirSync(path.dirname(target), { recursive: true });
			fs.writeFileSync(target, JSON.stringify(req.body));
		}

		return res.set({
			'Content-Type': isFolder ? 'application/ld+json' : 'application/json',
		}).status(200).json(isFolder ? {
			'@context': 'http://remotestorage.io/spec/folder-description',
			items: fs.readdirSync(target).reduce((coll, item) => {
				const _path = path.join(target, item);
				const stats = fs.statSync(_path);
				return Object.assign(coll, {
					[stats.isFile() ? item : `${ item }/`]: {
						ETag: stats.birthtime.toJSON().replace(/\D/g, ''),
						'Content-Length': stats.size,
						'Content-Type': mime.getType(_path) || 'application/json',
					},
				});
			}, {}),
		} : JSON.parse(fs.readFileSync(target, 'utf8')));
	},

};

export default mod;
