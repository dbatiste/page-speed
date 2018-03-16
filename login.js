
const chalk = require('chalk');

const loginHelper = {

	login: async(page, userName, password) => {
		process.stdout.write('\nLogging in... ');
		await page.type('#userName', userName);
		await page.type('#password', password);
		//const [response] =
		await Promise.all([
			page.click('.d2l-button[primary]'),
			page.waitForNavigation({waitUntil: 'networkidle2'})
		]);

		process.stdout.write(chalk.green('success!\n\n'));
	},

	isLoginPage: (url) => {
		return (url.indexOf('/d2l/login') > -1);
	}

};

module.exports = loginHelper;
