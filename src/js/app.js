var menuBreak = window.matchMedia('(min-width: 650px)');

var _ = {
	clone: require('./vendor/lodash/objects/clone').clone,
	forEach: require('./vendor/lodash/collections/forEach').forEach,
	filter: require('./vendor/lodash/collections/filter').filter
};

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
			$routeProvider.when('/edit/:id', {
				templateUrl: '/templates/edit.html',
				controller: 'Edit'
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

nomsbase.factory('RecipeEditor', function($http, $location, $timeout) {
	//constructor for adding recipes/ingredients
	var Recipe = function() {
		return {
			name: '',
			ingredientGroups: [],
			instructions: '',
			bakingTemp: '',
			tags: []
		}
	};

	var Ingredient = function() {
		return {
			amount: '',
			unit: '',
			type: ''
		}
	};

	//constructor for ingredient groups
	var IngredientGroup = function() {
		return {
			name: '',
			ingredients: []
		}
	};

	var removeItem = function(item, arr) {
		var index = arr.indexOf(item);
		if (index > -1) {
			arr.splice(index, 1);
			return true;
		}
		return false;
	};

	var isNullOrEmpty = function(x) {
		return !x || x === undefined || x === null || (x && (x + '').trim().length === 0);
	};

	return {
		createRecipe: function() {
			var recipe = new Recipe();
			this.addIngredientGroup(recipe, true);
			this.setChangeTracker(recipe);
			return recipe;
		},

		addIngredient: function(group, groupIndex) {
			if (group && group.ingredients) {
				group.ingredients.push(new Ingredient());
			}

			this.focusAfterUpdate('#ingredient-group-' + groupIndex + '-amount-' + (group.ingredients.length - 1));

		},

		addIngredientGroup: function(recipe, isNew) {
			var group = new IngredientGroup();
			group.ingredients.push(new Ingredient());
			recipe.ingredientGroups.push(group);

			var selector = '#ingredient-group-' + (recipe.ingredientGroups.length - 1) + '-name';
			if (recipe.ingredientGroups.length === 1) {
				selector = '#ingredient-group-' + (recipe.ingredientGroups.length - 1) + '-amount-0';
			}

			if (!isNew) {
				this.focusAfterUpdate(selector);	
			}	
		},

		focusAfterUpdate: function(selector) {
			setTimeout(function() {
				var elem = document.querySelector(selector);
				if (elem) {
					elem.focus();
				}
			}, 1);
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

		editTags: function(e, recipe) {
			var controlKeyCodes = [13, 8]
			var code = e.keyCode || e.which;
			switch (code) {
				//add tag on enter
				case controlKeyCodes[0]:
					e.preventDefault();
					this.addTag(recipe);
					break;
				case controlKeyCodes[1]:
					if (recipe.tags.length >= 1 && (!this.newtag || this.newtag.trim().length === 0)) {
						recipe.tags.pop();
					}
					this.newtag = '';
					break;
				default:
					return;
			}
		},

		addTag: function(recipe) {
			var list = recipe.tags;
			if (this.newtag && this.newtag.trim().length > 0 && list.indexOf(this.newtag.trim()) === -1) {
				list.push(this.newtag.trim());
			}
			this.newtag = '';
			var input = document.querySelectorAll('[data-ng-model="RecipeEditor.newtag"]')[0];
			if (input) {
				input.focus();
			}
		},

		clearTag: function() {
			this.newtag = '';
		},

		removeTag: function(e, tag, list) {
			e.preventDefault();
			if (tag && list) {
				removeItem(tag, list);
			}
		},

		checkSubmit: function(e) {
			var code = e.keyCode || e.which;
			if (e.target.tagName && e.target.tagName.toLowerCase() == 'input' && code === 13) {
				e.preventDefault();
			}
		},

		setChangeTracker: function(recipe) {
			this.initRecipe = _.clone(recipe, true);
		},

		hasChanges: function(current) {
			return(angular.toJson(current) !== angular.toJson(this.initRecipe));
		},

		checkErrorType: function(form) {
			if (form.$invalid) {
				var errors = Object.keys(form.$error);
				if (!form.$error.required || errors.length > 1) {
					return 'general';
				}
				else if (form.$error.required) {
					return 'required';
				}
			}
			return "none";
		},

		save: function(form, recipe) {
			if(!form.$valid) {
				return false;
			}
			var saveStart = new Date();
			var re = this;
			re.isSaving = true;
			

			var url = '/add';
			if (recipe._id != null) {
				url = '/update/' + recipe._id;
			}

			//remove empty ingredients
			_.forEach(recipe.ingredientGroups, function(group, index) {
				group.ingredients = _.filter(group.ingredients, function(ingredient) {
					return !isNullOrEmpty(ingredient.amount) || !isNullOrEmpty(ingredient.type) || !isNullOrEmpty(ingredient.unit);
				});
				if (group.ingredients.length === 0) {
					recipe.ingredientGroups.splice(index, 1);
				}
			});

			$http({
				url : url,
				data : recipe,
				method : 'POST',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			})
			.success(function(data) {
				//750ms delay to show save screen
				var saveEnd = new Date();
				var delay = 0;
				if (saveEnd - saveStart < 750) {
					delay = 750 - (saveEnd - saveStart);
				};
				var recipeid = data.recipeid || recipe.recipeid;

				$timeout(function() {
					$location.path('/recipe/' + recipeid);
					re.isSaving = false;
				}, delay);
			});
		},

		cancel: function(recipe) {
			if (recipe._id !== null && recipe._id !== undefined) {
				$location.path('/recipe/' + recipe.recipeid);
			}
			else {
				$location.path('/');
			}
		}
	};
});

nomsbase.controller('MainCtrl', function($scope, $location, Page) {
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
	$scope.recipe = RecipeEditor.createRecipe();
});

nomsbase.controller('Edit', function($scope, $http, $routeParams, $location, Page, RecipeEditor) {
	$scope.recipe = {};
	$scope.RecipeEditor = RecipeEditor;
	$scope.RecipeEditor.isSaving = false;
	var id = $routeParams.id.split('-').join(' ');
	//get original recipe data
	$http({method:'GET', url: '/get/'+id + '?' + new Date().getTime()})
		.success(function(data, status, headers, config) {
			if (data.error) {
				$location.path('/404');
			}
			else {
				RecipeEditor.setChangeTracker(data);
				$scope.recipe = data;
				Page.setTitle('nomsbase update: ' + data.name);
				$location.path('/edit/' + data.recipeid + '/' + data.name.toLowerCase().replace(/\s/g, '-')).replace();
			}
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
				$location.path('/recipe/' + data.recipeid + '/' + data.name.toLowerCase().replace(/\s/g, '-')).replace();
				$scope.recipe = data;
			}
			else {
				$location.path('/404');
			}
		})
		.error(function() {
			$location.path('/404');
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
	$scope.searchTerm = id.replace(/\+/g, '/');
	$scope.recipes = [];
	$http({method:'GET', url: '/search/'+id})
		.success(function(data, status, headers, config) {
			if (!data.error) {
				$scope.recipes = data;
			}	
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

module.exports = nomsbase;
