'use strict';

var contactsServices = angular.module('contactsServices', []);

// AuthService handles login/logout by calling SessionService
contactsServices.factory('AuthService', ['SessionService', '$http',
	function(SessionService, $http){

		// private methods; set and unset sessions
		var cacheSession = function(){
			SessionService.set('authenticated', true);
		}

		var uncacheSession = function(){
			SessionService.unset('authenticated');
		}

		// public methods 
		// use xhr to authenticate against db and store
		// server side sessions, and return promises that 
		// can be used in controllers for redirects, etc
		return {
			login: function(credentials){
				var login = $http.post('/auth/login', credentials);
				login.success(cacheSession);
				return login;
			},
			logout: function(){
				var logout = $http.get('/auth/logout');
				logout.success(uncacheSession);
				return logout;
			},
			isLoggedIn: function(){
				return SessionService.get('authenticated')
			}
		};
	}
]);

contactsServices.factory('RegisterService', ['$http',
	function($http){
		return {
			registerUser: function(credentials){
				var register = $http.post('/api/users', credentials);
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