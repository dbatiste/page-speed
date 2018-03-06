
const chalk = require('chalk');
const math = require('mathjs');
const login = require('./login.js');

const measure = async(page, url, options) => {

	if (!options) options = {};
	if (!options.times) {
		options.times = 15;
	}

	const getTimingNames = (timings) => {
		const names = [];
		if (timings.length > 0) {
			for (var timingName in timings[0]) {
				if (timings[0].hasOwnProperty(timingName)) {
					names.push(timingName);
				}
			}
		}
		return names;
	};

	const reportTiming = (name, timings) => {

		timings = timings.map(timing => timing[name]);

		const std = math.std(timings);
		const mean = math.mean(timings);
		const keep = [];

		process.stdout.write(`Times for ${chalk.green(name)}: `);
		for (let i = 0; i < timings.length; i++) {
			if (math.abs(timings[i] - mean) > std * 2) {
				process.stdout.write(`${chalk.gray(Math.round(timings[i]) + 'ms')} `);
			} else {
				process.stdout.write(`${Math.round(timings[i])}ms `);
				keep.push(timings[i]);
			}
		}

		const meanStd = math.mean(keep);

		process.stdout.write(`\n\n${chalk.green('std')}: ${Math.round(std)}ms\n`);
		process.stdout.write(`${chalk.green('mean')}: ${Math.round(mean)}ms\n`);
		process.stdout.write(`${chalk.green('mean(std)')}: ${Math.round(meanStd)}ms\n\n`);

	};

	const reportTimings = (timings) => {

		const timingNames = getTimingNames(timings);
		for (let i=0; i<timingNames.length; i++) {
			reportTiming(timingNames[i], timings);
		}

		process.stdout.write(`\n`);

	};

	const timings = [];
	let measuringLogged = false;

	while (timings.length <= options.times - 1) {
		await page.goto(url, {waitUntil: ['networkidle2', 'load']});
		if (login.isLoginPage(page.url())) {
			await login.login(page, options.user, options.pwd);
		} else {
			if (!measuringLogged) {
				process.stdout.write(`Measuring... ${chalk.blue(url)}\n\n`);
				measuringLogged = true;
			}
			const timing = await page.evaluate(() => {
				return {
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
