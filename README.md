# page-speed

## Installation

Install the stuff...
```shell
npm i -g
```

## Usage

### Basic Setup

Provide some input, such as `perf.config.js`:
```json
module.exports = {
  "applicationKey": "your-friendly-app",
  "caching": true,
  "headless": false,
  "samplesPerTarget": 10,
  "measurements": ["first-paint", "first-contentful-paint"],
  "properties": ["app-version","polymer"],
  "targetSite": "https://yourapp.com",
  "targets": [
    {"name": "target1", "url": "/some-relative-url-1"},
    {"name": "target2", "url": "/some-relative-url-2"},
    {"name": "target3", "url": "/some-relative-url-3"}
  ]
};
```

Run it...
```shell
measure --user some-user --pwd some-password --configjs perf.config.js
```

To produce some metrics in JSON format for each target like this:
```json
{
  "application-key":"your-friendly-app",
  "target-site":"https://yourapp.com",
  "target-url":"/some-relative-url-1",
  "target-name":"target1",
  "properties":[
    {"name":"app-version","value":"10.8.1"},
    {"name":"polymer","value":"2.5.0"}
  ],
  "caching":true,
  "timestamp":"2018-03-23 15:47:56.182",
  "measurements":[
    {"name":"first-paint","value":940},
    {"name":"first-contentful-paint","value":940}
  ]
}
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
    {"key": "some-other-version", "provider": () => {return SomethingOtherFramework.version;}}
  ]
};
```
