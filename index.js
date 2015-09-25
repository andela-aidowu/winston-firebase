'use strict';

var winston = require('winston'),
  util = require('util'),
  firebaseAuth = require('firebase-auth'),
  common = require('./lib/common');

var Firebase = exports.Firebase = function(options) {
  options = options || {};
  if (!options.secretKey || !options.rootRef || !options.UID) {
    throw new Error("options cannot be null");
  } else {
    this.rootRef = options.rootRef;
    this.secretKey = options.secretKey;
    this.UID = options.UID;
    this.level = options.level || 'info';
    this.silent = options.silent || false;
    this.raw = options.raw || false;
    this.json = options.json || true;
    this.name = options.name || 'firebase';
    this.formatter = options.formatter;

    //- Enabled loging of uncaught exceptions
    this.handleExceptions = options.handleExceptions || false;

    //- Authenticate firebase
    this.rootRefPromise = firebaseAuth(options);
  }
};

util.inherits(Firebase, winston.Transport);

//- Attaches this Transport to the list of available transports
winston.transports.Firebase = Firebase;

Firebase.prototype.log = function(level, msg, meta, callback) {

  //- Use custom formatter for message if set
  var output = common.log({
    level:       level,
    message:     msg,
    meta:        meta,
    json:        this.json,
    logstash:    this.logstash,
    colorize:    this.colorize,
    prettyPrint: this.prettyPrint,
    timestamp:   this.timestamp,
    showLevel:   this.showLevel,
    label:       this.label,
    depth:       this.depth,
    formatter:   this.formatter,
    humanReadableUnhandledException: this.humanReadableUnhandledException
  });
  this.rootRefPromise.then(function(rootRef) {
    rootRef.push(JSON.parse(output), function(err) {
      callback(err, true);
    });
  });
};

module.exports = Firebase;
