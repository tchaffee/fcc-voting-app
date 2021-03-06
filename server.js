'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

var mongo_express = require('mongo-express/lib/middleware')
var mongo_express_config = require('./mongo_express_config')

var app = express();

var bodyParser = require('body-parser');

require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

app.set('trust proxy', 1);
app.set('view engine', 'pug');
app.set('views', [process.cwd() + '/public', process.cwd() + '/public/templates', process.cwd() + '/node_modules/pug-bootstrap']);
app.locals.basedir = process.cwd();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/mongo_express', mongo_express(mongo_express_config))

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
