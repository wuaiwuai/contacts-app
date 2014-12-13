loginModule.controller('LoginCtrl', ['$scope', 'AuthService', '$location',
	function($scope, AuthService, $location){

		// initialize credentials object
		$scope.credentials = {};

		// on form submit call AuthService's login function with user's credentials
		// on success, redirect to home page
		$scope.login = function(){
			AuthService.login($scope.credentials).success(function(){
				$location.path('/');
			});
		};
	}
]);