// CacheService is the custom cache where contacts will be stored
homeModule.factory('CacheService', ['$cacheFactory',
	function($cacheFactory){
		return $cacheFactory('customData');
	}
]);