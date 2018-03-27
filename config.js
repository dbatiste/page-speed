const configHelper = {

	defaultConfig: {
		applicationKey: null,
		caching: true,
		headless: true,
		samplesPerTarget: 10,
		measurements: ['first-paint', 'first-contentful-paint'],
		properties: [],
		target: {
			site: null,
			login: {
				url: null,
				user: {selector: null, envVar: null, value: null},
				password: {selector: null, envVar: null, value: null},
				submit: {selector: null}
			},
			targets: []
		},
		upload: {
			key: 'S3',
			target: null,
			region: 'us-east-1',
			creds: {
				accessKeyId: null,
				accessKeyIdVar: null,
				secretAccessKey: null,
				secretAccessKeyVar: null
			}
		}
	},

	getConfig: (argv, config) => {
		const resolved = {...configHelper.defaultConfig, ...config};
		if (argv.applicationKey) resolved.applicationKey = argv.applicationKey;
		if (argv.caching !== undefined) resolved.caching = argv.caching;
		if (argv.headless !== undefined) resolved.headless = argv.headless;
		if (argv.samplesPerTarget) resolved.samplesPerTarget = argv.samplesPerTarget;
		if (argv.targetSite) resolved.target.site = argv.targetSite;
		if (argv.user) resolved.target.login.user.value = argv.user;
		if (argv.pwd) resolved.target.login.password.value = argv.pwd;
		return resolved;
	}

};

module.exports = configHelper;
