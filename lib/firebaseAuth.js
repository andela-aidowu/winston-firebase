'use strict';

var Firebase = require("firebase"),
    FirebaseTokenGenerator = require("firebase-token-generator");

// Authenticate the server to Firebase
module.exports =  function(options, cb) {
  var rootRef = new Firebase(options.rootRef);
  var tokenGenerator = new FirebaseTokenGenerator(options.secretKey);
  var token = tokenGenerator.createToken(
    {uid: options.UID},
    {admin: options.admin}
  );
  rootRef.authWithCustomToken(token, function(error, authData) {
    if(error) {
      cb(error);
    }
    else {
      console.log(authData);
      cb(null, rootRef);
    }
  });
};
