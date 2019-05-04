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
const amqp = require('amqplib');

/**
 * A logging library independent way to get AMQP log messages 
 * and send them to a named file
 */
function rabbitUrl() {
  if (process.env.VCAP_SERVICES) {
    var svcInfo = JSON.parse(process.env.VCAP_SERVICES);
    if (undefined !== svcInfo["amqp-log-sink"] && undefined !== svcInfo["amqp-log-sink"].credentials) {
      return svcInfo["amqp-log-sink"].credentials.uri;
    }
  }

  return "amqp://localhost";
};

// CONSTANTS
// TODO get these from cloud too
const ex = 'logging-exchange';

var conn = null;

// TODO let service die immediately if the underlying connection fails (Cloud Native)

var log = "";

function doSink(options) {
  //console.log("AMQPSINK: doSink");
  var inChannel;
  var q;

  // TODO open target log file first

  return amqp.connect(
      rabbitUrl()
    ).then((cn) => {
      //console.log('AMQPSINK: got connection');
      conn = cn;
      return conn.createChannel({
      noAck: false,
      autoAck: true
    });
    }).then((ch) => {
      c//onsole.log("AMQPSINK: got channel");
      inChannel = ch;
      inChannel.assertExchange(ex, 'topic', {
        durable: false
      });

      return inChannel.assertQueue("amqpsink", {
        exclusive: false
      });
    }).then((quu) => {
      q = quu;
      //console.log("AMQPSINK: Got queue");
      //console.log(q);

      return inChannel.bindQueue(q.queue, ex, "");
    }).then((ok) => {
      return inChannel.consume(q.queue, async (msg) => {
        //console.log("AMQPSINK: consume");
        var line = msg.content.toString();

        // TODO process log line
        if (true == options.memoryCache) {
          log += line + "\n";
        }
      });
    }).catch((err) => {
      console.log("AMQPSINK: Error in amqpsink doSink", err);
    });
}

function getLog() {
  return log;
}

module.exports = {
  sink: doSink,
  getLog: getLog
};