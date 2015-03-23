'use strict';

var ViewCtrl = function($scope, $rootScope, $http, $routeParams, $sce, $location, Page) {
	$scope.canEdit = $rootScope.user != null;
	$scope.recipe = {
		name: ''
	};
	var id = $routeParams.id;
	$http({method:'GET', url: '/get/'+id})
		.success(function(data, status, headers) {
			if (!data.error) {
				Page.setTitle(data.name);
				$location.path('/recipe/' + data.recipeid + '/' + data.name.toLowerCase().replace(/\s/g, '-')).replace();
				$scope.recipe = data;
				setTimeout(function(){
					Page.setFooterPosition();
				}, 10);
				
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
};

module.exports = ViewCtrl;