'use strict';

var winston = require('winston'),
  util = require('util'),
  firebaseAuth = require('./lib/firebaseAuth');

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
    this.customFormatter = options.customFormatter;

    //- Enabled loging of uncaught exceptions
    this.handleExceptions = options.handleExceptions || false;

    //- Authenticate firebase
    firebaseAuth(options, function(err, rootRef) {
      if (err) {
        throw err;
      } else {
        this.rootRef = rootRef;
      }
    }.bind(this));
  }
};

util.inherits(Firebase, winston.Transport);

//- Attaches this Transport to the list of available transports
winston.transports.Firebase = Firebase;
Firebase.prototype.log = function(level, msg, meta, callback) {

  //- Use custom formatter for message if set
  var message = this.customFormatter ? this.customFormatter(level, msg, meta) : msg;
  this.rootRef.push(message);
  callback(null, true);

};

module.exports = Firebase;
