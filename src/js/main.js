var angular = require('angular');
require('angular-router-browserify')(angular);
var	nomsbase = require('./app');

var menuBreak = window.matchMedia('(min-width: 599px)');

//main nav
nomsbase.controller('NavMenu', function($scope, $rootScope, $location) {
	$scope.location = $location.$$path;

	$rootScope.menuOpen = false;

	$rootScope.toggleMenu = function(e) {
		e.preventDefault();
		if (!menuBreak.matches) {
			$rootScope.$evalAsync(function() {
				$rootScope.menuOpen = !$rootScope.menuOpen;
			});
		}
	};

	menuBreak.addListener(function() {
		$rootScope.$evalAsync(function() {
			$rootScope.menuOpen = false;
		});
	});
});
