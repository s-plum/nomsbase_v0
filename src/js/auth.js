var auth = function($rootScope, $http, $location) {
	$rootScope.user = null;
	$rootScope.$on('$locationChangeStart', function (event, next, current) {
		if (next && next.split('/').length >= 3) {
			var route = next.split('/')[3];
			if ((route === 'edit' || route === 'new') && $rootScope.user == null) {
				event.preventDefault();
				$location.path('/login').search('n', window.location.pathname);
			}
		}
	});
};

module.exports = auth;