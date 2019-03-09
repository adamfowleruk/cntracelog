# cntracelog

A Cloud Native logging wrapper to trace app calls in distributed systems, and output the information to Winston.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://travis-ci.com/adamfowleruk/cntracelog.svg?branch=master)](https://travis-ci.com/adamfowleruk/cntracelog)
[![Coverage Status](https://coveralls.io/repos/github/adamfowleruk/cntracelog/badge.svg?branch=master)](https://coveralls.io/github/adamfowleruk/cntracelog?branch=master)
![David](https://img.shields.io/david/adamfowleruk/cntracelog.svg)
![npm](https://img.shields.io/npm/v/cntracelog.svg)
![npm](https://img.shields.io/npm/dt/cntracelog.svg)
![node](https://img.shields.io/node/v/cntracelog.svg)

I built cntracelog because I wanted a library that could sit across multiple logging libraries (mainly Winston) and provide a set of extra services over their channels, without rewriting the entire logging chain. 

It had to support common Cloud Native app defaults, to take that logic out of my apps.

Facilities I required:-
- Outputting all logs to standard out (for Cloud Native apps)
- Preconfiguring underlying log libraries based on NODE_ENV, TEST_ENV, and the presence of any PaaS environment configurations (including Pivotal Cloud Foundry)
- Namespace support (code module name outputted in the logs)
- Call tracing support (via providing a 'context id' field that is outputted to all messages) - for APM style call tracing
- Could process Metrics log messages
- Supports NPM log levels
- Allowed customising the settings and underlying libraries as necessary

## Getting cntracelog

`npm i cntracelog --save`

## Using cntracelog

First, get a rootlogger at the top of your code module file:-

```javascript
const tl = require('cntracelog');
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

## What makes this library cloud native?

There is specific code in the configuration of the underlying logger that checks if the app is running in production,
in dev, on the command line, or has been provided with Platform as a Service (PaaS) configuration environment variables.
In particular, those used by Pivotal Cloud Foundry.

The aim of this part of the logger is to automatically configure the underlying logger to log everything to standard out
and not a file when running in a cloud native PaaS. This is one of the principles of cloud native app development.

Once all those logs are collated in to a single stream though you need a way to report over them. 
Typically this will be by filtering out all log messages outside of a particular module, or a particular service invocation.

To do this, you need both the concept of a namespace (part of the app the message is for, in dot notation), and that
of a context flag (a value unique to this request, and that is passed throughout the entire back end service chain call).

cntracelog supports static namespaces per module/logger instance, and dynamic context IDs. These IDs can even be chained
throughout the stack, again using dot notation, to provide deep context tracing if required.

Other cloud environments and logging implementations will be added over time. Even better, add one yourself and send me a PR!

## Licensing and Copyright

All code unless explicitly stated is copyright Adam Fowler All Rights Reserved.

All code is licensed under the Apache-2.0 license unless explicitly specified.

## Support

Please log all support requests and bugs in the Issues tracker.

## Contributing

Please fork the project, create an issue, create a branch called feature-ISSUEID, finish and test the feature, then issue a PR.

In particular I would like people to test this library and extend it for other logging libraries in Node.js, including vanilla console.log.
