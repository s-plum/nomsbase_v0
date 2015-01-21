//declare dependencies
var express = require('express'), //templating
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	mongoose = require('mongoose'),
	api = require('./routes/api'),
	//ObjectID = require('mongodb').ObjectID,
	distPath = '/dist'; 

//connect to database	
mongoose.connect('mongodb://localhost:27017/nomsbase');
var db = mongoose.connection;
db.once('connected', function() {
	console.log("Connected to database");
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.favicon(path.join(__dirname, distPath + '/img/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, distPath)));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//for views
app.get('/', routes.index);
app.get('/recipe/:id/:name', routes.index);
app.get('/new', routes.index);
app.get('/recipes', routes.index);
app.get('/recipes/:query', routes.index);
app.get('/edit/:id/:name', routes.index);
app.get('/random', routes.index);

//data get/set
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
