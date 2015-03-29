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
				
					var fileInput = document.querySelector('input[type="file"]');
					var fileLabel = document.querySelector('[for="' + fileInput.id + '"]');
					var fileDelete = document.getElementById('recipe-image-remove');

					fileInput.addEventListener('focus', function() {
						$scope.$apply(function() {
							$scope.imageEditing = true;
						});
						fileLabel.setAttribute('data-focused', 'true');
					});
					fileInput.addEventListener('blur', function() {
						fileLabel.removeAttribute('data-focused');
						$scope.$apply(function() {
							$scope.imageEditing = false;
						});
					});
					fileInput.addEventListener('keydown', function(e) {
						if (e.keyCode === 13) {
							this.click();
						}
					});
					fileInput.addEventListener('change', function() {
						fileLabel.removeAttribute('data-focused');
						if (this.files.length > 0) {
							$scope.$apply(function() {
								$scope.imageLoading = true;
							});
							var reader = new FileReader();
							reader.onloadend = function() {
								$scope.$apply(function() {
									$scope.recipe.imageUrl = reader.result;
									$scope.imageLoading = false;
									$scope.imageEditing = false;
								});
							}
							reader.readAsDataURL(this.files[0]);
						}
					});
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

				}, 10);
			}
		});
};

module.exports = EditCtrl;