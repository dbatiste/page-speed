#! /usr/bin/env node

const puppeteer = require('puppeteer');
const measure = require('./measure.js');
const getProperties = require('./properties.js');
const processor = require('./processor.js');
const helpers = require('./helpers.js');
const configHelper = require('./config.js');
const fs = require('fs');

const argv = require('yargs')
	.usage('Usage: $0 --user=[user] --pwd=[password]')
	.option('applicationKey', {default: undefined, string: true, describe: 'Key for application'})
	.option('caching', {default: undefined, boolean: true, describe: 'Whether to enable caching'})
	.option('headless', {default: undefined, boolean: true, describe: 'Whether to run headless'})
	.option('samplesPerTarget', {default: undefined, number: true, describe: 'Number of times to measure each page'})
	.option('targetSite', {describe: 'Target site to measure targets'})
	.option('user', {describe: 'Username to login'})
	.option('pwd', {describe: 'Password to login'})
	.option('configjs', {describe: 'Configuration JS module'})
	.argv;

const wd = process.cwd();
const config = configHelper.getConfig(argv, require(`${wd}/${argv.configjs}`));

const folderPath = `${wd}/data`;
if (!fs.existsSync(folderPath)) {
	fs.mkdirSync(folderPath);
}
const fileName = `${helpers.getTimestamp('-', '.')}.json`;
const filePath = `${folderPath}/${fileName}`;

(async() => {
	process.stdout.write('\nLaunching browser... ');
	const browser = await puppeteer.launch({headless: config.headless});
	const page = await browser.newPage();
	await page.setCacheEnabled(config.caching);
	await page.setViewport({width: 1024, height: 768});

	const browserVersion = await browser.version();
	process.stdout.write(browserVersion);

	for (let i = 0; i < config.target.targets.length; i++) {

		let result = await measure(page, config.target.site + config.target.targets[i].url, config.measurements, config);

		result = helpers.merge({
			'application-key': config.applicationKey,
			'target-site': config.target.site,
			'target-url': config.target.targets[i].url,
			'target-name': config.target.targets[i].name,
			'properties': await getProperties(page, config.target.site + config.target.targets[i].url, config.properties, config),
			'browser': browserVersion
		}, result);

		result.measurements = processor.evaluate(result.measurements);
		fs.appendFileSync(filePath, JSON.stringify(result) + '\n');

	}

	let uploadHandler;
	if (config.upload && config.upload.key === 'S3' && config.upload.target) {
		uploadHandler = require('./s3-upload.js');
	}

	if (uploadHandler) {
		await uploadHandler.upload(filePath, config.upload);
	}

	await browser.close();
})();
