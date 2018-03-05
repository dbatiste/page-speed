
const chalk = require('chalk');
const math = require('mathjs');
const login = require('./login.js');

const measure = async(page, url, options) => {

	if (!options) options = {};
	if (!options.times) {
		options.times = 15;
	}

	const reportTimings = (timings) => {

		timings = timings.map(timing => timing['d2l.page.display']);

		const std = math.std(timings);
		const mean = math.mean(timings);
		const keep = [];

		for (let i = 0; i < timings.length; i++) {
			if (math.abs(timings[i] - mean) > std * 2) {
				process.stdout.write(`d2l.page.display: ${chalk.gray(Math.round(timings[i]) + 'ms')}\n`);
			} else {
				process.stdout.write(`d2l.page.display: ${Math.round(timings[i])}ms\n`);
				keep.push(timings[i]);
			}
		}

		const meanStd = math.mean(keep);

		process.stdout.write(`\n${chalk.green('std')}: ${Math.round(std)}ms\n`);
		process.stdout.write(`${chalk.green('mean')}: ${Math.round(mean)}ms\n`);
		process.stdout.write(`${chalk.green('mean(std)')}: ${Math.round(meanStd)}ms\n\n`);

	};

	const timings = [];
	let measuringLogged = false;

	while (timings.length <= options.times - 1) {
		await page.goto(url, {waitUntil: ['networkidle2', 'load']});
		if (login.isLoginPage(page.url())) {
			await login.login(page, options.user, options.pwd);
		} else {
			if (!measuringLogged) {
				process.stdout.write(`Measuring... ${chalk.green(url)}\n`);
				measuringLogged = true;
			}
			const timing = await page.evaluate(() => {
				return {
					'd2l.page.display': window.performance.getEntriesByName('d2l.page.display')[0].duration,
					'first-paint': window.performance.getEntriesByName('first-paint')[0].startTime,
					'first-contentful-paint': window.performance.getEntriesByName('first-contentful-paint')[0].startTime
				};
			});
			timings.push(timing);
		}
	}

	reportTimings(timings);

};

module.exports = measure;
