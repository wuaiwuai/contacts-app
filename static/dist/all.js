
// define app dependencies
var contactsApp = angular.module('contactsApp', [
	'ui.router',
	'authModule',
	'flashModule',
	'homeModule',
	'loginModule',
	'registerModule'
]);

var authModule = angular.module('authModule', []),
	flashModule = angular.module('flashModule', []),
	homeModule = angular.module('homeModule', []),
	loginModule = angular.module('loginModule', []),
	registerModule = angular.module('registerModule', []);

// partial templates path relative to app.py
var DIR = '/static/partials';

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
				controller: 'HomeCtrl',
				resolve: {
					contactsObj: function(DataService){
						var contacts = DataService.getContacts().then(function(data){
							return data;
						});
						return contacts;
					}
				}
			})
			.state('home.add', {
				url: 'add',
				templateUrl: DIR + '/home.add.html',
				controller: 'HomeCtrl'
			})
			.state('home.contact', {
				url: 'contact/:contact',
				templateUrl: DIR + '/home.contact.html',
				controller: 'HomeCtrl'
			})
			.state('home.update', {
				url: 'contact/:contact/update',
				templateUrl: DIR + '/home.update.html',
				controller: 'HomeCtrl'
			});/*
			.state('home.tag', {
				url: 'tags/:tag',
				templateUrl: DIR + '/home.contact.html',
				controller: 'HomeCtrl'
			});*/
		// for now redirect all requests to login
		$urlRouterProvider.otherwise('login');
	}
]);

