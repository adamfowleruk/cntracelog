'use strict';
const util = require('util');
const extend = require('util')._extend;

// START ENGINE SELECTION
const W = 'winston';
const J = ':\t';

var options = {
    engine: W,
    level: 'debug',
    production: ("production" == process.env.NODE_ENV),
    cli: (undefined === process.env.VCAP_SERVICES || undefined !== process.env.TEST_ENV),
    extensions: {
        winston: {
            transports: []
        }
    }
};

function configure(opts) {
    extend(options,opts);
};

function createBaseLogger(ns,contextID) {
    var logger;
    if (W == options.engine) {
        const winston = require('winston');
        logger = winston.createLogger({
            level: options.level,
            defaultMeta: {
                service: ns,
                requestId: contextID
            },
            transports: [
                new winston.transports.Console({
                    format: options.cli ? winston.format.cli() : winston.format.simple()
                  })
                ,
                ...options.extensions.winston.transports
            ]
        });
    }
    return logger;
}

// END ENGINE SELECTION

// START TRACE LOGGER

class TraceLogger {
    constructor(namespace, optContextID) {
        this.ns = namespace;
        this.context = optContextID;
        this.logger = createBaseLogger();
    }

    createChild(contextID) {
        var newctx = "";
        if (undefined !== this.context && "" !== this.context && this.context !== contextID) 
            newctx = this.context + ".";
        newctx += contextID;
        return new TraceLogger(this.ns,newctx);
    }

    // INTERNAL MESSAGE FORMATTING

    _fmt(args) {
        if (undefined === this.context) 
            return util.format(
                [this.ns,args[0]].join(J),
                ...(args.slice(1))
            );
        return util.format(
            [this.ns,this.context,args[0]].join(J),
            ...(args.slice(1))
        );
    }

    // NPM logging methods

    error(...args) {
        this.logger.error(this._fmt(args));
    }

    warn(...args) {
        this.logger.warn(this._fmt(args));
    }

    info(...args) {
        this.logger.info(this._fmt(args));
    }

    verbose(...args) {
        this.logger.verbose(this._fmt(args));
    }

    debug(...args) {
        this.logger.debug(this._fmt(args));
    }

    silly(...args) {
        this.logger.silly(this._fmt(args));
    }

    // PERFORMANCE METRICS

    metric(name,value) { 
        this.info("METRIC ", name, value); 
    }
};

function createLogger(namespace, optContextID) {
    return new TraceLogger(namespace,optContextID);
};

// END TRACE LOGGER

module.exports = {
    createLogger: createLogger,
    configure: configure,
    extensions: {
        winston: {
            transports: {
                string: require("./winston-string-transport.js")
            }
        }
    }
};