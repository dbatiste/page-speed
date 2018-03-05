
const puppeteer = require('puppeteer');
const measurePage = require('./measure.js');
const argv = require('yargs')
	.usage('Usage: $0 --user=[user] --pwd=[password] --headless[bool] --times=[num]')
	.option('user', {describe: 'Username to login'})
	.option('pwd', {describe: 'Password to login'})
	.option('pages', {array: true, describe: 'Pages to measure'})
	.option('caching', {default: true, boolean: true, describe: 'Whether to enable caching'})
	.option('headless', {default: true, boolean: true, describe: 'Whether to run headless'})
	.option('times', {default: 15, number: true, describe: 'Number of times to measure each page'})
	.demandOption(['user', 'pwd', 'pages'])
	.config()
	.argv;

const options = {
	user: argv.user,
	pwd: argv.pwd,
	times: argv.times
};

const pages = argv.pages;

(async() => {
	const browser = await puppeteer.launch({headless: argv.headless});
	const page = await browser.newPage();
	await page.setCacheEnabled(argv.caching);
	await page.setViewport({width: 1024, height: 768});

	for (let i = 0; i < pages.length; i++) {
		await measurePage(page, pages[i], options);
	}

	await browser.close();
})();
