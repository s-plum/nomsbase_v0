var nomsbase = angular.module('nomsbase',['ngRoute']).
	config(function($routeProvider, $locationProvider) {
		$routeProvider.when('/recipe/:id', {
			templateUrl: '/partials/view',
			controller: 'View'
		});
		$routeProvider.when('/recipes/:id', {
			templateUrl: '/partials/search',
			controller: 'Search'
		});
		$routeProvider.when('/new', {
			templateUrl: '/partials/edit',
			controller: 'New'
		});
		$routeProvider.when('/edit/:id', {
			templateUrl: '/partials/edit',
			controller: 'Edit'
		});
		$locationProvider.html5Mode(true);
	});

nomsbase.controller('New', function ($scope, $http) {
	$scope.data = {};
	$scope.data['name'] = "";
	$scope.data['ingredients'] = [];
	$scope.data['tags'] = [];
	$scope.addIngredient = function() {
		if ($('#ingredient-name-new').val() && $('#ingredient-amount-new').val() && $('#ingredient-unit-new').val()) {
			$scope.data.ingredients.push({'name':$('#ingredient-name-new').val(),'amount':$('#ingredient-amount-new').val(), 'unit': $('#ingredient-unit-new').val()});
			//$scope.data.ingredients[$('#ingredient-name').val()] = $('#ingredient-amount').val(); 
			$('.ingredient-new').removeClass('ng-invalid').addClass('ng-valid').val('');
			$('#ingredient-amount-new').focus();
		}
		else {
			$('.ingredient-new').each(function() {
				if (!$(this).val()) $(this).removeClass('ng-valid').addClass('ng-invalid');
				else $(this).addClass('ng-valid').removeClass('ng-invalid');
			});
		}
	};
	$scope.addTag = function() {
		if ($('#recipe-tag').val()) {
			$scope.data.tags.push($('#recipe-tag').val());
			$('#recipe-tag').val('');
		}
	};
	$scope.removeItem = function(id, array) {
		$scope.data[array].splice(id, 1);
	};
	$scope.save = function() {
			console.log('saving');
			$http({
				url : 'http://localhost:3000/add',
				data : $scope.data,
				method : 'POST',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
	};
});

nomsbase.controller('Edit', function($scope, $http, $routeParams) {
	$scope.data = {};
	var id = $routeParams.id.split('-').join(' ');
	//get original recipe data
	$http({method:'GET', url: '/get/'+id}).
		success(function(data, status, headers, config) {
			$scope.data = data;
		});
});

nomsbase.controller('View', function($scope, $http, $routeParams) {
	$scope.data = {};
	var id = $routeParams.id.split('-').join(' ');
	$http({method:'GET', url: '/get/'+id}).
		success(function(data, status, headers, config) {
			$scope.data = data;
		});
});

nomsbase.controller('Search', function($scope, $http, $routeParams) {
	$scope.data = [];
	var id = $routeParams.id.split('-').join(' ');
	$http({method:'GET', url: '/search/'+id}).
		success(function(data, status, headers, config) {
			$scope.data = data;
			$.each($scope.data, function(index, value) {
				value['idName'] = value.name.split(' ').join('-').toLowerCase();
			});
		});
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
