var app = require('./express').init()
    , http = require('http').Server(app);

const PORT = process.env.PORT || 3000;

http.listen(PORT, function() {
    console.log('Server running on port: ', PORT);
});
