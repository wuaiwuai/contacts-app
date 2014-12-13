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