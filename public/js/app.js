var nomsbase = angular.module('nomsbase',['ngRoute', 'ui.keypress']).
	config(function($routeProvider, $locationProvider) {
		$routeProvider.when('/test/:id', {
			templateUrl: '/partials/view',
			controller: 'Testing'
		});
		$locationProvider.html5Mode(true);
	});

nomsbase.controller('Add', function ($scope, $http) {
	$scope.data = {};
	$scope.data['name'] = "";
	$scope.data['ingredients'] = {};
	$scope.addIngredient = function() {
		if ($('#ingredient-name').val() && $('#ingredient-amount').val()) {
			//$scope.data.ingredients.push({'name':$('#ingredient-name').val(),'amount':$('#ingredient-amount').val()});
			$scope.data.ingredients[$('#ingredient-name').val()] = $('#ingredient-amount').val(); 
			$('#ingredient-name, #ingredient-amount').val('');
		}
	};
	$scope.save = function() {
			$http({
				url : 'http://localhost:3000/add',
				data : $scope.data,
				method : 'POST',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
	};
});

nomsbase.controller('View', function($scope, $http, $routeParams) {
	console.log($routeParams);
	$scope.data = {};
	$http({method:'GET', url: '/get/snowball'}).
		success(function(data, status, headers, config) {
			$scope.data = data;
			console.log($routeParams);
		});
});

function Testing($scope, $routeParams) {
	console.log('fuck');
}

