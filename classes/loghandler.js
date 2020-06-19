// *************************************************** //
// Loghandler class
//
// This script is a super simple logger.
// Yes, I know I should use Winston or Bunyan, but this
// is a simple web app, ok?
//
// Author: dirk@songuer.de
// License: MIT, see /LICENSE
// *************************************************** //

// configuration handler
var configurationHandler = require('./configurationhandler.js');

// node utilities
var util = require('util');

// file system
var fileSystem = require('fs');
var filePath = require('path');

class LoghandlerClass {
    constructor() {
        if (configurationHandler.configurationStorage.logging.logTarget == 'FILE') {
            this.writeStream = fileSystem.createWriteStream(configurationHandler.configurationStorage.logging.logFile);
        }
    }

    // send a message to a specific socket
    log(message, severity) {
        // convert from object to string	
        if (typeof message === 'object') {
            message = util.inspect(message, { depth: null });
        }

        if (severity >= configurationHandler.configurationStorage.logging.logLevel) {
            // define colours
            let messagecolor = "\x1b[0m";
            if (severity == 2) messagecolor = "\x1b[32m";
            if (severity == 3) messagecolor = "\x1b[35m";
            if (severity > 3) messagecolor = "\x1b[31m";

            if (configurationHandler.configurationStorage.logging.logTarget == 'FILE') {
                // write message to file stream
                this.writeStream.write('L' + severity + ' # ' + Date.now() + ' # ' + process.pid + ' # ' + message + "\n");
            } else {
                // write message to console
                console.log(messagecolor + 'L' + severity + ' # ' + Date.now() + ' # ' + process.pid + ' # ' + message);
            }
        }

        // done
        return true;
    }
}

// export default new LoghandlerClass();
var logHandler = new LoghandlerClass();
module.exports = logHandler;