var express = require('express')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , conn = require('./database')
    , db;


function databaseConnection() {
    conn.init(function (database) {
        db = database;
    });
}


function initMiddleware(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(methodOverride());
}

function initRoutes(app) {

    app.get('/', function (request, response) {
        response.writeHead(200, {'Content-type': 'text/html'});
        response.write('<h2>Server</h2>');
        response.end();
    });


    //https://docs.mongodb.com/manual/reference/method/db.collection.find/
    app.get('/users', function (request, response) {
        db.collection('Users').find({}).toArray(function (err, results) {
            if (err) {
                response.json({
                    code: err.code,
                    message: err.message
                });
                return;
            }
//
            response.json(results);
        });
    });

    app.get('/users/:email', function (request, response) {
        db.collection('Users').findOne({email: request.params.email}, {_id: 0})
            .then(function (result) {
                response.json(result);
            })
            .catch(function (err) {
                response.json({
                    code: err.code,
                    message: err.message
                });
            });

    });

    //https://docs.mongodb.com/manual/reference/operator/query/gt/#op._S_gt
    app.get('/users/age/:age', function (request, response) {
        var options = {
            age: {$gt: parseInt(request.params.age)}
        };
        db.collection('Users').find(options).toArray(function (err, docs) {
            if (err) {
                console.log(err);
            }
            response.json(docs);
        });
    });


    app.get('/users/username/:username', function (request, response) {
        db.collection('Users').aggregate(
            {$match: {username: {$eq: request.params.username}}},
            {$project: {_id: 0, email: 1, username: 1}},
            function (err, results) {
                if (err) {
                    response.json({
                        code: err.code,
                        message: err.message
                    });
                    return;
                }
                response.json(results);
            });
    });

    app.post('/users', function (request, response) {
        console.log(request.headers);
        console.log(request.body);
        var doc = request.body;
        db.collection('Users').insertOne(doc)
            .then(function (result) {
                response.json(result);
            }).catch(function (err) {
            response.json({
                code: err.code,
                message: err.message
            });
        });

    });

    app.put('/users/:email', function (request, response) {
        db.collection('Users').updateOne(
            {
                email: request.params.email
            },
            {
                $set: {
                    email: request.body.email
                }
            })
            .then(function (result) {
                response.json(result);
            })
            .catch(function (err) {
                response.json({
                    code: err.code,
                    message: err.message
                });
            });
    });

    app.delete('/users/:email', function (request, response) {
        db.collection('Users').deleteOne({email: request.params.email})
            .then(function (result) {
                response.json(result);
            })
            .catch(function (err) {
                response.json({
                    code: err.code,
                    message: err.message
                });
            });
    });
}

//
function init() {
    var app = express();
    initMiddleware(app);
    databaseConnection();
    initRoutes(app);

    return app;
}

module.exports.init = init;