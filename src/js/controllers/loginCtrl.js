'use strict';

var LoginCtrl = function($rootScope, $scope, $location, $http, Page) {
	Page.setTitle('Admin Login');

	$scope.user = {
		username: '',
		password: ''
	};

	$scope.login = function() {
		$http({
			method:'POST',
			url: '/login',
			data: $scope.user
		}).success(function(data, status, headers) {
				if (!data.isValid) {
					console.log(data.error);
					$location.path('/404').search('n', null);
				}
				else {
					console.log($location.$$search.n);
					$rootScope.user = $scope.user.username;
					$location.path($location.$$search.n || '/').search('n', null);
				}
			});
	};
	
};

module.exports = LoginCtrl;