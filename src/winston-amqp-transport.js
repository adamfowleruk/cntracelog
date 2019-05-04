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
'use strict'
/**
 * A reliable, updated, AMQP transport for Winston
 */
const Transport = require('winston-transport');
const os = require('os');

// A transport that outputs to a string
module.exports = class CNAMQPTransport extends Transport {
  
  constructor(opts) {
    super(opts);
    this.opts = opts;
    this.ls = "";
    this.memoryCache = opts.memoryCache || false;
    this.mc = 0;
  }

  log(info, callback) {
    // add hostname and local timestamp
    // Using a string timestamp as JSON and long long numbers don't mix well
    var completeInfo = {message: info.message,level: info.level,timestamp:(new Date()).toISOString(),hostname: os.hostname()}
    if (undefined == this.outChannel) {
      // Connect to AMQP
      var that = this;
      var amqp = require('amqplib');
      //console.log("CNAMQPTransport got uri: " + that.opts.uri);
      amqp.connect(
        that.opts.uri
      ).then((cn) => {
        //console.log("CNAMQPTransport got connection");
        that.conn = cn;
        return that.conn.createChannel();
      }).then((outie) => {
        //console.log("CNAMQPTransport got out channel");
        that.outChannel = outie;
        that.outChannel.assertExchange(that.opts.exchange || "logging-exchange", that.opts.exchangeType || "topic", {
          durable: false
        });
      }).then(() => {
        //console.log("CNAMQPTransport got exchange");
        that.outChannel.publish(that.opts.exchange || "logging-exchange"
          , "", Buffer.from(JSON.stringify(completeInfo)));
        that.mc++;
        if (that.memoryCache) {
          that.ls += info.message + "\n";
        }
        //console.log("CNAMQPTransport sent log message");
        callback();
      }).catch((err) => {
        console.error("Problem opening CNAMQPTransport via AMQP", err);
        that.outChannel = undefined;
      });
    } else {
      this.outChannel.publish(that.opts.exchange || "logging-exchange"
        , "", Buffer.from(JSON.stringify(completeInfo)));
      this.mc++; 

      if (this.memoryCache) {
        this.ls += info.message + "\n";
      }

      // Pass callback
      callback();
    }
  }

  get logString() {
    return this.ls;
  }

  get messageCount() {
    return this.mc;
  }
};
