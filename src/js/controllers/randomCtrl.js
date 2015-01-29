'use strict';

var RandomCtrl = function($scope, $http, $location, $timeout, Page) {
	Page.setTitle('Randomizing...');
	$http({method:'GET', url: '/getrandom'})
		.success(function(data, status, headers, config) {	
			$timeout(function() {
				$location.path('/recipe/' + data.recipeid);
			}, 1500);
		});
};

module.exports = RandomCtrl;