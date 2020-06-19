// *************************************************** //
// Configurationhandler class
//
// The configuration handler loads an initial configuration
// for the application and makes it accessible throughout
// the app.
// Every "magic value" should be stored here instead of the
// app code directly.
// NOTE: This should ALWAYS load first as the helper classes
// also depend on the configuration to be there!
//
// Author: dirk@songuer.de
// License: MIT, see /LICENSE
// *************************************************** //

var fileSystem = require('fs');
var filePath = require('path');

class ConfigurationhandlerClass {
    constructor() {
        this.configurationStorage = {};
    }

    // load the configuration from server
    // note the file is always ./configuration.json 
    loadConfiguration() {
        // load general server configuration
        let configurationFilePath = filePath.join(__dirname, '/../' + 'configuration.json');

        var rawConfiguration = JSON.parse(fileSystem.readFileSync(configurationFilePath));
        if ((typeof rawConfiguration.environment !== 'undefined') && (rawConfiguration[rawConfiguration.environment] !== 'undefined')) {
            console.log('Active environment found, using configuration for ' + rawConfiguration.environment);
            this.configurationStorage = rawConfiguration[rawConfiguration.environment];
        } else {
            this.configurationStorage = rawConfiguration;
        }
    }
}

// export default new ConfigurationhandlerClass();
var configurationHandler = new ConfigurationhandlerClass();
module.exports = configurationHandler;