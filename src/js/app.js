var menuBreak = window.matchMedia('(min-width: 650px)');

var config = require('./config');

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

		//new and edit only available in dev
		if (config.environment === 'dev') {
			$routeProvider.when('/new', {
				templateUrl: '/templates/edit.html',
				controller: 'New'
			});
			$routeProvider.when('/edit/:id/:name', {
				templateUrl: '/templates/edit.html',
				controller: 'Edit'
			});
		}
		
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

nomsbase.factory('RecipeEditor', function($http) {
	//constructor for adding ingredients
	var Ingredient = function() {
		return {
			amount: null,
			unit: null,
			type: null
		}
	};

	//constructor for ingredient groups
	var IngredientGroup = function() {
		return {
			name: null,
			ingredients: []
		}
	}

	var removeItem = function(item, arr) {
		var index = arr.indexOf(item);
		if (index > -1) {
			arr.splice(index, 1);
			return true;
		}
		return false;
	}

	return {
		addIngredient: function(group) {
			if (group && group.ingredients) {
				group.ingredients.push(new Ingredient());
			}
		},

		addIngredientGroup: function(recipe) {
			var group = new IngredientGroup();
			group.ingredients.push(new Ingredient());
			recipe.ingredientGroups.push(group);
		},

		removeIngredient: function(ingredient, group, recipe) {
			if (group && group.ingredients && ingredient) {
				if (removeItem(ingredient, group.ingredients)) {
					if (group.ingredients.length === 0 && recipe && recipe.ingredientGroups.length === 1) {
						recipe.ingredientGroups = [];
					}
				}
			}		
		},

		removeIngredientGroup: function(group, recipe) {
			if (group) {
				var index = recipe.ingredientGroups.indexOf(group);
				if (index > -1) {
					recipe.ingredientGroups.splice(index, 1);
				}
			}
		},

		addTag: function(recipe) {
			var tag = recipe.newtag;
			var list = recipe.tags;
			if (tag && tag.trim().length > 0 && list.indexOf(tag.trim()) === -1) {
				list.push(tag.trim());
			}
			recipe.newtag = '';
			var input = document.querySelectorAll('[data-ng-model="recipe.newtag"]')[0];
			if (input) {
				//input.value = '';
				input.focus();
			}
		},

		removeTag: function(tag, list) {
			if (tag && list) {
				removeItem(tag, list);
			}
		},

		save: function(data) {
			var url = '/add';
			if (data._id != null) {
				url = '/update/' + data._id;
			}
			$http({
				url : url,
				data : data,
				method : 'POST',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			})
			.success(function(data) {
				console.log(data);
			});
		}
	};
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


nomsbase.controller('New', function ($scope, $http, Page, RecipeEditor) {
	Page.setTitle('nomsbase insert');
	$scope.RecipeEditor = RecipeEditor;
	$scope.saveUrl = '/add';
	var recipe = {
		name: '',
		ingredientGroups: [],
		instructions: null,
		bakingTemp: null,
		tags: []
	};
	RecipeEditor.addIngredientGroup(recipe);
	$scope.recipe = recipe;
});

nomsbase.controller('Edit', function($scope, $http, $routeParams, $location, Page, RecipeEditor) {
	$scope.recipe = {};
	$scope.RecipeEditor = RecipeEditor;
	var id = $routeParams.id.split('-').join(' ');
	//get original recipe data
	$http({method:'GET', url: '/get/'+id + '?' + new Date().getTime()})
		.success(function(data, status, headers, config) {
			$scope.recipe = data;
			Page.setTitle('nomsbase update: ' + data.name);
			$location.path('/edit/' + data.recipeid + '/' + data.name.toLowerCase().replace(/\s/g, '-'));
		});
});

nomsbase.controller('View', function($scope, $http, $routeParams, $sce, $location, Page) {
	$scope.recipe = {
		name: ''
	};
	var id = $routeParams.id;
	$http({method:'GET', url: '/get/'+id})
		.success(function(data, status, headers, config) {
			if (!data.error) {
				Page.setTitle(data.name);
				$location.path('/recipe/' + data.recipeid + '/' + data.name.toLowerCase().replace(/\s/g, '-'));
				$scope.recipe = data;
			}
			else {
				$location.path('/404');
			}
		})
		.error(function() {
			console.log('error');
		});
	$scope.fraction = function(num) {
		//convert to string, just in case
		num += '';
		var frac = new RegExp('([0-9]+\/[0-9]+)', 'g');
		if (!frac.test(num)) {
			return $sce.trustAsHtml(num);
		}
		else {
			var glyphs = ['&frac18;', '&frac14;', '&frac13;', '&frac38;', '&frac12;', '&frac58;', '&frac23;', '&frac78;'];
			var fracString = num.match(frac)[0];
			var fracDisplay = '&frac' + fracString.replace('/', '') + ';';

			//glyph does not exist, just return original
			if (glyphs.indexOf(fracDisplay) === -1) {
				return $sce.trustAsHtml(num);
			}

			return $sce.trustAsHtml(fracDisplay);
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
