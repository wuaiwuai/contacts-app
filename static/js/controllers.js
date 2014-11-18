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

contactsControllers.controller('HomeCtrl', ['$scope', 'AuthService', '$location', 'DataService', '$stateParams',
	function($scope, AuthService, $location, DataService, $stateParams){

		// initialize new contact object
		$scope.newContact = {};

		// get current user from localStorage
		$scope.user = AuthService.getCurrentUser();

		// get contacts
		DataService.getContacts().then(function(contacts){
			$scope.contacts = contacts;

			for (var i = 0, j = contacts.length; i < j; i++){
				if(contacts[i]['firstName'] + '-' + contacts[i]['lastName'] == $stateParams.contact){
					$scope.contact = contacts[i];
					$scope.contact.index = i;
					break;
				}
			};
		});

		// get tags
		DataService.getTags().then(function(tags){
			$scope.tags = tags;
		});

		// add contact
		$scope.addContact = function(){
			DataService.addContact($scope.newContact).success(function(){
				$location.path('/contact/' + $scope.newContact.firstName + '-' + $scope.newContact.lastName);
			});
		}

		// update current contact
		$scope.updateContact = function(){
			DataService.updateContact($scope.contact.index, $scope.contact).success(function(){
				$location.path('/contact/' + $scope.contact.firstName + '-' + $scope.contact.lastName);
			});
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