var MongoClient = require('mongodb').MongoClient
    ,  url = "mongodb://localhost:27017/capacitacao";

var database = {
    init: function (callback) {
        MongoClient.connect(url, function(err, database) {
            if(err) throw err;

            callback(database);
        });
    },
    collection: function(collection, callback) {
        MongoClient.connect(url, function(err, database) {
            if (err) {
                throw err;
            }
            database.collection(collection, function (err, coll) {
                callback(coll);
                database.close();
            });
        });
    }
};

module.exports = database;
