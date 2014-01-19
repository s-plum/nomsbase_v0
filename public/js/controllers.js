function IndexController($scope, $http) {
	$scope.data = {};
	$scope.data['name'] = "";
	$scope.data['ingredients'] = {};
	$scope.addIngredient = function() {
		if ($('#ingredient-name').val() && $('#ingredient-amount').val()) {
			//$scope.data.ingredients.push({'name':$('#ingredient-name').val(),'amount':$('#ingredient-amount').val()});
			$scope.data.ingredients[$('#ingredient-name').val()] = $('#ingredient-amount').val(); 
			$('#ingredient-name, #ingredient-amount').val('');
		}
	};
	$scope.save = function() {
			$http({
				url : 'http://localhost:3000/save',
				data : $scope.data,
				method : 'POST',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
	};
}