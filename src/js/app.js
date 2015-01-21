var menuBreak = window.matchMedia('(min-width: 650px)');

var nomsbase = angular.module('nomsbase',['ngRoute'])
	.config(function($routeProvider, $locationProvider) {
		$routeProvider.when('/', {});
		$routeProvider.when('/recipe/:id', {
			templateUrl: '/templates/view.html',
			controller: 'View'
		});
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
		$routeProvider.when('/edit/:id/:name', {
			templateUrl: '/templates/edit.html',
			controller: 'Edit'
		});
		$routeProvider.when('/random', {
			templateUrl: '/templates/random.html',
			controller: 'Random'
		});
		$routeProvider.when('/404', {
			templateUrl: '/templates/404.html',
			controller: 'Error'
		});
		$routeProvider.otherwise({
			redirectTo: '/404'
		})
		$locationProvider.html5Mode({
		  enabled: true,
		  requireBase: false
		});
	});

nomsbase.factory('Page', function() {
	var title = 'nomsbase';
	return {
		title: function() { return title; },
		setTitle: function(newTitle) { title = newTitle }
	}
});

nomsbase.controller('MainCtrl', function($scope, $location, Page) {
	$scope.Page = Page;
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

nomsbase.controller('View', function($scope, $http, $routeParams, $sce, Page) {
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
	$scope.fraction = function(num) {
		var fract = num % 1;
		if (fract === 0) {
			return $sce.trustAsHtml(num + '');
		}
		else {
			var whole = num - fract;
			if (whole === 0) {
				whole = '';
			}
			var fractDisplay = fract;
			switch (parseFloat(fract.toFixed(3))) {
				case (0.125):
					fractDisplay = "<b>&frac18;</b>"
					break;
				case (0.250):
					fractDisplay = "<b>&frac14;</b>"
					break;
				case (0.333):
					fractDisplay = "<b>&frac13;</b>"
					break;
				case (0.375):
					fractDisplay = "<b>&frac38;</b>"
					break;
				case (0.500):
					fractDisplay = "<b>&frac12;</b>"
					break;
				case (0.625):
					fractDisplay = "<b>&frac58;</b>"
					break;
				case (0.667):
					fractDisplay = "<b>&frac23;</b>"
					break;
				case (0.875):
					fractDisplay = "<b>&frac78;</b>"
					break;
				default: 
					break;
			} 
			return $sce.trustAsHtml(whole + fractDisplay);
		}
	}
});

nomsbase.controller('Search', function($scope, $http, $location, $routeParams, Page) {
	$scope.resultsLoaded = false;
	var id = $routeParams.id.split('-').join(' ');
	Page.setTitle('nomsbase query: ' + id);
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

nomsbase.controller('Random', function($scope, $http, $location, $timeout, Page) {
	Page.setTitle('Randomizing...');
	$http({method:'GET', url: '/getrandom'})
		.success(function(data, status, headers, config) {	
			$timeout(function() {
				$location.path('/recipe/' + data.recipeid);
			}, 1500);
		});
});

nomsbase.controller('Error', function($scope, Page) {
	Page.setTitle('Oh noes!');
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
