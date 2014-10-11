'use strict';

var contactsControllers = angular.module('contactsControllers', []);

contactsControllers.controller('LoginCtrl', ['$scope',
	function($scope){
		// initialize credentials object
		$scope.credentials = {};

		$scope.login = function(){
			// log user in
		}
	}
]);