'use strict';

var SearchCtrl = function($scope, $http, $location, $routeParams, Page) {
	$scope.resultsLoaded = false;
	var id = $routeParams.id.split('-').join(' ');
	Page.setTitle('nomsbase query: ' + id);
	$scope.searchTerm = id.replace(/\+/g, '/');
	$scope.recipes = [];
	$http({method:'GET', url: '/search/'+id})
		.success(function(data, status, headers, config) {
			if (!data.error) {
				$scope.recipes = data;
				Page.setFooterPosition();
			}	
			$scope.resultsLoaded = true;
		})
		.error(function() {
			$scope.resultsLoaded = true;
		});
};

module.exports = SearchCtrl;