
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
	'tti': async() => {
		return await ttiPolyfill.getFirstConsistentlyInteractive();
	},

	'generic-pattern': async(pattern) => {

		pattern = pattern.substr(0, pattern.length - 1);

		const entries = window.performance.getEntries({ 'entryType': 'measure'});
		const result = {};

		for (let i = 0; i < entries.length; i++) {
			if (entries[i].name.startsWith(pattern)) {
				result[entries[i].name] = entries[i].duration;
			}
		}

		return result;
	},

	'generic': async(key) => {

		if (!key) {
			return null;
		}

		const entries = window.performance.getEntriesByName(key);
		if (entries && entries.length > 0) {
			return entries[0].duration;
		}

		const entryPromise = new Promise(function(resolve) {
			setTimeout(() => {
				//maybe reject instead
				resolve(null);
			}, 10000);
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntriesByName(key);
				if (entries && entries.length > 0) {
					resolve(entries[0].duration);
				}
			});
			observer.observe({entryTypes: ['measure']});
		});

		return entryPromise;
	}

};

const getProviders = (keys) => {
	const providers = [];
	if (keys) {
		for (let i = 0; i < keys.length; i++) {
			if (builtinProviders[keys[i]]) {
				providers.push({key: keys[i], provider: builtinProviders[keys[i]]});
			} else if (keys[i].endsWith('*')) {
				providers.push({key: keys[i], provider: builtinProviders['generic-pattern']});
			} else {
				providers.push({key: keys[i], provider: builtinProviders['generic']});
			}
		}
	}
	return providers;
};

const getMeasurements = async(page, keys) => {

	const providers = getProviders(keys);
	let measurements = {};

	if (providers && providers.length > 0) {
		for (let i = 0; i < providers.length; i++) {
			const value = await page.evaluate(providers[i].provider, providers[i].key);
			if (value === null) {
				continue;
			}
			if (typeof value === 'object') {
				measurements = helpers.merge(measurements, value);
			} else {
				measurements[providers[i].key] = value;
			}
		}
	}

	return measurements;

};

const measure = async(page, url, keys, config) => {

	let measuringLogged = false;
	let ignoreMeasurement = config.caching;

	const result = {
		caching: config.caching,
		timestamp: helpers.getTimestamp(),
		measurements: []
	};

	while (result.measurements.length <= config.samplesPerTarget - 1) {

		await page.goto(url, {waitUntil: ['networkidle2', 'load']});

		if (login.isLoginPage(page.url(), config.target.login)) {

			await login.login(page, config.target.login);

		} else {

			if (!measuringLogged) {
				process.stdout.write(`Measuring... ${chalk.blue(url)}\n`);
				measuringLogged = true;
			}

			if (ignoreMeasurement) {
				ignoreMeasurement = false;
				continue;
			}

			process.stdout.write('.');

			result.measurements.push(await getMeasurements(page, keys));

		}
	}

	process.stdout.write('\n\n');

	return result;

};

module.exports = measure;
