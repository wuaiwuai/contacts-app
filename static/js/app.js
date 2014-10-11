'use strict';

// define app dependencies
var contactsApp = angular.module('contactsApp', [
	'contactsControllers',
	'ui.router'
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
			});
		// for now redirect all requests to login
		$urlRouterProvider.otherwise('login')
	}
]);