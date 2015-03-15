//declare dependencies
var express = require('express'),
	app = express();
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	mongoose = require('mongoose'),
	api = require('./routes/api'),
	distPath = '/dist',
	dbStrings = require('./admin/db-connect'),
	env = app.get('env') || 'dev';

//connect to database	
mongoose.connect(dbStrings[env]);

var db = mongoose.connection;

db.once('connected', function() {
	console.log("Connected to database");
});

app.set('port', process.env.PORT || 3000);
app.use(express.favicon(path.join(__dirname, distPath + '/img/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, distPath)));

// development only
if (env === 'dev') {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

//data get/set
app.post('/login', api.validateUser(db));
app.post('/add', api.add(db));
app.post('/update/:id', api.update(db));
app.get('/get/:id', api.get(db));
app.get('/search/:query', api.search(db));
app.get('/getrandom', api.getRandom(db));

app.use(function(req, res, next){
    res.status(404).sendfile(path.resolve(__dirname + '/dist/index.html'));
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
