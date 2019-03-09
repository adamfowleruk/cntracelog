# tracelog

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://travis-ci.com/adamfowleruk/tracelog.svg?branch=master)](https://travis-ci.com/adamfowleruk/tracelog)

I built tracelog because I wanted a library that could sit across multiple logging libraries (mainly Winston) and provide a set of extra services over their channels, without rewriting the entire logging chain. 

It had to support common Cloud Native app defaults, to take that logic out of my apps.

Facilities I required:-
- Outputting all logs to standard out (for Cloud Native apps)
- Preconfiguring underlying log libraries based on NODE_ENV, TEST_ENV, and the presence of any PaaS environment configurations (including Pivotal Cloud Foundry)
- Namespace support (code module name outputted in the logs)
- Call tracing support (via providing a 'context id' field that is outputted to all messages) - for APM style call tracing
- Could process Metrics log messages
- Supports NPM log levels
- Allowed customising the settings and underlying libraries as necessary

## Getting tracelog

`npm i tracelog --save`

## Using tracelog

First, get a rootlogger at the top of your code module file:-

```javascript
const tl = require('tracelog');
tl.configure({level: "silly"}); // optional
var rootlog = tl.createLogger("my.module.name");
```

You can use this right now, for example when setting up the module and before processing requests:-

```javascript
rootlog.info("My module is all set up and ready to go!");
```

When processing a request, you can create a logger to specify the context ID for APM tracing:-

```javascript
async function myAsyncFunc(someData) {
    var log = rootlog.createChild(someData.myTrackingId);
    log.info("Starting to process request");
    ...
    log.error("Uh oh something bad happened", err);
    ...
    log.info("Done");
    log.metrics("Request handled successfully 200",timeTakenInMS);
}
```

This produces:-

```
info:    my.module.name:	My module is all set up and ready to go!
info:    my.module.name:	ID123456:	Starting to process request
error:   my.module.name:	ID123456:	Uh oh something bad happened
info:    my.module.name:	ID123456:	Done
info:    my.module.name:	ID123456:	METRIC  A TIMED operation of ms  6
```

The above will be colour coded if running as part of Mocha/Chai tests, or executed via the command line.

The tracelog library can basically be used as a drop in for Winston, but where:-
- Only transport configured is a console out transport
- Defaults to INFO level in production, DEBUG in non prod or in testing modes (Checked via environment variables)

## Licensing and Copyright

All code unless explicitly stated is copyright Adam Fowler All Rights Reserved.

All code is licensed under the Apache-2.0 license unless explicitly specified.

## Support

Please log all support requests and bugs in the Issues tracker.

## Contributing

Please fork the project, create an issue, create a branch called feature-ISSUEID, finish and test the feature, then issue a PR.

In particular I would like people to test this library and extend it for other logging libraries in Node.js, including vanilla console.log.
