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
    if (undefined !== svcInfo["amqp-log-sink"]) {
      return svcInfo["amqp-log-sink"].credentials.uri;
    }
  }

  return "amqp://localhost";
};

// CONSTANTS
// TODO get these from cloud too
const ex = 'log-sink-exchange';

var conn = null;

async function doConnect() {
  var log = stepslog.createChild("connect");
  log.info("in easyworkflow-step doConnect");
  return amqp.connect(
    rabbitUrl()
  ).then((cn) => {
    log.info("Got connection object");
    conn = cn;
    return conn;
  }).error((err) => {
    log.error("Error connecting to rabbit mq in doConnect. Returning. : ", err);
    throw err;
  });
};

// TODO let service die immediately if the underlying connection fails (Cloud Native)

function doSink() {
  var inChannel;
  var q;

  // TODO open target log file first

  return conn.createChannel({
      noAck: false,
      autoAck: true
    }).then((ch) => {
      inChannel = ch;
      inChannel.assertExchange(ex, 'direct', {
        durable: true
      });

      return inChannel.assertQueue(classname, {
        exclusive: false
      });
    }).then((quu) => {
      q = quu;

      return inChannel.bindQueue(q.queue, ex, classname);
    }).then((ok) => {
      return inChannel.consume(q.queue, async (msg) => {
        var line = msg.content.toString();

        // TODO process log line
      });
    });
}

module.exports = {
  connect: doConnect,
  sink: doSink
};