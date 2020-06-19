// *************************************************** //
// Storagesearch class.
//
// This script is an addition to the StorageHandler.js
// and provides search functionality.
//
// Author: dirk@songuer.de
// License: MIT, see /LICENSE
// *************************************************** //

// The log handler provides simple logging capabilities via
// console of file output.
var logHandler = require('./loghandler.js');

// configuration handler
var configurationHandler = require('./configurationhandler.js');

// The storage handler provides in-memory database-like
// functionalities. It's used as a cache to avoid rate
// limitations.
var storageHandler = require('./storagehandler.js');

/**
 * This class provides an interface for a Gremlin.
 *
 * @class
 */
class StorageSearch {
    constructor() {}

    /**
     * Search all data items with specific properties + values.
     * 
     * Each property to search in is given individually as a query
     * object, containing the property name, the search terms and a
     * flag if finding the terms is mandatory to acknowledge the result.
     * 
     * [
     * 	{
     * 		searchProperty: "STRING",
     * 		searchTerms: ["ARRAY", "OF", "STRING"],
     * 		mandatory: boolean
     * 	}, ..
     * ]
     * 
     * The query objects should be ordered by importance, meaning the more
     * important a property is, the earlier it should be in the array.
     * Note that propertiesToSearchIn and searchTerms are arrays!
     *
     * @param {[array]} queryObjects The search queries as described above.
     * @param {int} minimumWeight The threshold of relevant items as SearchWeight.
     * @returns {[object]} An array of objects.
     */
    search(queryObjects, minimumWeight = 0) {
        logHandler.log('Searching storage, got ' + queryObjects.length + ' query objects', 0);

        // Create return object.
        var returnData = new Array();

        // These are functionally equivalent words.
        // To make sure we can connect the use of equivalent words to their original meaning,
        // we add a lookup here.
        // Example: Making sure that "Yo!" also identifies "Hello!".
        var synonyms = new Array("yo!", "", "");
        var equivalents = new Array("hello", "", "");

        // Go through the search terms and check if there are functional equivalents.
        queryObjects.forEach((query) => {
            logHandler.log("Looking at property " + query.searchProperty + " to find " + query.searchTerms, 0);
            query.searchTerms.forEach(element => {
                if (synonyms.includes(element.toLowerCase())) {
                    // If an equivalent has been found, add it to the search terms.
                    var equivalentIndex = synonyms.indexOf(element.toLowerCase());
                    logHandler.log("Identified functional equivalent for " + element + ", adding " + equivalents[equivalentIndex] + " to search terms", 0);
                    query.searchTerms.push(equivalents[equivalentIndex]);
                }
            });
        });

        // Create an index of stop words that are not relevant for the search.
        var stopwords = new Array("a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amoungst", "amount", "an", "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are", "around", "as", "at", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom", "but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven", "else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thick", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the");

        // These are stop words that are specific for a use case.
        // Usually these are homonyms, which makes them useless to search for.
        // Other examples might be overused words that lost their meaning.
        stopwords.push("", "");

        // This will keep the weight for a result item.
        // The more often a term is found, the higher its weight will be.
        var weightedSearchResults = new Object();

        // Iterate all data objects currently in storage.
        // Since all storage items are in memory, it's pretty ok to iterate
        // over all items as long as the map doesn't get too big.
        storageHandler.dataStorage.forEach(dataItem => {
            logHandler.log("Looking at data object " + dataItem.id, 0);

            // The developer can call this function with n search queries.
            // This will keep track of the number of the queries that were found relevant
            // for the current storage data object.
            var foundSearchQueries = 0;

            // Iterate all given search queries.
            // Each data object in storage is searched for each search query.
            queryObjects.forEach((query) => {
                logHandler.log("Looking at query for property " + query.searchProperty, 0);
                // The developer can call this function with n search terms for a given property.
                // This will keep track if the search terms have been found in the current storage data object.
                var foundSearchTerms = 0;

                // Iterate all search terms given.
                query.searchTerms.forEach((searchTerm, termIndex) => {
                    logHandler.log("Looking at search term " + searchTerm, 0);

                    // Check if the search term is a stop word.
                    // If so, ignore the search term.
                    // Actually, delete the search term from the query since
                    // we do not want to ignore it every round - it should simply
                    // not come up anymore.
                    if (stopwords.includes(searchTerm.toLowerCase())) {
                        delete query.searchTerms[termIndex];
                        return;
                    }

                    // Check if a search term is longer than 3 characters,
                    // otherwise ignore it.
                    // Actually, delete the search term from the query since
                    // we do not want to ignore it every round - it should simply
                    // not come up anymore.
                    if (searchTerm.length < 3) {
                        delete query.searchTerms[termIndex];
                        return;
                    }

                    // Check if the current data item even has the property to
                    // search in - if not, then ignore it.
                    if (typeof dataItem[query.searchProperty] === "undefined") {
                        return;
                    }

                    // Check if the search term has been found and how often it occurs in the property.
                    var searchTermOccurances = this.countOccurrences(dataItem[query.searchProperty].toLowerCase(), searchTerm.toLowerCase());
                    if (searchTermOccurances > 0) {
                        // Search term has been found.
                        foundSearchTerms += 1;

                        // searchTermOccurances means the more the better.
                        var searchResultWeight = searchTermOccurances * 3;

                        // Check if the item is already in the result list.
                        // If not, add it to the results object.
                        if (!weightedSearchResults[dataItem.id]) {
                            weightedSearchResults[dataItem.id] = searchResultWeight;
                        } else {
                            weightedSearchResults[dataItem.id] += searchResultWeight;
                        }

                        logHandler.log("Found " + searchTerm + " in property " + query.searchProperty + " for item " + dataItem.id + ", adding weight " + searchResultWeight + "(" + weightedSearchResults[dataItem.id] + " total)", 0);
                    }
                });

                // If any of the search terms have been found in the current query,
                // then increase the number of relevant queries.
                if (foundSearchTerms > 0) {
                    logHandler.log("Found search term this round, increasing query counter", 0);
                    foundSearchQueries += 1;
                }

                // Check if all the search terms have been found.
                // If that's the case, add additional weight to the search result.
                if (foundSearchTerms == query.searchTerms.length) {
                    weightedSearchResults[dataItem.id] += 10;
                    logHandler.log("Adding all terms bonus for " + dataItem.id + "! Total is now " + weightedSearchResults[dataItem.id], 0);
                }
            });

            // Check if all the search queries applied to the current data object.
            // If that's the case, add additional weight to the search result.
            if (queryObjects.length == foundSearchQueries) {
                weightedSearchResults[dataItem.id] += 100;
                logHandler.log("Adding all queries bonus " + dataItem.id + "! Total is now " + weightedSearchResults[dataItem.id], 0);
            }
        });

        // Convert the found results to an array that can be sorted.
        var weightedSortedSearchResults = [];
        for (var resultItem in weightedSearchResults) {
            weightedSortedSearchResults.push([resultItem, weightedSearchResults[resultItem]]);
        }

        // Sort the result array by their weight.
        weightedSortedSearchResults.sort(function(a, b) { return b[1] - a[1] });

        // Fill return data object based on sorted result list.
        weightedSortedSearchResults.forEach(searchResultItem => {
            if ((searchResultItem[0] != 'undefined') && (searchResultItem[1] > minimumWeight)) {
                var returnDataObject = storageHandler.get(searchResultItem[0]);
                returnDataObject.SearchWeight = searchResultItem[1];
                returnData.push(returnDataObject);
            }
        });

        // Return search results.	
        return returnData;
    }


    /**
     * Helper function to get number of occurances in string.
     * Credit: https://stackoverflow.com/a/7924240/4207037
     *
     * @param {string} string The string to search in.
     * @param {string} subString The string to search for.
     * @param {boolean} allowOverlapping Allow overlapping strings.
     * @returns {int} The number of occurances.
     */
    countOccurrences(string, subString, allowOverlapping) {
        string += "";
        subString += "";
        if (subString.length <= 0) return (string.length + 1);

        var n = 0,
            pos = 0,
            step = allowOverlapping ? 1 : subString.length;

        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    }
}

// Export default new StorageSearch();
var storageSearch = new StorageSearch();
module.exports = storageSearch;