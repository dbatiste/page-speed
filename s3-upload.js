
const AWS = require('aws-sdk');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const uploadHelper = {

	upload: async(filePath, endPoint, creds) => {

		process.stdout.write(`\nUploading to ${endPoint.target} (${endPoint.region})...`);

		const uploadPromise = new Promise((resolve, reject) => {

			const s3 = new AWS.S3({
				apiVersion: 'latest',
				accessKeyId: creds.accessKeyId,
				secretAccessKey: creds.secretAccessKey,
				region: endPoint.region
			});

			const params = {Bucket: endPoint.target, Key: '', Body: ''};
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
