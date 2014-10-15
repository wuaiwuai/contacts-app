'use strict';

var contactsServices = angular.module('contactsServices', []);

// FlashService emulates server side flash messaging
contactsServices.factory('FlashService', ['$rootScope',
	function($rootScope){

		// set message queue and current message; when route
		// changes complete, current message gets first message
		// in queue or nothing if there is nothing left
		var queue = [];
		var currentMessage = '';

		$rootScope.$on('$locationChangeSuccess', function(){
			currentMessage = queue.shift() || '';
		});

		// public methods
		// Note: because on success we expect route to change
		// whereas on error we expect route to stay the same,
		// setMessage will show after one route change and
		// showMessage will add message immediately
		return {
			setMessage: function(message){
				queue.push(message);
			},
			showMessage: function(message){
				currentMessage = message;
			},
			getMessage: function(){
				return currentMessage;
			}
		};
	}
]);

// AuthService handles login/logout by calling SessionService
contactsServices.factory('AuthService', ['SessionService', '$http', 'FlashService', 'CacheService',
	function(SessionService, $http, FlashService, CacheService){

		// private methods; set and unset sessions
		var cacheSession = function(user){
			SessionService.set('user', user);
		}

		var uncacheSession = function(){
			SessionService.unset('user');
		}

		// public methods 
		// use xhr to authenticate against db and store
		// server side sessions, and return promises that 
		// can be used in controllers for redirects, etc
		// login stores contacts data with CacheService
		return {
			login: function(credentials){
				var login = $http.post('/auth/login', credentials);
				login.success(function(data){
					cacheSession(data.user);
					CacheService.put('contacts', data.contacts);
				});
				login.error(function(data){
					FlashService.showMessage(data.message);
				})
				return login;
			},
			logout: function(){
				var logout = $http.get('/auth/logout');
				logout.success(function(data){
					uncacheSession();
					FlashService.setMessage(data.message);
				});
				return logout;
			},
			getCurrentUser: function(){
				return SessionService.get('user');
			}
		};
	}
]);

// DataService provides methods for CRUD operations
contactsServices.factory('DataService', ['$http', 'CacheService', '$q',
	function($http, CacheService, $q){

		// public methods
		// getContacts will first check cache to see if there is
		// contacts data; if there is it returns promise with q
		// otherwise (as in page refresh) it calls server with 
		// username from controller, cleans up response so 
		// contacts is already an array and hands promise back
		return {
			getContacts: function(user){
				if(CacheService.get('contacts')){
					return $q.when(CacheService.get('contacts'));
				}
				else{
					var contacts = $http.get('/api/users/' + user + '/contacts', {cache: CacheService})
						.then(function(response){
							return response.data.contacts;
						});
					return contacts;
				}
			}
		};
	}
]);

// CacheService is the custom cache where contacts will be stored
contactsServices.factory('CacheService', ['$cacheFactory',
	function($cacheFactory){
		return $cacheFactory('customData');
	}
]);

// RegisterService posts to create user
contactsServices.factory('RegisterService', ['$http', 'FlashService',
	function($http, FlashService){
		return {
			registerUser: function(credentials){
				var register = $http.post('/api/users', credentials);
				register.success(function(data){
					FlashService.setMessage(data.message);
				});
				register.error(function(data){
					FlashService.showMessage(data.message);
				});
				return register;
			}
		};
	}
]);

// SessionService stores sessions in localStorage
contactsServices.factory('SessionService', [
	function(){
		return {
			get: function(key){
				return localStorage.getItem(key);
			},
			set: function(key, value){
				return localStorage.setItem(key, value);
			},
			unset: function(key){
				return localStorage.removeItem(key);
			}
		};
	}
]);