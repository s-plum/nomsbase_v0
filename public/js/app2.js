angular.module('nomsbase', ['ui.keypress']).
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider.when('/', {
			templateUrl: 'index',
			controller: IndexController
		});
	}]);