import crypto from 'crypto';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime';


const mod = {

	hash: e => crypto.createHash('sha256').update(e).digest('hex').substring(0, 8),

	encoding: contentType => contentType && [
		'application/json',
		'text',
	].filter(e => contentType.startsWith(e)).length ? 'utf8' : undefined,
	
	isJunk: e => [
		'.DS_Store',
	].includes(path.basename(e)),

	__guessJSON (e) {
		if (!['{', '['].includes(e.trim()[0]))
			return false;

		try {
			return JSON.parse(e);
		} catch (e) {
			return false
		}
	},
	__guessHTML: e => e.startsWith('<!DOCTYPE html>'),

	async _guessType (buffer, basename) {
		let type;

		if (type = mime.getType(basename))
			return type;

		if (type = await fileTypeFromBuffer(buffer))
			return type.mime;

		const string = buffer.toString('utf8');

		if (mod.__guessJSON(string))
			return 'application/json';
		
		if (mod.__guessHTML(string))
			return 'text/html';

		return 'text/plain';
	},

};

export default mod;
