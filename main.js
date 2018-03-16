
const puppeteer = require('puppeteer');
const measure = require('./measure.js');
const processor = require('./processor.js');
const helpers = require('./helpers.js');
const fs = require('fs');

const argv = require('yargs')
	.usage('Usage: $0 --user=[user] --pwd=[password] --headless[bool] --times=[num]')
	.option('user', {describe: 'Username to login'})
	.option('pwd', {describe: 'Password to login'})
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
	const browser = await puppeteer.launch({headless: argv.headless});
	const page = await browser.newPage();
	await page.setCacheEnabled(argv.caching);
	await page.setViewport({width: 1024, height: 768});

	for (let i = 0; i < targets.length; i++) {

		const measurements = await measure(page, argv.targetSite + targets[i].url, options);

		const polymerVersion = await helpers.getPolymerVersion(page);
		const result = {
			'target-site': argv.targetSite,
			'target-url': targets[i].url,
			'target-name': targets[i].name,
			caching: argv.caching,
			polymer: polymerVersion,
			timestamp: helpers.getTimestamp()
		};
		helpers.merge(result, processor.evaluate(measurements));
		fs.appendFileSync(filePath, JSON.stringify(result) + '\n');
		//await page.screenshot({path: i + '.png'});
	}

	await browser.close();
})();
