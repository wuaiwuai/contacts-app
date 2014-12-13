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