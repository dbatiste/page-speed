module.exports = {
	"applicationKey": "lms",
	"caching": "true",
	"headless": "false",
	"samplesPerTarget": 3,
	"measurements": ["first-paint", "first-contentful-paint", "tti", "d2l.page.*"],
	"properties": ["app-version", "polymer"],
	"targetSite":"https://polymertest.devlms.brightspace.com",
	"targets": [
		{"name": "announcements", "url": "/d2l/lms/news/main.d2l?ou=6606"},
		{"name": "content", "url": "/d2l/le/content/6606/Home"},
		{"name": "course-home-banner", "url": "/d2l/home/6609"}
	]
}
