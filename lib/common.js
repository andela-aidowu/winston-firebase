'use strict';

/*
 * common.js: File from winston commonjs file
 * https://github.com/winstonjs/winston/blob/master/lib/winston/common.js
 *
 *
 */

var util = require('util'),
  cycle = require('cycle');

//
// ### function clone (obj)
// #### @obj {Object} Object to clone.
// Helper method for deep cloning pure JSON objects
// i.e. JSON objects that are either literals or objects (no Arrays, etc)
//
exports.clone = function(obj) {
  //
  // We only need to clone reference types (Object)
  //
  if (obj instanceof Error) {
    return obj;
  } else if (!(obj instanceof Object)) {
    return obj;
  } else if (obj instanceof Date) {
    return obj;
  }

  var copy = {};
  for (var i in obj) {
    if (Array.isArray(obj[i])) {
      copy[i] = obj[i].slice(0);
    } else if (obj[i] instanceof Buffer) {
      copy[i] = obj[i].slice(0);
    } else if (typeof obj[i] != 'function') {
      copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];
    } else if (typeof obj[i] === 'function') {
      copy[i] = obj[i];
    }
  }

  return copy;
};

//
// ### function log (options)
// #### @options {Object} All information about the log serialization.
// Generic logging function for returning timestamped strings
// with the following options:
//
//    {
//      level:     'level to add to serialized message',
//      message:   'message to serialize',
//      meta:      'additional logging metadata to serialize',
//      colorize:  false, // Colorizes output (only if `.json` is false)
//      timestamp: true   // Adds a timestamp to the serialized message
//      label:     'label to prepend the message'
//    }
//
exports.log = function(options) {
  var timestampFn = typeof options.timestamp === 'function' ? options.timestamp : exports.timestamp;
  var timestamp = options.timestamp ? timestampFn() : null;
  var showLevel = options.showLevel === undefined ? true : options.showLevel;
  var meta = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error) ? exports.clone(cycle.decycle(options.meta)) : options.meta || null;
  var output;


  //
  // json mode is intended for pretty printing multi-line json to the terminal
  //
  if (options.json || true === options.logstash) {
    if (typeof meta !== 'object' && meta != null) {
      meta = {
        meta: meta
      };
    }

    output = exports.clone(meta) || {};
    output.level = options.level;
    output.message = output.message || '';

    if (options.label) {
      output.label = options.label;
    }
    if (options.message) {
      output.message = options.message;
    }
    if (timestamp) {
      output.timestamp = timestamp;
    }

    if (typeof options.stringify === 'function') {
      return options.stringify(output);
    }

    return JSON.stringify(output, function(key, value) {
      return value instanceof Buffer ? value.toString('base64') : value;
    });
  }

  //
  // Remark: this should really be a call to `util.format`.
  //
  if (typeof options.formatter == 'function') {
    return String(options.formatter(exports.clone(options)));
  }

  output = timestamp ? timestamp + ' - ' : '';

  output += (timestamp || showLevel) ? ': ' : '';
  output += options.label ? ('[' + options.label + '] ') : '';
  if (meta !== null && meta !== undefined) {
    if (meta && meta instanceof Error && meta.stack) {
      meta = meta.stack;
    }

    if (typeof meta !== 'object') {
      output += ' ' + meta;
    } else if (Object.keys(meta).length > 0) {
      if (typeof options.prettyPrint === 'function') {
        output += ' ' + options.prettyPrint(meta);
      } else if (options.prettyPrint) {
        output += ' ' + '\n' + util.inspect(meta, false, options.depth || null, options.colorize);
      } else if (
        options.humanReadableUnhandledException && Object.keys(meta).length === 5 && meta.hasOwnProperty('date') && meta.hasOwnProperty('process') && meta.hasOwnProperty('os') && meta.hasOwnProperty('trace') && meta.hasOwnProperty('stack')) {

        //
        // If meta carries unhandled exception data serialize the stack nicely
        //
        var stack = meta.stack;
        delete meta.stack;
        delete meta.trace;
        output += ' ' + exports.serialize(meta);
        output += '\n' + stack.join('\n');
      } else {
        output += ' ' + exports.serialize(meta);
      }
    }
  }

  return output;
};

exports.capitalize = function(str) {
  return str && str[0].toUpperCase() + str.slice(1);
};

//
// ### function timestamp ()
// Returns a timestamp string for the current time.
//
exports.timestamp = function() {
  return new Date().toISOString();
};

//
// ### function serialize (obj, key)
// #### @obj {Object|literal} Object to serialize
// #### @key {string} **Optional** Optional key represented by obj in a larger object
// Performs simple comma-separated, `key=value` serialization for Loggly when
// logging to non-JSON inputs.
//
exports.serialize = function(obj, key) {
  if (obj === null) {
    obj = 'null';
  } else if (obj === undefined) {
    obj = 'undefined';
  } else if (obj === false) {
    obj = 'false';
  }

  if (typeof obj !== 'object') {
    return key ? key + '=' + obj : obj;
  }

  if (obj instanceof Buffer) {
    return key ? key + '=' + obj.toString('base64') : obj.toString('base64');
  }

  var msg = '',
    keys = Object.keys(obj),
    length = keys.length;

  for (var i = 0; i < length; i++) {
    if (Array.isArray(obj[keys[i]])) {
      msg += keys[i] + '=[';

      for (var j = 0, l = obj[keys[i]].length; j < l; j++) {
        msg += exports.serialize(obj[keys[i]][j]);
        if (j < l - 1) {
          msg += ', ';
        }
      }

      msg += ']';
    } else if (obj[keys[i]] instanceof Date) {
      msg += keys[i] + '=' + obj[keys[i]];
    } else {
      msg += exports.serialize(obj[keys[i]], keys[i]);
    }

    if (i < length - 1) {
      msg += ', ';
    }
  }

  return msg;
};
