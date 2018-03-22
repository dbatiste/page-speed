
const puppeteer = require('puppeteer');
const measure = require('./measure.js');
const getProperties = require('./properties.js');
const processor = require('./processor.js');
const helpers = require('./helpers.js');
const fs = require('fs');

const argv = require('yargs')
	.usage('Usage: $0 --user=[user] --pwd=[password] --headless[bool] --times=[num]')
	.option('user', {describe: 'Username to login'})
	.option('pwd', {describe: 'Password to login'})
	.option('properties', {array: true, describe: 'Properties to extract from targets'})
	.option('measurements', {array: true, describe: 'Measurements to extract from targets'})
	.option('targetSite', {describe: 'Target site to measure targets'})
	.option('targets', {array: true, describe: 'Targets to measure'})
	.option('caching', {default: true, boolean: true, describe: 'Whether to enable caching'})
	.option('headless', {default: true, boolean: true, describe: 'Whether to run headless'})
	.option('times', {default: 15, number: true, describe: 'Number of times to measure each page'})
	.demandOption(['user', 'pwd', 'targets'])
	.config()
	.argv;

const options = {
	user: argv.user,
	pwd: argv.pwd,
	times: argv.times,
	caching: argv.caching
};

const targets = argv.targets;
const filePath = 'data/' + helpers.getTimestamp('-', '.') + '.json';

(async() => {
	process.stdout.write(`\nLaunching browser... `);
	const browser = await puppeteer.launch({headless: argv.headless});
	const page = await browser.newPage();
	await page.setCacheEnabled(argv.caching);
	await page.setViewport({width: 1024, height: 768});

	process.stdout.write(await browser.version());

	for (let i = 0; i < targets.length; i++) {

		let result = await measure(page, argv.targetSite + targets[i].url, argv.measurements, options);

		result = helpers.merge({
			'application-key': argv.applicationKey,
			'target-site': argv.targetSite,
			'target-url': targets[i].url,
			'target-name': targets[i].name,
			'properties': await getProperties(page, argv.targetSite + targets[i].url, argv.properties, options)
		}, result);

		result.measurements = processor.evaluate(result.measurements);
		fs.appendFileSync(filePath, JSON.stringify(result) + '\n');

	}

	await browser.close();
})();
