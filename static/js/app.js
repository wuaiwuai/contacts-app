'use strict';

// define app dependencies
var contactsApp = angular.module('contactsApp', [
	'contactsControllers',
	'ui.router',
	'contactsServices'
]);

// partial templates path relative to app.py
var DIR = 'static/partials';

contactsApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider){
		// use HTML5 history api to avoid hash
		$locationProvider.html5Mode(true);
		// define states with route, template, controller
		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: DIR + '/login.html',
				controller: 'LoginCtrl'
			})
			.state('register', {
				url: '/register',
				templateUrl: DIR + '/register.html',
				controller: 'RegisterCtrl'
			})
			.state('home', {
				url: '/',
				templateUrl: DIR + '/home.html',
				controller: 'HomeCtrl'
			});
		// for now redirect all requests to login
		$urlRouterProvider.otherwise('login')
	}
]);

// appwide concerns can be places on $rootScope where
// they will be accessible to all child scopes
contactsApp.run(['$rootScope', 'AuthService', '$location',
	function($rootScope, AuthService, $location){

		// PROTECTED_ROUTES is array of all routes requiring authentication
		var PROTECTED_ROUTES = ['/'];

		// $rootScope listens for $locationChangeStart, an event that is 
		// broadcast at begining of URL change
		$rootScope.$on('$locationChangeStart', function(event){

			// if new $location.path() is protected and user is not logged in,
			// redirect user to login page
			if(PROTECTED_ROUTES.indexOf($location.path()) > -1 && !AuthService.isLoggedIn()){
				$location.path('/login');
			}
		})
	}
]);