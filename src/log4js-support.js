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
 * Adds support for log4js-node logging with AMQP support
 **/
module.exports = {
  supported: function() {
try {
  const log4js = require('log4js-node');
  return true;
} catch (err) {
  console.log("Error attempting to load log4js-node library. Using console.log instead. Error Message: ", err);
  return false;
}
},
createLogger: function(options, ns, contextID) {
    const log4js = require('log4js-node');
    // Check for optional logging features
    if (undefined !== options.amqp) {
      log4js.configure({
        appenders: {
          mq: {
            type: '@log4js-node/rabbitmq',
            host: options.amqp.uri, // TODO port, username, password as from uri
            routing_key: options.amqp.routingKey,
            exchange: options.amqp.exchange,
            mq_type: 'direct',
            durable: true
          }
        }
      });
    }
    var logger = log4js.getLogger(ns + '\t' + contextID); // TODO verify format
    return logger;
  }
}