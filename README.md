# page-speed

## Installation

Install the stuff...
```shell
npm i -g
```

## Usage

### Basic Setup

Provide some input, such as `perf.config.js`:
```js
module.exports = {
  "applicationKey": "your-app",
  "caching": true,
  "headless": false,
  "samplesPerTarget": 10,
  "measurements": ["first-paint", "first-contentful-paint"],
  "properties": ["polymer"],
  "target": {
    "site": "https://yourapp.com",
    "login": {
      "url": "/login",
      "user": {"selector": "#userName", "value": "test-user"},
      "password": {"selector": "#password", "value": "test-password"},
      "submit": {"selector": "#loginButton"}
    },
    "targets": [
      {"name": "target1", "url": "/some-relative-url-1"},
      {"name": "target2", "url": "/some-relative-url-2"},
      {"name": "target3", "url": "/some-relative-url-3"}
    ]
  }
};
```

Run it like this...
```shell
measure --user some-user --pwd some-password --configjs perf.config.js
```

to produce some metrics in JSON format for each target like this:
```json
{
  "application-key":"your-app",
  "target-site":"https://yourapp.com",
  "target-url":"/some-relative-url-1",
  "target-name":"target1",
  "caching":true,
  "timestamp":"2018-03-23 15:47:56.182",
  "properties":[
    {"name":"polymer","value":"2.5.0"}
  ],
  "measurements":[
    {"name":"first-paint","value":940},
    {"name":"first-contentful-paint","value":940}
  ]
}
```

### Login Info

The login page info (url, user & password selectors and values, and submit button selector) can be configured.

```js
module.exports = {
  "target": {
    "login": {
      "url": "/login",
      "user": {"selector": "#userName", "value": "test-user"},
      "password": {"selector": "#password", "value": "test-password"},
      "submit": {"selector": "#loginButton"}
    }
  }
};
```

Alternatively, the user and password can be specified as environment variables.

```js
module.exports = {
  "target": {
    "login": {
      "url": "/login",
      "user": {"selector": "#userName", "envVar": "TEST-USER-VAR"},
      "password": {"selector": "#password", "envVar": "TEST-PASSWORD-VAR"},
      "submit": {"selector": "#loginButton"}
    }
  }
};
```

### Custom Measurements

Need to extract your own measurements?  No problem, as long as your custom measurement is taken using the [standard measure API](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure) it will be extracted and recorded.  

Note: if your measurement name ends with a `*`, the extractor will look for any measures that match, but it won't wait for them beyond page load. If there is a specific measure that may be delayed, list is explicitly.
```json
module.exports = {
  "measurements": ["yourapp.some-measure", "yourapp.*"]
};
```

### Custom Properties

Need to extract properties (besides the built-in ones) to go with your data? Custom properties providers can be specified as shown below, and the value will be included in the output properties. The provider may be `async` if needed.
```js
module.exports = {
  "properties": [
    "app-version",
    "polymer",
    {"key": "some-other-version", "provider": () => {return SomeOtherFramework.version;}}
  ]
};
```

### Upload

Optionally automatically upload results to your favorite S3 bucket via configuration.
```js
module.exports = {
  "upload": {
    "key": "S3",
    "target": "some.bucket/some-folder",
    "region": "us-east-1",
    "creds": {
      "accessKeyId": "some-id",
      "secretAccessKey": "some-secret-key"
    }
  }
};
```
Or using environment variables...
```js
module.exports = {
  "upload": {
    "key": "S3",
    "target": "some.bucket/some-folder",
    "region": "us-east-1",
    "creds": {
      "accessKeyIdVar": "SOME-ID-VAR",
      "secretAccessKeyVar": "SOME-SECRET-KEY-VAR"
    }
  }
};
```

'''Note: keep your secret keys secret!'''
