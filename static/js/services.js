'use strict';

var contactsServices = angular.module('contactsServices', []);

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
contactsServices.factory('AuthService', ['SessionService', '$http', 'FlashService',
	function(SessionService, $http, FlashService){

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
		return {
			login: function(credentials){
				var login = $http.post('/auth/login', credentials);
				login.success(function(data){
					cacheSession(data.user);
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