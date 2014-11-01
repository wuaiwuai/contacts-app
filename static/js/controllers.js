'use strict';

var contactsControllers = angular.module('contactsControllers', []);

contactsControllers.controller('LoginCtrl', ['$scope', 'AuthService', '$location',
	function($scope, AuthService, $location){

		// initialize credentials object
		$scope.credentials = {};

		// on form submit call AuthService's login function with user's credentials
		// on success, redirect to home page
		$scope.login = function(){
			AuthService.login($scope.credentials).success(function(){
				$location.path('/');
			})
		}
	}
]);

contactsControllers.controller('RegisterCtrl', ['$scope', 'RegisterService', '$location',
	function($scope, RegisterService, $location){

		// initialize credentials object
		$scope.credentials = {};

		$scope.register = function(){
			RegisterService.registerUser($scope.credentials).success(function(){
				$location.path('/login');
			});
		}
	}
]);

contactsControllers.controller('HomeCtrl', ['$scope', 'AuthService', '$location', 'DataService',
	function($scope, AuthService, $location, DataService){

		// initialize new contact object
		$scope.newContact = {};

		// get current user from localStorage
		$scope.user = AuthService.getCurrentUser();

		// get contacts
		DataService.getContacts().then(function(contacts){
			$scope.contacts = contacts;
		});

		// add contact
		$scope.addContact = function(){
			DataService.addContact($scope.newContact).success(function(){
				$location.path('/');
			})
		}

		// on form submit, call AuthService's logout function
		// on success redirect to login page
		$scope.logout = function(){
			AuthService.logout().success(function(){
				$location.path('/login');
			});
		}
	}
]);