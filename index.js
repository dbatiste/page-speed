#! /usr/bin/env node

const puppeteer = require('puppeteer');
const measure = require('./measure.js');
const getProperties = require('./properties.js');
const processor = require('./processor.js');
const helpers = require('./helpers.js');
const fs = require('fs');

const argv = require('yargs')
	.usage('Usage: $0 --user=[user] --pwd=[password]')
	.option('applicationKey', {default: undefined, string: true, describe: 'Key for application'})
	.option('caching', {default: undefined, boolean: true, describe: 'Whether to enable caching'})
	.option('headless', {default: undefined, boolean: true, describe: 'Whether to run headless'})
	.option('samplesPerTarget', {default: undefined, number: true, describe: 'Number of times to measure each page'})
	.option('measurements', {array: true, describe: 'Measurements to extract from targets'})
	.option('properties', {array: true, describe: 'Properties to extract from targets'})
	.option('targetSite', {describe: 'Target site to measure targets'})
	.option('targets', {array: true, describe: 'Targets to measure'})
	.option('user', {describe: 'Username to login'})
	.option('pwd', {describe: 'Password to login'})
	.option('configjs', {describe: 'Configuration JS module'})
	.demandOption(['user', 'pwd'])
	.argv;

const wd = process.cwd();
const config = require(`${wd}/${argv.configjs}`);

config.applicationKey = helpers.getConfigValue(argv.applicationKey, config.applicationKey, '');
config.caching = helpers.getConfigValue(argv.caching, config.caching, true);
config.headless = helpers.getConfigValue(argv.headless, config.headless, true);
config.samplesPerTarget = helpers.getConfigValue(argv.samplesPerTarget, config.samplesPerTarget, 10);
config.measurements = helpers.getConfigValue(argv.measurements, config.measurements, ['first-paint', 'first-contentful-paint']);
config.properties = helpers.getConfigValue(argv.properties, config.properties, []);
config.targetSite = helpers.getConfigValue(argv.targetSite, config.targetSite, '');
config.targets = helpers.getConfigValue(argv.targets, config.targets, []);
config.user = helpers.getConfigValue(argv.user, config.user, '');
config.pwd = helpers.getConfigValue(argv.pwd, config.pwd, '');

const folderPath = `${wd}/data`;
if (!fs.existsSync(folderPath)) {
	fs.mkdirSync(folderPath);
}
const filePath = `${folderPath}/${helpers.getTimestamp('-', '.')}.json`;

(async() => {
	process.stdout.write('\nLaunching browser... ');
	const browser = await puppeteer.launch({headless: config.headless});
	const page = await browser.newPage();
	await page.setCacheEnabled(config.caching);
	await page.setViewport({width: 1024, height: 768});

	process.stdout.write(await browser.version());

	for (let i = 0; i < config.targets.length; i++) {

		let result = await measure(page, config.targetSite + config.targets[i].url, config.measurements, config);

		result = helpers.merge({
			'application-key': config.applicationKey,
			'target-site': config.targetSite,
			'target-url': config.targets[i].url,
			'target-name': config.targets[i].name,
			'properties': await getProperties(page, config.targetSite + config.targets[i].url, config.properties, config)
		}, result);

		result.measurements = processor.evaluate(result.measurements);
		fs.appendFileSync(filePath, JSON.stringify(result) + '\n');

	}

	await browser.close();
})();
