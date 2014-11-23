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

contactsControllers.controller('HomeCtrl', ['$scope', 'AuthService', '$location', 'DataService', '$stateParams', 'contactsObj',
	function($scope, AuthService, $location, DataService, $stateParams, contactsObj){

		// initialize new contact object
		$scope.newContact = {};

		// get current user from localStorage
		$scope.user = AuthService.getCurrentUser();

		// get contacts
		$scope.contacts = contactsObj;

		// set current contact from url
		for (var i = 0, j = $scope.contacts.length; i < j; i++){
			// set index param of all contacts
			//$scope.contacts[i].index = i; // to remove, replace index with id
			if($scope.contacts[i]['firstName'] + '-' + $scope.contacts[i]['lastName'] == $stateParams.contact){
				$scope.contact = $scope.contacts[i];
				break;
			}
		};

		// get tags
		DataService.getTags().then(function(tags){
			$scope.tags = tags;
		});

		// add contact
		$scope.addContact = function(){
			// set index param of new contact
			//$scope.newContact.index = $scope.contacts.length;
			DataService.addContact($scope.newContact).success(function(){
				$location.path('/contact/' + $scope.newContact.firstName + '-' + $scope.newContact.lastName);
			});
		}

		// update current contact
		$scope.updateContact = function(){
			DataService.updateContact($scope.contact.id, $scope.contact).success(function(){
				$location.path('/contact/' + $scope.contact.firstName + '-' + $scope.contact.lastName);
			});
		}

		// delete current contact
		$scope.deleteContact = function(){
			DataService.deleteContact($scope.contact.id).success(function(){
				$location.path('/');
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