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
 * Adds safe Winston logging library detection and configuration
 **/

module.exports = {
  supported: function() {
    try {
      const winston = require('winston');
      return true;
    } catch (err) {
      console.log("Error attempting to load Winston library. Using console.log instead. Error Message: ", err);
      return false;
    }
  },
  createLogger: function(options, ns, contextID) {
      const winston = require('winston');
      // Check for optional logging features
      if (undefined !== options.amqp) {
        /*
        require("amqp-winston");
        const AMQPTransport = winston.transports.AMQP;
        */
        var AMQPTransport = require("./winston-amqp-transport.js");
        var uri = options.amqp.uri;
        /*
        if (undefined !== options.amqp.exchange) {
          uri += options.amqp.exchange;
          if (undefined !== options.amqp.routingKey) {
            uri += "/" + options.amqp.routingKey;
          }
        }
        */
        console.log("AMQP URI now: " + uri);
        options.extensions.winston.transports.push(
          new AMQPTransport({
            uri: uri,
            /*
            uri: options.amqp.uri + exchange + "/" + ,
            */
            exchangeType: options.amqp.exchangeType || "topic",
            exchange: options.amqp.exchange || "logs",
            routingKey: options.amqp.routingKey || ""
            
          })
        )
      }
      var logger = winston.createLogger({
        level: options.level,
        defaultMeta: {
          service: ns,
          requestId: contextID
        },
        transports: [
          new winston.transports.Console({
            format: options.cli ? winston.format.cli() : winston.format.simple()
          }),
          ...options.extensions.winston.transports
        ]
      });
      return logger;
  }
}