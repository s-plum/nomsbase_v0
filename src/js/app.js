var menuBreak = window.matchMedia('(min-width: 650px)');

var nomsbase = angular.module('nomsbase',['ngRoute'])
	.config(function($routeProvider, $locationProvider) {
		$routeProvider.when('/', {});
		$routeProvider.when('/recipe/:id/:name', {
			templateUrl: '/templates/view.html',
			controller: 'View'
		});
		$routeProvider.when('/recipes/:id', {
			controller: 'Search',
			templateUrl: '/templates/search.html'
		});
		$routeProvider.when('/new', {
			templateUrl: '/templates/edit.html',
			controller: 'New'
		});
		$routeProvider.when('/edit/:id', {
			templateUrl: '/templates/edit.html',
			controller: 'Edit'
		});
		$routeProvider.when('/404', {
			templateUrl: '/templates/404.html'
		});
		$routeProvider.otherwise({
			redirectTo: '/404'
		})
		$locationProvider.html5Mode({
		  enabled: true,
		  requireBase: false
		});
	});

nomsbase.factory('Page',function() {
	var title = 'nomsbase';
	return {
		title: function() { return title; },
		setTitle: function(newTitle) { title = newTitle }
	}
});

nomsbase.controller('MainCtrl', function($scope, $location, Page) {
	$scope.Page = Page;
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
		e.preventDefault();
		if (!menuBreak.matches) {
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

nomsbase.controller('View', function($scope, $http, $routeParams, Page) {
	$scope.recipe = {};
	var id = $routeParams.id;
	$http({method:'GET', url: '/get/'+id})
		.success(function(data, status, headers, config) {
			if (!data.error) {
				Page.setTitle(data.name);
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

nomsbase.controller('Search', function($scope, $http, $location, $routeParams, Page) {
	$scope.resultsLoaded = false;
	var id = $routeParams.id.split('-').join(' ');
	Page.setTitle(id + ' recipes');
	$scope.searchTerm = id;
	$scope.recipes = [];
	$http({method:'GET', url: '/search/'+id})
		.success(function(data, status, headers, config) {	
			$scope.recipes = data;
			$scope.resultsLoaded = true;
		})
		.error(function() {
			$scope.resultsLoaded = true;
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
