
const helper = {

	getTimestamp: (dateDelim, timeDelim) => {
		dateDelim = dateDelim ? dateDelim : '-';
		timeDelim = timeDelim ? timeDelim : ':';
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		const milliseconds = date.getMilliseconds();
		return year + dateDelim
			+ (month < 10 ? '0' + month : month) + dateDelim
			+ (day < 10 ? '0' + day : day) + ' '
			+ (hours < 10 ? '0' + hours : hours) + timeDelim
			+ (minutes < 10 ? '0' + minutes : minutes) + timeDelim
			+ (seconds < 10 ? '0' + seconds : seconds) + '.'
			+ milliseconds;
	},

	merge: (objA, objB) => {
		for (let key in objB) {
			if (objB.hasOwnProperty(key)) {
				objA[key] = objB[key];
			}
		}
		return objA;
	}

};

module.exports = helper;
