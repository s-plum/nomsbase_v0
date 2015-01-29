'use strict';

var menuBreak = window.matchMedia('(min-width: 650px)');
var config = require('../config');

var NavCtrl = function($scope, $location, Page) {
	$scope.Page = Page;
	$scope.appConfig = config;
	$scope.urlRegex = /\s/g;
	$scope.searchTerm = '';

	$scope.searchRecipes = function(e) {
		e.preventDefault();
		var searchInput = document.querySelector('[data-ng-model="searchTerm"]');
		if ($scope.searchTerm.length === 0 || $scope.searchTerm.trim().length === 0) {
			searchInput.focus();
		}
		else {
			$location.path('/recipes/' + $scope.searchTerm);
			$scope.menuOpen = false;
			$scope.searchTerm = '';
			searchInput.blur();
		}
	}
	$scope.menuOpen = false;

	$scope.isHome = function() {
		return $location.$$path === '/';
	};

	$scope.toggleMenu = function(e) {
		//specific case for nav menu toggle button on small screens
		if (e.target.getAttribute('href') === '#nav') {
			e.preventDefault();
		}
		else {
			e.target.blur();
		}
		if (!menuBreak.matches && !$scope.isHome()) {
			$scope.menuOpen = !$scope.menuOpen;
		}
	};

	$scope.toHome = function() {
		Page.setTitle('nomsbase');
		$scope.menuOpen = false;
	};

	menuBreak.addListener(function() {
		$scope.menuOpen = false;
	});

	//animation of nav on first load
	$scope.homeLoaded = false;

	if (!$scope.homeLoaded) {
		setTimeout(function() {
			$scope.$apply(function() {
				$scope.homeLoaded = true;	
			});
		}, 500);
	}

	$scope.loaded = true;
};

module.exports = NavCtrl;