
const login = require('./login.js');

const builtinProviders = {
	'app-version': () => {
		return document.documentElement.getAttribute('data-app-version');
	},
	'polymer': () => {
		return Polymer.version;
	}
};

const getProperty = async(page, url, provider, options) => {
	if (page.url() !== url) {
			await page.goto(url, {waitUntil: ['networkidle2', 'load']});
			if (login.isLoginPage(page.url())) {
					await login.login(page, options.user, options.pwd);
					await page.goto(url, {waitUntil: ['networkidle2', 'load']});
			}
	}
	return await page.evaluate(provider);
};

const getProviders = (keys) => {
	const providers = [];
	if (keys) {
		for(let i=0; i<keys.length; i++) {
			if (builtinProviders[keys[i]]) {
				providers.push({key: keys[i], provider: builtinProviders[keys[i]]});
			}
		}
	}
	return providers;
};

const getProperties = async(page, url, keys, options) => {
	const providers = getProviders(keys);
	const properties = [];
	if (providers && providers.length > 0) {
		process.stdout.write(`Properties: `);
		for(let i=0; i<providers.length; i++) {
			const property = {
				name: providers[i].key,
				value: await getProperty(page, url, providers[i].provider, options)
			};
			process.stdout.write(`${property.name}: ${property.value}; `);
			properties.push(property);
		}
		process.stdout.write(`\n\n`);
	}

	return properties;
};

module.exports = getProperties;
