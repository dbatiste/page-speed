module.exports = {
	applicationKey: 'lms',
	caching: true,
	headless: false,
	samplesPerTarget: 10,
	measurements: ['first-paint', 'first-contentful-paint', 'tti', 'd2l.page.*'],
	properties: ['app-version', 'polymer'],
	target: {
		site: 'https://polymertest.devlms.brightspace.com',
		login: {
			url: '/d2l/login',
			user: {selector: '#userName', envVar: 'D2LUSER'},
			password: {selector: '#password', envVar: 'D2LPWD'},
			submit: {selector: '.d2l-button[primary]'}
		},
		targets: [
			{name: 'announcements', url: '/d2l/lms/news/main.d2l?ou=6606'},
			{name: 'content', url: '/d2l/le/content/6606/Home'},
			{name: 'course-home-banner', url: '/d2l/home/6609'}
		]
	},
	upload: {
		key: 'S3',
		target: 'performance.somebucket/measurements',
		region: 'us-east-1',
		creds: {
			accessKeyIdVar: 'SOMEID',
			secretAccessKeyVar: 'SOMEKEY'
		}
	}
};
