//declare dependencies
var express = require('express'),
	app = express();
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	mongoose = require('mongoose'),
	api = require('./routes/api'),
	distPath = '/dist',
	bodyParser = require('body-parser'),
	env = app.get('env') || 'dev';

require('dotenv').load();

//connect to database	
mongoose.connect('mongodb://localhost:27017/nomsbase');

var db = mongoose.connection;

db.once('connected', function() {
	console.log("Connected to database");
});

app.set('port', process.env.PORT || 3000);
app.use(express.favicon(path.join(__dirname, distPath + '/img/favicon.ico')));
app.use(express.logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, distPath)));

// development only
if (env === 'dev') {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/robots.txt', function(req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /");
});

//data get/set
app.post('/login', api.validateUser(db));
app.post('/recipe', api.update);
app.post('/recipe/:id', api.update);
app.get('/get/:id', api.get(db));
app.get('/search/:query', api.search(db));
app.get('/getrandom', api.getRandom(db));

app.use(function(req, res, next){
    res.status(404).sendfile(path.resolve(__dirname + '/dist/index.html'));
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
