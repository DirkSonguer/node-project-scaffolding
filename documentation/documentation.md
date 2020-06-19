# General architecture
Start with the ./index.js and work your way along the code. The application works in two phases:
1) Data aggregation phase, in which the scraper classes are called in sequence
2) Data upload phase, in which first the vertices and then the edges are pushed into the database

Note that Weave first keeps all data in a local memory map and then uploads them one by one to the Graph database. That way we can make sure the data is internally coherent first as well as limit the database rate budget during the upload.

The application structure looks like this:

* /classes: Contains all helper classes used by Weave. This is more or less a loose assortment of helpful things, not a full framework
* /data: Contains all static data that will end up in the Weave Graph
* /mockservice: A mockservice exists that emulates all online data platforms, allowing to develop and run locally without an internet connection.
* /scrapers: Each file represents a class to get specific types of content from the data platforms
* /structures: The prototype structures for vertices and edges
* ./configuration.json: Contains the application config for running locally and in production
* ./index.js: The main script
