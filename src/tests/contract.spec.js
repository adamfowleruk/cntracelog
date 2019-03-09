'use strict';

const thismod = require("..");
const wst = thismod.extensions.winston.transports.string;
const expect = require('chai').expect;
const vars = require('./vars.js');

var ourwst = new wst({level: "silly"});

// log to string as well as console so we can introspect logs
thismod.configure({
    extensions: {
        winston: {
            transports: [
                ourwst
            ]
        }
    },
    level: "silly"
});
var toplog = thismod.createLogger('tracelog');

describe('tracelog', () => {
    describe('Calling contract', () => {
        toplog.info("An INFO Message with no context");
        var log = toplog.createChild('contract');

        log.error("An ERROR level message");
        log.warn("A WARN level message");
        log.info("An INFO level message");
        log.verbose("A VERBOSE level message");
        log.debug("A DEBUG level message");
        log.silly("A SILLY level message");
        log.metric("A TIMED operation of ms ",6);

        var logout = ourwst.logString;
        it('should have an ERROR level message', () => {
            expect(logout.lastIndexOf("ERROR level message")).to.not.be.equal(-1);
        });
        it('should have a WARN level message', () => {
            expect(logout.lastIndexOf("WARN level message")).to.not.be.equal(-1);
        });
        it('should have an INFO level message', () => {
            expect(logout.lastIndexOf("INFO level message")).to.not.be.equal(-1);
        });
        it('should have a VERBOSE level message', () => {
            expect(logout.lastIndexOf("VERBOSE level message")).to.not.be.equal(-1);
        });
        it('should have a DEBUG level message', () => {
            expect(logout.lastIndexOf("DEBUG level message")).to.not.be.equal(-1);
        });
        it('should have a SILLY level message', () => {
            expect(logout.lastIndexOf("SILLY level message")).to.not.be.equal(-1);
        });
        it('should have a contextless top level message', () => {
            expect(logout.lastIndexOf("An INFO Message with no context")).to.not.be.equal(-1);
        });
        it('should have a metric top level message', () => {
            expect(logout.lastIndexOf("TIMED operation")).to.not.be.equal(-1);
        });

    });
});
