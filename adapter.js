import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mod = {

	_resolvePath: (handle, url) => path.join(__dirname, '__storage', handle, url),

	_readJson (path) {
    try {
      const content = fs.readFileSync(path);
      return content ? JSON.parse(content) : null;
    } catch (e) {
      if (e.code !== 'ENOENT')
      	console.error('reading JSON failed:', e);

      return null;
    }
  },

  permissions (handle, token) {
	  const user = mod._readJson(mod._resolvePath(handle, 'auth.json'));
	  if (!user)
	  	return {};

	  const data = user.sessions;
	  if (!data || !data[token])
	  	return {};

	  const permissions = data[token].permissions;
	  if (!permissions)
	  	return {};
	  
	  const output = {};

	  for (const category in permissions) {
	    output[category] = Object.keys(permissions[category]).sort();
	  }

	  return output;
	},

};

export default mod;
