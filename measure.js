
const chalk = require('chalk');
const login = require('./login.js');
const helpers = require('./helpers.js');

const builtinProviders = {
	'first-paint': () => {
		return window.performance.getEntriesByName('first-paint')[0].startTime;
	},
	'first-contentful-paint': () => {
		return window.performance.getEntriesByName('first-contentful-paint')[0].startTime;
	},
	'd2l.page.*': async() => {
		const pageMeasures = window.performance.getEntries({ "entryType": "measure"});
		const result = {};
		for (let i = 0; i < pageMeasures.length; i++) {
			if (pageMeasures[i].name.startsWith('d2l.page.')) {
				result[pageMeasures[i].name] = pageMeasures[i].duration
			}
		}
		result['d2l.page.tti'] = await ttiPolyfill.getFirstConsistentlyInteractive();
		return result;
	},
	'd2l.page.tti': async() => {
		return await ttiPolyfill.getFirstConsistentlyInteractive();
	}
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

const getMeasurements = async(page, keys) => {

	const providers = getProviders(keys);
	let measurements = {};

	if (providers && providers.length > 0) {
		for(let i=0; i<providers.length; i++) {
			const value = await page.evaluate(providers[i].provider);
			if (typeof value === 'object') {
				measurements = helpers.merge(measurements, value);
			} else {
				measurements[providers[i].key] = value;
			}

		}
	}

	return measurements;

};

const measure = async(page, url, keys, options) => {

	if (!options) options = {};
	if (!options.times) {
		options.times = 15;
	}

	let measuringLogged = false;
	let ignoreMeasurement = options.caching;

	const result = {
		caching: options.caching,
		timestamp: helpers.getTimestamp(),
		measurements: []
	};

	while (result.measurements.length <= options.times - 1) {

		await page.goto(url, {waitUntil: ['networkidle2', 'load']});

		if (login.isLoginPage(page.url())) {

			await login.login(page, options.user, options.pwd);

		} else {

			if (!measuringLogged) {
				process.stdout.write(`Measuring... ${chalk.blue(url)}\n`);
				measuringLogged = true;
			}

			if (ignoreMeasurement) {
				ignoreMeasurement = false;
				continue;
			}

			process.stdout.write(`.`);

			result.measurements.push(await getMeasurements(page, keys));

		}
	}

	process.stdout.write(`\n\n`);

	return result;

};

module.exports = measure;
