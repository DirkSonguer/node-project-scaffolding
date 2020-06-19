// *************************************************** //
// Storagehandler class
//
// This script acts as the global storage.
// Basically it acts as a super simple key / value database.
// Usually you should use something like Cosmos Db or
// another storage / cache, but this class acts as
// an in-memory data storage since we don't have that
// much data anyway.
//
// Author: dirk@songuer.de
// License: MIT, see /LICENSE
// *************************************************** //

// The log handler provides simple logging capabilities via
// console of file output.
var logHandler = require('./loghandler.js');

class StoragehandlerClass {
    constructor() {
        this.dataStorage = new Map();
    }

    /**
     * Store a new item to the map.
     * TODO: Maybe this should also prevent collisions?
     *
     * @param {string} key The ID of the object that will be used to identify it in the map.
     * @param {object} value The object to store in the map.
     * @returns {boolean} Write state.
     */
    set(key, value) {
        logHandler.log('Storing data for key ' + key, 0);

        if (!key) {
            logHandler.log('Error storing data for key: Required ID missing', 2);
            return false;
        }

        if (this.exists(key)) {
            logHandler.log('The key ' + key + ' already exists - Replacing!', 2);
        }

        // Add object to storage.	
        this.dataStorage.set(key, value);

        // Done.
        return true;
    }

    /**
     * Retrieve an item from the map.
     *
     * @param {string} key The ID of the object to retrieve.
     * @returns {object} The found object. This will be null if no object with ths key exists.
     */
    get(key) {
        logHandler.log('Retrieving data for key ' + key, 0);

        // Get actual value.
        let returnData = this.dataStorage.get(key);

        // Check if the data is an object. If so, we'll.. turn it
        // into an object again. Don't ask, this fixes an issue
        // with some versions of restify.
        if ((typeof returnData === 'object') && (returnData.type !== 'SessionObject')) {
            returnData = (JSON.parse(JSON.stringify(returnData)));
        }

        // Return object from storage.
        return returnData;
    }

    /**
     * Retrieve all data items with a specific property + value.
     *
     * @param {string} property The property in the object to search for.
     * @param {string} value The value the property should have.
     * @returns {[object]} An array of objects.
     */
    getByProperty(property, value) {
        logHandler.log('Retrieving data that has property ' + property + '=' + value, 0);

        // Create return object.
        let returnData = new Array();

        // Iterate all data objects, check if the property exists
        // and has the given value.
        let dataItem = new Map();
        for (dataItem of this.dataStorage.values()) {
            if (dataItem[property] == value) {
                returnData.push(dataItem);
            }
        }

        // Return found objects from storage.	
        return returnData;
    }

    /**
     * Check if a data item exists in the map.
     *
     * @param {string} key The ID of the object.
     * @returns {boolean} Flag if object exists.
     */
    exists(key) {
        logHandler.log('Checking if data exists for key ' + key, 0);

        // Done.
        return this.dataStorage.has(key);
    }

    /**
     * Deletes an object from the map.
     *
     * @param {string} key The ID of the object.
     * @returns {boolean} Delete state.
     */
    delete(key) {
        logHandler.log('Deleting data with key ' + key, 0);

        // Remove the object from the map.
        this.dataStorage.delete(key);

        // Done.
        return true;
    }

    /**
     * Creates a nice, URL safe id from a string.
     *
     * @param {string} identifier The id to process.
     * @returns {string} A safe identifier.
     * Resolve: Returns the database result.
     * Reject: Returns the error message as given by database.
     */
    createIdentifier(identifier) {
        logHandler.log('Creating safe ID for: ' + identifier, 0);

        // Turn &nbsp; into "real" spaces.
        var newIdentifier = identifier.split('\xa0').join(" ");

        // Baseline rules: Everything lower case and only URL safe chars.
        newIdentifier = newIdentifier.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // In case we had strings like " & ", turn them into only one "_"
        // instead of three.
        newIdentifier = newIdentifier.split("___").join("_");

        // Done.
        return newIdentifier;
    }
}

// Export default new StoragehandlerClass();
var storageHandler = new StoragehandlerClass();
module.exports = storageHandler;