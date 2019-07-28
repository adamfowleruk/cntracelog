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

var configuredAMQPTransports = {};

module.exports = {
  supported: function() {
    try {
      const winston = require('winston');
      return true;
    } catch (err) {
      console.log("cntracelog Error attempting to load Winston library. Using console.log instead. Error Message: ", err);
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
        var amqpT = configuredAMQPTransports[amqpKey];
        var amqpKey = options.amqp.uri + "|" + options.amqp.exchange + "|" + options.amqp.exchangeType + "|" + options.amqp.routingKey;
        if (undefined === amqpT) {
        var AMQPTransport = require("./winston-amqp-transport.js");
        if (undefined != options.amqp.uri) {
          var uri = options.amqp.uri;
          /*
          if (undefined !== options.amqp.exchange) {
            uri += options.amqp.exchange;
            if (undefined !== options.amqp.routingKey) {
              uri += "/" + options.amqp.routingKey;
            }
          }
          */
          //console.log("cntracelog AMQP URI now: " + uri);
          var aet = "topic";
          var ae = "logging-exchange";
          var ark = "";
          if (undefined != options.amqp.exchangeType) {
            aet = options.amqp.exchangeType;
          }
          if (undefined != options.amqp.exchange) {
            ae = options.amqp.exchange;
          }
          if (undefined != options.amqp.routingKey) {
            ark = options.amqp.routingKey;
          }
      //console.log("amqp exchange: " + ae);
      //console.log("amqp exchange type: " + aet);
      //console.log("amqp routing key: " + ark);
          amqpT =
            new AMQPTransport({
              uri: uri,
              /*
              uri: options.amqp.uri + exchange + "/" + ,
              */
              exchangeType: aet,
              exchange: ae,
              routingKey: ark

            });
            configuredAMQPTransports[amqpKey] = amqpT;
          }
          options.extensions.winston.transports.push(
            amqpT
          )
        }
      }
      //console.log("Winston options");
      //console.log(options);
      //console.log("Transport extensions:-");
      //console.log(options.extensions.winston.transports);
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