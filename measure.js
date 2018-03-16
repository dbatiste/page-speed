
const chalk = require('chalk');
const login = require('./login.js');

const measure = async(page, url, options) => {

	if (!options) options = {};
	if (!options.times) {
		options.times = 15;
	}

	const measurements = [];
	let measuringLogged = false;
	let ignoreMeasurement = options.caching;

	while (measurements.length <= options.times - 1) {

		await page.goto(url, {waitUntil: ['networkidle2', 'load']});

		if (login.isLoginPage(page.url())) {

			await login.login(page, options.user, options.pwd);

		} else {

			if (!measuringLogged) {
				process.stdout.write(`Measuring... ${chalk.blue(url)}\n\n`);
				measuringLogged = true;
			}

			if (ignoreMeasurement) {
				ignoreMeasurement = false;
				continue;
			}

			const measurement = await page.evaluate(async() => {

				const pageMeasures = window.performance.getEntries({ "entryType": "measure"});
				const result = {
					'first-paint': window.performance.getEntriesByName('first-paint')[0].startTime,
					'first-contentful-paint': window.performance.getEntriesByName('first-contentful-paint')[0].startTime
				};

				result['d2l.page.tti'] = await ttiPolyfill.getFirstConsistentlyInteractive();

				for (let i = 0; i < pageMeasures.length; i++) {
					if (pageMeasures[i].name.startsWith('d2l.page.')) {
						result[pageMeasures[i].name] = pageMeasures[i].duration
					}
				}

				return result;

			});

			measurements.push(measurement);

		}
	}

	return measurements;

};

module.exports = measure;
