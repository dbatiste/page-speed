
const fs = require('fs');
const chalk = require('chalk');
const math = require('mathjs');

const processor = {

	evaluate: (measurements) => {

		const results = {};

		const getMeasureNames = (measurements) => {
			const names = [];
			if (measurements.length > 0) {
				for (let measureName in measurements[0]) {
					if (measurements[0].hasOwnProperty(measureName)) {
						names.push(measureName);
					}
				}
			}
			return names;
		};

		const getMeasurement = (name, measurements) => {

			measurements = measurements.map(measurement => measurement[name]);

			const std = math.std(measurements);
			const mean = math.mean(measurements);
			const keep = [];

			process.stdout.write(`Times for ${chalk.green(name)}: `);
			for (let i = 0; i < measurements.length; i++) {
				if (math.abs(measurements[i] - mean) > std * 2) {
					process.stdout.write(`${chalk.gray(Math.round(measurements[i]) + 'ms')} `);
				} else {
					process.stdout.write(`${Math.round(measurements[i])}ms `);
					keep.push(measurements[i]);
				}
			}

			const meanStd = math.mean(keep);

			results[name] = Math.round(meanStd);
			//results[name + '-std'] = Math.round(std);

			process.stdout.write(`\n\n${chalk.green('std')}: ${Math.round(std)}ms\n`);
			process.stdout.write(`${chalk.green('mean')}: ${Math.round(mean)}ms\n`);
			process.stdout.write(`${chalk.green('mean(std)')}: ${Math.round(meanStd)}ms\n\n`);

		};

		const measureNames = getMeasureNames(measurements);
		for (let i = 0; i < measureNames.length; i++) {
			getMeasurement(measureNames[i], measurements);
		}

		process.stdout.write(`\n`);

		return results;

	}

};

module.exports = processor;
