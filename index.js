// *************************************************** //
// Node project scaffolding.
//
// This repo provides a simple scaffolding for Node.js
// based projects.
//
// Project site:
// https://github.com/DirkSonguer/node-project-scaffolding
//
// Author: dirk@songuer.de
// License: MIT, see /LICENSE
// *************************************************** //

// Use strict for ES6 and other things.
"use strict";

// The configuration handler loads an initial configuration
// for the application and makes it accessible throughout
// the app.
// Every "magic value" should be stored here instead of the
// app code directly.
// NOTE: This should ALWAYS load first as the helper classes
// also depend on the configuration to be there!
var configurationHandler = require('./classes/configurationhandler.js');
configurationHandler.loadConfiguration();

// The log handler provides simple logging capabilities via
// console of file output.
var logHandler = require('./classes/loghandler.js');

// The storage handler provides in-memory database-like
// functionalities. It's used as a cache to avoid rate
// limitations.
var storageHandler = require('./classes/storagehandler.js');

// The storage search allows searching over the local storage.
var storageSearch = require('./classes/storagesearch.js');

// Restify provides a REST server.
// See https://github.com/restify/node-restify
var restify = require('restify');

// Add the structure for reference objects.
var Vertex = require('./structures/someobject.js');
var Edge = require('./structures/anotherobject.js');


// Create a new server and make it listen on the given system port or 1337.
// Show a console message on startup.
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 1337, function() {
    logHandler.log(server.name + ' listening to ' + server.url, 1);
});

// Serve a hello world web page as the default frontend.
server.get('/*', restify.plugins.serveStatic({
    directory: './web/',
    default: 'index.html'
}));