'use strict';

var _ = require('lodash');

var Page = function() {
	var title = 'nomsbase';
	return {
		title: function() { return title; },
		setTitle: function(newTitle) { title = newTitle }
	}
};

var RecipeEditor = function($http, $location, $timeout) {
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
};

module.exports = {
	Page: Page,
	RecipeEditor: RecipeEditor
};