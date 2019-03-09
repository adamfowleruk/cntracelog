'use strict';
const Transport = require('winston-transport');
const util = require('util');

// A transport that outputs to a string
module.exports = class StringTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.ls = "";
  }

  log(info, callback) {
    this.ls += info.message + "\n";

    // Pass callback
    callback();
  }

  get logString() {
    return this.ls;
  }
};
