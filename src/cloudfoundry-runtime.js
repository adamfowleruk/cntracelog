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
/**
 * Support for (Pivotal) Cloud Foundry environment detection
 **/
module.exports = {
  supported: function() {
    // detect cloud foundry
    return undefined !== process.env.VCAP_SERVICES;
  },
  configure: function(options) {
    var cc;
    if (undefined !== (cc = process.env.VCAP_SERVICES)) {
      cc = JSON.parse(cc);
      // Cloud Foundry
      options.cli = false;
      // Check for logging-amqp connection
      if (undefined !== cc["logging-amqp"]) {
        // pass down amqp details
        options.amqp = {
          uri: cc["logging-amqp"].credentials.uri || "" // TODO verify the options here
          ,
          exchangeType: cc["logging-amqp"].exchangeType || "",
          exchange: cc["logging-amqp"].exchange || "",
          routingKey: cc["logging-amqp"].routingKey || ""
        };
      }
    }
  }
};
