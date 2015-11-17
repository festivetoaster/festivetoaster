var express = require('express');
var db = require('./config.js');


var app = express();

// mongoose.connect('mongodb://localhost/shortly'); // connect to mongo database named shortly

// configure our server with all the middleware and and routing
require('./config/middleware.js')(app, express);

// export our app for testing and flexibility, required by index.js

app.listen(process.env.PORT || 8000);

module.exports = app;
