'use strict';

var config = require('./config');

var routeConfig = function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {});
	$routeProvider.when('/recipe/:id', {
		templateUrl: '/templates/view.html',
		controller: 'ViewCtrl'
	});
	$routeProvider.when('/recipe/:id/:name', {
		templateUrl: '/templates/view.html',
		controller: 'ViewCtrl'
	});
	$routeProvider.when('/recipes/:id', {
		controller: 'SearchCtrl',
		templateUrl: '/templates/search.html'
	});

	//new and edit only available in dev
	if (config.environment === 'dev') {
		$routeProvider.when('/new', {
			templateUrl: '/templates/edit.html',
			controller: 'NewCtrl'
		});
		$routeProvider.when('/edit/:id', {
			templateUrl: '/templates/edit.html',
			controller: 'EditCtrl'
		});
		$routeProvider.when('/edit/:id/:name', {
			templateUrl: '/templates/edit.html',
			controller: 'EditCtrl'
		});
	}
	
	$routeProvider.when('/random', {
		templateUrl: '/templates/random.html',
		controller: 'RandomCtrl'
	});
	$routeProvider.when('/404', {
		templateUrl: '/templates/404.html',
		controller: 'ErrorCtrl'
	});
	$routeProvider.otherwise({
		redirectTo: '/404'
	})
	$locationProvider.html5Mode({
	  enabled: true,
	  requireBase: false
	});
};

module.exports = routeConfig;