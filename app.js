//declare dependencies
var express = require('express'), //templating
	partials = require('express-partials'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	mongoose = require('mongoose');

//connect to database	
mongoose.connect('mongodb://localhost:27017/mydb');
var db = mongoose.connection;
db.once('connected', function() {
	console.log("Connected to database")
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(partials());
app.engine('ejs', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.favicon(path.join(__dirname, '/public/img/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '/public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//for views
app.get('/', routes.index);
app.get('/recipe/:id', routes.recipe);
app.get('/test/:id', routes.test);
app.get('/partials/:name', routes.partials);

//data get/set
app.post('/add', routes.add(db));
app.get('/get/:id', routes.get(db));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
