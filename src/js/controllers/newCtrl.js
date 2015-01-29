'use strict';

var NewCtrl = function ($scope, $http, Page, RecipeEditor) {
	Page.setTitle('nomsbase insert');
	$scope.RecipeEditor = RecipeEditor;
	$scope.saveUrl = '/add';
	$scope.recipe = RecipeEditor.createRecipe();
};

module.exports = NewCtrl;