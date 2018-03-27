
const chalk = require('chalk');

const loginHelper = {

	login: async(page, config) => {
		process.stdout.write('\nLogging in... ');

		const user = config.user.value || process.env[config.user.envVar];
		const password = config.password.value || process.env[config.password.envVar];

		await page.type(config.user.selector, user);
		await page.type(config.password.selector, password);
		await Promise.all([
			page.click(config.submit.selector),
			page.waitForNavigation({waitUntil: 'networkidle2'})
		]);

		process.stdout.write(chalk.green('success!\n\n'));
	},

	isLoginPage: (url, config) => {
		return (url.indexOf(config.url) > -1);
	}

};

module.exports = loginHelper;
