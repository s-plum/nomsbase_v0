'use strict';

var NewCtrl = function ($scope, $http, Page, RecipeEditor) {
	Page.setTitle('nomsbase insert');
	$scope.RecipeEditor = RecipeEditor;
	$scope.imageLoading = false;
	$scope.imageEditing = false;
	$scope.RecipeEditor.isSaving = false;
	$scope.saveUrl = '/add';
	$scope.recipe = RecipeEditor.createRecipe();
	
	Page.setFooterPosition();
	RecipeEditor.bindImageUploader($scope);
};

module.exports = NewCtrl;