/*
 * Copyright Adam Fowler 2019 All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *    http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
const util = require('util');
const extend = require('util')._extend;

// COMMON CONSTANTS
const J = ':\t';

var levels = {
    "error": 0, "warn": 1, "info": 3, "verbose": 4, "debug": 5, "silly": 6
};

// Default Logger
class DefaultLogger {
    constructor(opts) {
        console.log("Creating DefaultLogger");
        this.options = extend({level: "info"},opts);
        if (this.options.buffer) {
            this.logarray = [];
        }
    }
    _logfmt(levelString,...args) {
        var finalMsg = [levelString,...args].join(J);
        if (this.options.buffer) {
            this.logarray.push(finalMsg);
        }
        console.log(finalMsg);
    }
    get logString() {
        if (this.options.buffer) {
            return this.logarray.join(J);
        }
        return "";
    }
    error() {
        this._logfmt("error",...arguments);
    }
    warn() {
        this._logfmt("warn",...arguments);
    }
    info() {
        this._logfmt("info",...arguments);
    }
    verbose() {
        this._logfmt("verbose",...arguments);
    }
    debug() {
        this._logfmt("debug",...arguments);
    }
    silly() {
        this._logfmt("silly",...arguments);
    }
}

// START ENGINE SELECTION
const W = 'winston';
const O = 'out';

var options = {
    engine: W,
    level: 'debug',
    production: ("production" == process.env.NODE_ENV),
    cli: (undefined === process.env.VCAP_SERVICES && undefined !== process.env.TEST_ENV),
    extensions: {
        winston: {
            transports: []
        },
        out: {
        }
    }
};

function configure(opts) {
    extend(options,opts);
};

function createBaseLogger(ns,contextID) {
    var logger;
    var foundLoggingEngine = false;
    if (W == options.engine) {
        try {
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
            foundLoggingEngine = true;
        } catch (err) {
            console.out("Error attempting to load Winston library. Using console.out instead. Error Message: ",err);
        }
    }
    if (O == options.engine || !foundLoggingEngine) {
        // fallback to console.out
        logger = new DefaultLogger(options.extensions.out);
        foundLoggingEngine = true;
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
        this.info("METRIC ", name + "," + value); 
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