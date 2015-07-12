'use strict';

var _ = require('lodash');

var Page = function() {
	var title = 'nomsbase';

	var setFooterPosition = function() {
		document.getElementsByTagName('html')[0].removeAttribute('data-short-content');
		if (document.getElementsByTagName('body')[0].clientHeight < window.innerHeight) {
			document.getElementsByTagName('html')[0].setAttribute('data-short-content', 'true');
		}
		else {
			document.getElementsByTagName('html')[0].removeAttribute('data-short-content');
		}
	};

	return {
		title: function() { return title; },
		setTitle: function(newTitle) { title = newTitle },
		setFooterPosition: setFooterPosition
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

		createImageInput: function($scope) {
			var self = this;

			var fileInput = document.querySelector('input[type="file"]');
			var fileDelete = document.getElementById('recipe-image-remove');

			if (fileInput) {
				fileInput.parentNode.removeChild(fileInput);
			}

			var filePreview = document.querySelector('.recipe-image');
			var newInput = document.createElement('input');
			newInput.setAttribute('type', 'file');
			newInput.setAttribute('id', 'recipe-image');
			filePreview.insertBefore(newInput, fileDelete);

			self.bindImageInputEvents(newInput, $scope);
		},

		bindImageInputEvents: function(fileInput, $scope) {
			var self = this;
			var fileLabel = document.querySelector('[for="' + fileInput.id + '"]');

			fileInput.addEventListener('change', function() {
				fileLabel.removeAttribute('data-focused');
				$scope.$apply(function() {
					$scope.imageEditing = false;
				});
				if (this.files.length > 0) {
					$scope.$evalAsync(function() {
						$scope.imageLoading = true;
						$scope.imageEditing = false;
					});
					var reader = new FileReader();
					reader.onloadend = function() {
						$scope.$evalAsync(function() {
							$scope.recipe.imageUrl = reader.result;
							$scope.imageLoading = false;
							$scope.imageEditing = false;
							self.createImageInput($scope);
						});
					}
					reader.readAsDataURL(this.files[0]);
				}
			});
			fileInput.addEventListener('focus', function(e) {
				if (e.relatedTarget !== null) {
					$scope.$evalAsync(function() {
						$scope.imageEditing = true;
					});
					fileLabel.setAttribute('data-focused', 'true');
				}
			});
			fileInput.addEventListener('blur', function() {
				fileLabel.removeAttribute('data-focused');
				$scope.$evalAsync(function() {
					$scope.imageEditing = false;
				});
			});
			fileInput.addEventListener('keydown', function(e) {
				if (e.keyCode === 13) {
					this.click();
				}
			});
		},

		bindImageUploader: function($scope) {
			var self = this;

			var fileInput = document.querySelector('input[type="file"]');
			var fileDelete = document.getElementById('recipe-image-remove');

			//preload loading indicators
			var loadImages = ['/img/plum.svg', '/img/nom.svg'];
			for (var i=0; i<loadImages.length; i++) {
				var img = new Image();
				img.src = loadImages[i];
			}

			//bind onchange events
			self.bindImageInputEvents(fileInput, $scope);

			fileDelete.addEventListener('focus', function() {
				$scope.$evalAsync(function() {
					$scope.imageEditing = true;
				});
			});
			fileDelete.addEventListener('blur', function() {
				$scope.$evalAsync(function() {
					$scope.imageEditing = false;
				});
			});
			fileDelete.addEventListener('click', function(e) {
				e.preventDefault();
				$scope.$evalAsync(function() {
					$scope.recipe.imageUrl = null;
				});
			});
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
			

			var url = '/recipe';
			if (recipe._id != null) {
				url += '/' + recipe._id;
			}

			//remove empty ingredients
			// _.forEach(recipe.ingredientGroups, function(group, index) {
			// 	group.ingredients = _.filter(group.ingredients, function(ingredient) {
			// 		return !isNullOrEmpty(ingredient.amount) || !isNullOrEmpty(ingredient.type) || !isNullOrEmpty(ingredient.unit);
			// 	});
			// 	if (group.ingredients.length === 0) {
			// 		recipe.ingredientGroups.splice(index, 1);
			// 	}
			// });

			//get image
			var imageInput = document.querySelector('input[type="file"]');
			var files = [];
			if (imageInput.files.length > 0) {
				files.push(imageInput.files[0]);
				recipe.imageUrl = null;
			}

			$http({
				url : url,
				data : { recipe: recipe, files: files },
				method : 'POST',
				headers: {'Content-Type': undefined },
				transformRequest: function (data) {
	                var formData = new FormData();
	                formData.append('recipe', angular.toJson(data.recipe));
	                for (var i = 0; i < data.files.length; i++) {
	                    formData.append("file" + i, data.files[i]);
	                }
	                return formData;
	            },
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