// appwide concerns can be placed on $rootScope where
// they will be accessible to all child scopes
contactsApp.run(['$rootScope', 'AuthService', '$location', 'FlashService', '$state',
	function($rootScope, AuthService, $location, FlashService, $state){

		// Add $state to $rootScope so it will be accessible everywhere
		$rootScope.$state = $state;

		// Add FlashService to $rootScope to avoid injecting it in every controller
		$rootScope.flash = FlashService;

		// UNPROTECTED_ROUTES is array of all routes not requiring authentication
		var UNPROTECTED_ROUTES = ['/login', '/register'];

		// $rootScope listens for $locationChangeStart, an event that is 
		// broadcast at begining of URL change
		$rootScope.$on('$locationChangeStart', function(event){

			// if new $location.path() is protected and user is not logged in,
			// redirect user to login page
			if(UNPROTECTED_ROUTES.indexOf($location.path()) < 0 && !AuthService.getCurrentUser()){
				$location.path('/login');
			}
		});
	}
]);
// AuthService handles login/logout by calling SessionService
authModule.factory('AuthService', ['SessionService', '$http', 'FlashService', 'CacheService',
	function(SessionService, $http, FlashService, CacheService){

		// private methods; set and unset sessions
		var cacheSession = function(user){
			SessionService.set('user', user);
		};

		var uncacheSession = function(){
			SessionService.unset('user');
		};

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
					CacheService.put('tags', data.tags);
				});
				login.error(function(data){
					FlashService.showMessage(data.message);
				});
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
// SessionService stores sessions in localStorage
authModule.factory('SessionService', [
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
// FlashService emulates server side flash messaging
flashModule.factory('FlashService', ['$rootScope',
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
// CacheService is the custom cache where contacts will be stored
homeModule.factory('CacheService', ['$cacheFactory',
	function($cacheFactory){
		return $cacheFactory('customData');
	}
]);
// DataService provides methods for CRUD operations
homeModule.factory('DataService', ['$http', 'CacheService', '$q', 'AuthService', 'FlashService',
	function($http, CacheService, $q, AuthService, FlashService){

		// private properties/methods
		var user = AuthService.getCurrentUser();
		// updates cache to reflect newly added contact without calling db again for fresh data
		var addToCachedContacts = function(newContact){
			var cachedContacts = CacheService.get('contacts');
			cachedContacts.push(newContact);
			CacheService.put('contacts', cachedContacts);
		};
		// updates cache to reflect newly updated contact without calling db again for fresh data
		var updateCachedContacts = function(id, contact){
			var cachedContacts = CacheService.get('contacts');
			for (var i = 0, j = cachedContacts.length; i < j; i++) {
				if(cachedContacts[i] == id){
					cachedContacts[i] = contact;
				}
			}
			CacheService.put('contacts', cachedContacts);
		};
		// updates cache to reflect newly removed contact
		var removeFromCachedContacts = function(id){
			var cachedContacts = CacheService.get('contacts');
			for (var i = 0, j = cachedContacts.length; i < j; i++) {
				if(cachedContacts[i].id == id){
					cachedContacts.splice(i, 1);
				}
			}
			CacheService.put('contacts', cachedContacts);
		};
		// updates cache to reflect newly added tag without calling db again for fresh data
		var addToCachedTags = function(newTag){
			var cachedContacts = CacheService.get('tags');
			cachedContacts.push(newTag);
			CacheService.put('tags', cachedTags);
		};
		
		// public methods
		// getContacts will first check cache to see if there is
		// contacts data; if there is it returns promise with q
		// otherwise (as in page refresh) it calls server with 
		// username from controller, cleans up response so 
		// contacts is already an array and hands promise back
		return {
			getContacts: function(){
				if(CacheService.get('contacts')){
					return $q.when(CacheService.get('contacts'));
				}
				else{
					var contacts = $http.get('/api/users/' + user + '/contacts')
						.then(function(response){
							CacheService.put('contacts', response.data.contacts);
							return response.data.contacts;
						});
					return contacts;
				}
			},
			addContact: function(newContact){
				var contact = $http.post('/api/users/' + user + '/contacts', newContact);
				contact.success(function(data){
					addToCachedContacts(data.contact); // api returns contact with id
					FlashService.setMessage(data.message);
				});
				contact.error(function(data){
					FlashService.showMessage(data.message);
				});
				return contact;
			},
			updateContact: function(id, updatedContact){
				var contact = $http.put('/api/users/' + user + '/contacts/' + id, updatedContact);
				contact.success(function(data){
					updateCachedContacts(id, data.contact);
					FlashService.setMessage(data.message);
				});
				contact.error(function(data){
					FlashService.showMessage(data.message);
				});
				return contact;
			},
			deleteContact: function(id){
				var contact = $http.delete('/api/users/' + user + '/contacts/' + id);
				contact.success(function(data){
					removeFromCachedContacts(id); // to build, remove by id
					FlashService.setMessage(data.message);
				});
				contact.error(function(data){
					FlashService.showMessage(data.message);
				});
				return contact;
			},
			getTags: function(){
				if(CacheService.get('tags')){
					return $q.when(CacheService.get('tags'));
				}
				else{
					var tags = $http.get('/api/users/' + user + '/tags')
						.then(function(response){
							CacheService.put('tags', response.data.tags);
							return response.data.tags;
						});
					return tags;
				}
			},
			addTag: function(newTag){
				var tag = $http.post('/api/users/' + user + '/tags', newTag);
				tag.success(function(data){
					addToCachedTags(newTag);
					FlashService.setMessage(data.message);
				});
				contact.error(function(data){
					FlashService.showMessage(data.message);
				});
				return tag;
			}
		};
	}
]);
// Controller for homepage
homeModule.controller('HomeCtrl', ['$scope', 'AuthService', '$location', 'DataService', '$stateParams', 'contactsObj',
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
			if($scope.contacts[i].firstName + '-' + $scope.contacts[i].lastName == $stateParams.contact){
				$scope.contact = $scope.contacts[i];
				break;
			}
		}

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
		};

		// update current contact
		$scope.updateContact = function(){
			DataService.updateContact($scope.contact.id, $scope.contact).success(function(){
				$location.path('/contact/' + $scope.contact.firstName + '-' + $scope.contact.lastName);
			});
		};

		// delete current contact
		$scope.deleteContact = function(){
			DataService.deleteContact($scope.contact.id).success(function(){
				$location.path('/');
			});
		};

		// on form submit, call AuthService's logout function
		// on success redirect to login page
		$scope.logout = function(){
			AuthService.logout().success(function(){
				$location.path('/login');
			});
		};
	}
]);
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
// Controller for registration page
registerModule.controller('RegisterCtrl', ['$scope', 'RegisterService', '$location',
	function($scope, RegisterService, $location){

		// initialize credentials object
		$scope.credentials = {};

		$scope.register = function(){
			RegisterService.registerUser($scope.credentials).success(function(){
				$location.path('/login');
			});
		};
	}
]);
// RegisterService posts to create user
registerModule.factory('RegisterService', ['$http', 'FlashService',
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