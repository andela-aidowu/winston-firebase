winston-firebase
==========
Basic transport that works just like all other winston transports. Sends logged messages to a specified firebase ref


## Installation
  ```
  npm install winston-firebase --save
  ```
## Additional options
  * **rootRef**: your firebase ref,

  * **secretKey**: Firebase secret key, you can get from your dashboard,

  * **UID**: user ID,

  * **admin**: true or false

## Usage
  ```
  'use strict';

  var winston = require('winston');
  var winstonFirebase = require('winston-firebase').Firebase;

  var logger = new winston.Logger({
    transports: [
      new winston.transports.Firebase({
        rootRef: 'https://<YOUR_FIREBASE_URL>.firebaseio.com/',
        secretKey: FIREBASE_SECRET_KEY,
        UID: FIREBASE_UID,
        admin: true,
        level: 'error',
      })
    ],
    exitOnError: false
  });
  ```


## Contributing

Fork and submit pull requests to improve this repo

## Issues

Yes, there would be bugs or feature requests.

Please open an issue and I would try to reply as soon as possible

## Release History

* 0.2.0 Initial release
