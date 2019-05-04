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
const expect = require('chai').expect;
// use proxyquire so I can reset env variables
const proxyquire = require('proxyquire').noPreserveCache();

var custom = {
  VCAP_SERVICES: '{ "logging-amqp": {"credentials": {"uri": "amqp://localhost"},"exchangeType": "topic","exchange":"logging-exchange","routingKey":"","memoryCache":true}, "amqp-log-sink": {"credentials": {"uri": "amqp://localhost"},"exchangeType": "topic","exchange":"logging-exchange","routingKey":""}}'
};

for (var env in custom) {
  process.env[env] = custom[env];
}
const thismod = proxyquire("../index.js",{});

// get logger
var toplog = thismod.createLogger('tracelog');

describe('tracelog', () => {
  describe('Cloud Foundry Support', () => {
    console.log("VCAP: " + process.env.VCAP_SERVICES);
    it('should have env variable for VCAP_SERVICES',() => {
      expect(process.env.VCAP_SERVICES).to.not.be.undefined;
    });
    it('should have cloud foundry as the runtime', () => {
      expect(thismod.getRuntime()).to.be.equal("cloudfoundry");
    });
    it('should have amqp configuration present', () => {
      expect(thismod.getOptions().amqp).to.not.be.undefined;
    });
  });

  describe('Cloud Foundry AMQP support', () => {

    var sink = require("../amqpsink.js");
    var sinkPromise;
    var log;
    var msg = "An informative log message about AMQP";

    before(() => {
      sinkPromise = sink.sink({memoryCache:true});
      return sinkPromise.then(() => {
        // log something
        toplog.info(msg); // async so won't appear in the log yet
        // wait a minute
        // then grab logs
        log = sink.getLog();
        console.log("LOGOUT: " + log);
      });
    });

    it('log should not be undefined',() => {
      expect(sink.getLog()).to.not.be.undefined;
    });
    
    // The below won't work as it completes too fast to be caught - manuall testing with 2 run throughs does work
    it('log should include a line about amqp',() => {
      log = sink.getLog();
      console.log("LOGOUT finally: " + log);
      expect(log.indexOf(msg)).to.not.be.eq(-1);
    });
    
  })
});
