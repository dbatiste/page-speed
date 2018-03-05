
const chalk = require('chalk');

const loginHelper = {

	login: async(page, userName, password) => {
		process.stdout.write('Logging in... ');
		await page.type('#userName', userName);
		await page.type('#password', password);
		//const [response] =
		await Promise.all([
			page.waitForNavigation({waitUntil: 'networkidle2'}),
			page.click('.d2l-button[primary]')
		]);

		process.stdout.write(chalk.green('success!\n\n'));
	},

	isLoginPage: (url) => {
		return (url.indexOf('/d2l/login') > -1);
	}

};

module.exports = loginHelper;
