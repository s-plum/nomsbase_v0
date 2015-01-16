var nomsbase = angular.module('nomsbase',['ngRoute']).
	config(function($routeProvider, $locationProvider) {
		$routeProvider.when('/recipe/:id/:name', {
			templateUrl: '/partials/view',
			controller: 'View'
		});
		$routeProvider.when('/recipes/:id', {
			controller: 'Search',
			templateUrl: '/partials/search'
		});
		$routeProvider.when('/recipes', {
			controller: 'Search',
			templateUrl: '/partials/search'
		});
		$routeProvider.when('/new', {
			templateUrl: '/partials/edit',
			controller: 'New'
		});
		$routeProvider.when('/edit/:id', {
			templateUrl: '/partials/edit',
			controller: 'Edit'
		});
		$locationProvider.html5Mode({
		  enabled: true,
		  requireBase: false
		});
	});

nomsbase.controller('New', function ($scope, $http) {
	$scope.recipe = {};
	$scope.recipe.ingredients = [];
	$scope.recipe.tags = [];
	$scope.addIngredient = function() {
		$scope.recipe.ingredients.push({
			name: '',
			amount: 0,
			unit: ''
		});
	};
	$scope.addTag = function() {
		if ($scope.recipe.newtag && $scope.recipe.newtag.trim().length > 0) {
			$scope.recipe.tags.push($scope.recipe.newtag);
			$scope.recipe.newtag = '';
		}
	};
	$scope.removeItem = function(id, array) {
		$scope.recipe[array].splice(id, 1);
	};
	$scope.save = function() {
		$http({
			url : '/add',
			data : $scope.recipe,
			method : 'POST',
			contentType: 'application/json; charset=utf-8',
			dataType: 'json'
		});
	};
});

nomsbase.controller('Edit', function($scope, $http, $routeParams) {
	$scope.recipe = {};
	var id = $routeParams.id.split('-').join(' ');
	//get original recipe data
	$http({method:'GET', url: '/get/'+id + '?' + new Date().getTime()}).
		success(function(data, status, headers, config) {
			$scope.recipe = data;
		});
	$scope.addIngredient = function() {
		$scope.recipe.ingredients.push({
			name: '',
			amount: 0,
			unit: ''
		});
	};
	$scope.addTag = function() {
		if ($scope.recipe.newtag && $scope.recipe.newtag.trim().length > 0) {
			$scope.recipe.tags.push($scope.recipe.newtag);
			$scope.recipe.newtag = '';
		}
	};
	$scope.removeItem = function(id, array) {
		$scope.recipe[array].splice(id, 1);
	};
	$scope.save = function() {
		console.log($scope.data);
		$http({
			url : '/update/'+id,
			data : $scope.recipe,
			method : 'POST',
			contentType: 'application/json; charset=utf-8',
			dataType: 'json'
		});
	};
});

nomsbase.controller('View', function($scope, $http, $routeParams) {
	$scope.recipe = {};
	var id = $routeParams.id;
	$http({method:'GET', url: '/get/'+id})
		.success(function(data, status, headers, config) {
			if (!data.error) {
				$scope.recipe = data;
			}
			else {
				$http({method:'GET', url: '/partials/no-results'})
					.success(function(data, status, headers, config) {
						if (typeof data === 'string') {
							document.getElementsByTagName('main')[0].innerHTML = data;
						}
					});
			}
		})
		.error(function() {
			console.log('error');
		});
});

nomsbase.controller('Search', function($scope, $http, $routeParams) {
	$scope.data = [];
	if (typeof $routeParams.q != 'undefined') var id = $routeParams.q;
	else var id = $routeParams.id.split('-').join(' ');
	$scope.data.searchTerm = id;
	$http({method:'GET', url: '/search/'+id}).
		success(function(data, status, headers, config) {
			$scope.data.recipes = data;
			if (data.length > 0) {
				$.each($scope.data.recipes, function(index, value) {
					value['idName'] = value.name.split(' ').join('-').toLowerCase();
				});
			}
			else {
				$('div[ng-view]').append($('<p>No results found. You\'re doomed.</p>'));
			}
		});
});

nomsbase.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

module.exports = nomsbase;
