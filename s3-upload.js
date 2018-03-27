
const AWS = require('aws-sdk');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const uploadHelper = {

	upload: async(filePath, config) => {

		process.stdout.write(`\nUploading to ${config.target} (${config.region})...`);

		const uploadPromise = new Promise((resolve, reject) => {

			const s3 = new AWS.S3({
				apiVersion: 'latest',
				accessKeyId: config.creds.accessKeyId || process.env[config.creds.accessKeyIdVar],
				secretAccessKey: config.creds.secretAccessKey || process.env[config.creds.secretAccessKeyVar],
				region: config.region
			});

			const params = {Bucket: config.target, Key: '', Body: ''};
			const fileStream = fs.createReadStream(filePath);

			fileStream.on('error', function(err) {
				process.stdout.write(`\n${chalk.red(err)}`);
				reject(err);
			});
			params.Body = fileStream;
			params.Key = path.basename(filePath);

			s3.upload(params, function(err, data) {
				if (err) {
					process.stdout.write(`\n${chalk.red(err)}`);
					reject(err);
				}
				if (data) {
					process.stdout.write(`${chalk.green('success!')}\n${data.Location}\n\n`);
					resolve(data);
				}
			});

		});

		return uploadPromise;
	}

};

module.exports = uploadHelper;
