'use strict';

var routes = require('./routes');
var services = require('./services');
var controllers = require('./controllers/index');
var auth = require('./auth');

var nomsbase = angular.module('nomsbase',['ngRoute', 'ngAria'])
	.config(routes)
	.run(auth);


for (var s in services) {
	nomsbase.factory(s, services[s]);
}

for (var c in controllers) {
	nomsbase.controller(c, controllers[c]);
}

module.exports = nomsbase;
