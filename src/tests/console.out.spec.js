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

const thismod = require("..");
const expect = require('chai').expect;

// log to string as well as console so we can introspect logs

describe('tracelog', () => {
    describe('Fallback to console.out', () => {
        thismod.configure({
            engine: "out",
            level: "silly",
            extensions: {
                out: {
                    buffer: true
                }
            }
        });
        var toplog = thismod.createLogger('tracelog');

        toplog.info("An INFO Message with no context");

        var log = toplog.createChild('fallback');

        log.error("An ERROR level message");
        log.warn("A WARN level message");
        log.info("An INFO level message");
        log.verbose("A VERBOSE level message");
        log.debug("A DEBUG level message");
        log.silly("A SILLY level message");
        log.metric("A TIMED operation of ms ",6);

        var logout = log.logger.logString; // internal method call - naughty
        var toplogout = toplog.logger.logString; // internal method call - naughty

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
            expect(toplogout.lastIndexOf("An INFO Message with no context")).to.not.be.equal(-1);
        });
        it('should have a metric top level message', () => {
            expect(logout.lastIndexOf("TIMED operation")).to.not.be.equal(-1);
        });

    });
});