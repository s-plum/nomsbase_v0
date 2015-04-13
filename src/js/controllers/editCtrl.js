'use strict';

var EditCtrl = function($scope, $http, $routeParams, $location, Page, RecipeEditor) {
	$scope.recipe = {};
	$scope.RecipeEditor = RecipeEditor;
	$scope.imageLoading = false;
	$scope.imageEditing = false;
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
				setTimeout(function(){
					Page.setFooterPosition();
					RecipeEditor.bindImageUploader($scope);
				}, 10);
			}
		});
};

module.exports = EditCtrl;